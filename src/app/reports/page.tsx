import type { Metadata } from "next";
import { connection } from "next/server";
import { Board, PageHead, Quote, Tag } from "@/components/ui";
import { getReports } from "@/lib/crew-api";
import { reportCards, shortDate } from "@/lib/shape";

export const metadata: Metadata = { title: "Reports" };

export default async function ReportsPage() {
  await connection();
  const { reports } = await getReports();
  const cards = reportCards(reports);

  return (
    <>
      <PageHead
        kicker="Moderation"
        title="Open reports"
        lead="Anything a member reported as unkind, unsafe or spam, most-reported first. This view is read-only: keep, hide or remove from the team pages inside The Crew itself."
      />
      {cards.length ? (
        <ul className="m-0 grid list-none gap-5 p-0">
          {cards.map((c) => (
            <li key={c.id}>
              <Board as="article" className="grid gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Tag>{c.kind}</Tag>
                  {c.reasons.map((r) => (
                    <Tag key={r} gold>
                      {r}
                    </Tag>
                  ))}
                  <span className="ml-auto font-semibold">
                    {c.reports} {c.reports === 1 ? "report" : "reports"}
                  </span>
                </div>
                <h2 className="m-0 font-display text-xl font-bold">By {c.author}</h2>
                <Quote>{c.text}</Quote>
                {c.notes.length ? (
                  <div>
                    <h3 className="mb-1 text-[15px] font-semibold">What reporters said</h3>
                    <ul className="m-0 list-disc pl-5 text-pearl-soft">
                      {c.notes.map((n) => (
                        <li key={n}>{n}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <p className="m-0 text-sm text-pearl-soft">Last reported {shortDate(c.lastReported)}</p>
              </Board>
            </li>
          ))}
        </ul>
      ) : (
        <Board>
          <p className="m-0">The queue is clear. Nothing is waiting for a decision.</p>
        </Board>
      )}
    </>
  );
}
