import { NextResponse } from "next/server";
import { IG_COOKIE, env } from "../../../../lib/instagram";

export async function GET() {
  const res = NextResponse.redirect(`${env("APP_URL").replace(/\/$/, "")}/`);
  res.cookies.delete(IG_COOKIE);
  return res;
}
