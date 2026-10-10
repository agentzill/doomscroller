import { NextRequest, NextResponse } from "next/server";
import { IG_COOKIE, STATE_COOKIE, encodeSession, env, redirectUri } from "../../../../lib/instagram";

export async function GET(req: NextRequest) {
  const base = env("APP_URL").replace(/\/$/, "");
  const fail = (reason: string) => NextResponse.redirect(`${base}/?error=${encodeURIComponent(reason)}`);

  const params = req.nextUrl.searchParams;
  if (params.get("error")) return fail(params.get("error_description") ?? "Login was cancelled");

  const code = params.get("code")?.replace(/#_$/, "");
  const state = params.get("state");
  if (!code || !state || state !== req.cookies.get(STATE_COOKIE)?.value) {
    return fail("Invalid login state, please try again");
  }

  // 1. code -> short-lived token (valid ~1 hour)
  const shortRes = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env("INSTAGRAM_APP_ID"),
      client_secret: env("INSTAGRAM_APP_SECRET"),
      grant_type: "authorization_code",
      redirect_uri: redirectUri(),
      code,
    }),
  });
  if (!shortRes.ok) return fail(`Token exchange failed: ${await shortRes.text()}`);
  const short = (await shortRes.json()) as { access_token: string; user_id: number | string };

  // 2. short-lived -> long-lived token (valid 60 days). Needs the app secret, so server-side only.
  const longUrl = new URL("https://graph.instagram.com/access_token");
  longUrl.searchParams.set("grant_type", "ig_exchange_token");
  longUrl.searchParams.set("client_secret", env("INSTAGRAM_APP_SECRET"));
  longUrl.searchParams.set("access_token", short.access_token);
  const longRes = await fetch(longUrl);
  if (!longRes.ok) return fail(`Long-lived token exchange failed: ${await longRes.text()}`);
  const long = (await longRes.json()) as { access_token: string; expires_in: number };

  const res = NextResponse.redirect(`${base}/`);
  res.cookies.set(
    IG_COOKIE,
    encodeSession({
      token: long.access_token,
      userId: String(short.user_id),
      expiresAt: Date.now() + long.expires_in * 1000,
    }),
    { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: long.expires_in },
  );
  res.cookies.delete(STATE_COOKIE);
  return res;
}
