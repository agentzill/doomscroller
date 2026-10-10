import { cookies } from "next/headers";
import { IG_COOKIE, fetchReels, parseSession, type MediaResult } from "../lib/instagram";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const session = parseSession((await cookies()).get(IG_COOKIE)?.value);

  let result: MediaResult = { reels: [], totalPosts: 0, byType: {} };
  let fetchError: string | null = null;
  if (session) {
    try {
      result = await fetchReels(session.token);
    } catch (e) {
      fetchError = (e as Error).message;
    }
  }

  return (
    <main style={{ maxWidth: 420, margin: "0 auto", padding: 20 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 18 }}>Doomscroller</h1>
        {session && (
          <a href="/api/auth/logout" style={{ color: "#60a5fa", fontSize: 14 }}>
            Log out
          </a>
        )}
      </header>

      {(error || fetchError) && (
        <p style={{ color: "#f87171", fontSize: 13 }}>{error ?? fetchError}</p>
      )}

      {!session ? (
        <a
          href="/api/auth/login"
          style={{
            display: "block",
            marginTop: 40,
            padding: "14px 16px",
            textAlign: "center",
            background: "#3b82f6",
            color: "#fff",
            borderRadius: 10,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Log in with Instagram
        </a>
      ) : result.reels.length === 0 && !fetchError ? (
        <div style={{ color: "#b0b0b0", fontSize: 14, lineHeight: 1.5 }}>
          <p>No Reels found on this account.</p>
          <p style={{ fontSize: 12, color: "#808080" }}>
            Instagram returned {result.totalPosts} published post{result.totalPosts === 1 ? "" : "s"}
            {result.totalPosts > 0 &&
              ` (${Object.entries(result.byType)
                .map(([t, n]) => `${n} ${t.toLowerCase()}`)
                .join(", ")})`}
            . Only Reels this account has published appear here, not the Reels feed you scroll.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
          {result.reels.map((r) => (
            <article key={r.id} style={{ background: "#1e1e1e", borderRadius: 12, overflow: "hidden" }}>
              {r.thumbnail_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.thumbnail_url} alt="" style={{ width: "100%", height: 280, objectFit: "cover" }} />
              )}
              <div style={{ padding: 12 }}>
                <p style={{ fontSize: 13, margin: "0 0 8px" }}>{r.caption ?? "(no caption)"}</p>
                <a href={r.permalink} target="_blank" rel="noreferrer" style={{ color: "#60a5fa", fontSize: 13 }}>
                  Open on Instagram
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
