import type { Metadata } from "next";
import { Fredoka } from "next/font/google";
import { Suspense } from "react";
import { Nav, NavLinks } from "@/components/Nav";
import { readConfig } from "@/lib/config";
import "./globals.css";

const fredoka = Fredoka({ variable: "--font-fredoka", subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: { default: "The Crew · Team view", template: "%s · The Crew · Team view" },
  description: "The team side of The Crew: community health, playtest briefs and the report queue.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const { real } = readConfig();
  return (
    <html lang="en-GB" className={fredoka.variable}>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:m-3 focus:inline-block focus:rounded-lg focus:bg-gold focus:px-3 focus:py-2 focus:font-bold">
          Skip to content
        </a>
        <div className="mx-auto max-w-[1080px] px-4 pb-16 pt-6 sm:px-6">
          <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="m-0 font-display text-2xl font-bold leading-tight">
                The Crew <span aria-hidden="true">·</span> <span className="text-blue">Team view</span>
              </p>
              <p className="m-0 text-sm text-pearl-soft">For the people running playtests for Pinisi Yard.</p>
            </div>
            <Suspense fallback={<NavLinks path={null} />}>
              <Nav />
            </Suspense>
          </header>
          {!real ? (
            <p role="note" className="board mb-8 flex flex-wrap items-center gap-3 !bg-gold-soft !py-3">
              <span className="tag bg-gold">Demo data</span>
              <span>Everything here is seeded sample data, not real members. Set CREW_REAL=1 on a private deploy to see live numbers.</span>
            </p>
          ) : null}
          <main id="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
