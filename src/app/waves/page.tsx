import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Board, PageHead, Tag } from "@/components/ui";
import { getWaves } from "@/lib/crew-api";
import { shortDate } from "@/lib/shape";

export const metadata: Metadata = { title: "Waves" };

export default async function WavesPage() {
  await connection();
  const { waves } = await getWaves();

  return (
    <>
      <PageHead
        kicker="Playtest waves"
        title="Each build, in one page"
        lead="A wave is one build put in front of the Crew. Open a wave for its brief: how it scored, how people felt, and what to fix first."
      />
      {waves.length ? (
        <ul className="m-0 grid list-none gap-5 p-0">
          {waves.map((w) => (
            <li key={w.id}>
              <Board as="article" className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="mb-1 font-display text-2xl font-bold">
                    <Link href={`/waves/${w.id}`} className="link">
                      {w.title}
                    </Link>
                  </h2>
                  <p className="m-0 text-pearl-soft">
                    {w.build} <span aria-hidden="true">·</span> started {shortDate(w.created_at)}
                  </p>
                  <p className="mb-0 mt-3 max-w-[60ch]">{w.ask}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Tag gold={w.status === "open"}>{w.status === "open" ? "Open" : "Closed"}</Tag>
                  <p className="m-0 font-display text-3xl font-bold tabular-nums">
                    {w.responses}
                    <span className="ml-1.5 font-sans text-base font-medium text-pearl-soft">{w.responses === 1 ? "response" : "responses"}</span>
                  </p>
                </div>
              </Board>
            </li>
          ))}
        </ul>
      ) : (
        <Board>
          <p className="m-0">No waves yet. A wave appears here once the team opens a playtest.</p>
        </Board>
      )}
    </>
  );
}
