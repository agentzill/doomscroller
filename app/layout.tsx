import type { ReactNode } from "react";

export const metadata = { title: "Doomscroller" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#121212", color: "#fff" }}>
        {children}
      </body>
    </html>
  );
}
