export const IG_COOKIE = "ig_session";
export const STATE_COOKIE = "ig_oauth_state";

export function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var ${name}`);
  return v;
}

export function redirectUri(): string {
  return `${env("APP_URL").replace(/\/$/, "")}/api/auth/callback`;
}

export type Session = { token: string; userId: string; expiresAt: number };

export type Reel = {
  id: string;
  caption?: string;
  media_type: string;
  media_product_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
};

export function parseSession(raw: string | undefined): Session | null {
  if (!raw) return null;
  try {
    const s = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as Session;
    if (!s.token || !s.userId || s.expiresAt < Date.now()) return null;
    return s;
  } catch {
    return null;
  }
}

export function encodeSession(s: Session): string {
  return Buffer.from(JSON.stringify(s), "utf8").toString("base64url");
}

export async function fetchReels(token: string): Promise<Reel[]> {
  const fields =
    "id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp";
  const url = `https://graph.instagram.com/me/media?fields=${fields}&limit=50&access_token=${encodeURIComponent(token)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Instagram media fetch failed (${res.status}): ${await res.text()}`);
  }
  const json = (await res.json()) as { data: Reel[] };
  return json.data.filter((m) => m.media_product_type === "REELS");
}
