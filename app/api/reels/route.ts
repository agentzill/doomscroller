import { NextRequest, NextResponse } from "next/server";
import { IG_COOKIE, fetchReels, parseSession } from "../../../lib/instagram";

export async function GET(req: NextRequest) {
  const session = parseSession(req.cookies.get(IG_COOKIE)?.value);
  if (!session) return NextResponse.json({ error: "not_logged_in" }, { status: 401 });
  try {
    return NextResponse.json({ reels: await fetchReels(session.token) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
