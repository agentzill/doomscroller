import { cookies } from "next/headers";
import { IG_COOKIE, fetchReels, parseSession, type Reel } from "../lib/instagram";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const session = parseSession((await cookies()).get(IG_COOKIE)?.value);

  let reels: Reel[] = [];
  let fetchError: string | null = null;
  if (session) {
    try {
      reels = await fetchReels(session.token);
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
      ) : reels.length === 0 && !fetchError ? (
        <p style={{ color: "#b0b0b0" }}>No Reels found on this account yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
          {reels.map((r) => (
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
