import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { STATE_COOKIE, env, redirectUri } from "../../../../lib/instagram";

export async function GET() {
  const state = randomBytes(16).toString("hex");
  const url = new URL("https://www.instagram.com/oauth/authorize");
  url.searchParams.set("client_id", env("INSTAGRAM_APP_ID"));
  url.searchParams.set("redirect_uri", redirectUri());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "instagram_business_basic");
  url.searchParams.set("state", state);

  const res = NextResponse.redirect(url);
  res.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}
