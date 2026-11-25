import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { BarChart } from "@/components/BarChart";
import { Board, PageHead, Quote, Tag } from "@/components/ui";
import { getWaveBrief } from "@/lib/crew-api";
import { decimal, moodRows, scoreSpread, shortDate, themeCounts } from "@/lib/shape";
import type { BriefTheme } from "@/lib/types";

export const metadata: Metadata = { title: "Wave brief" };

export default async function WaveBriefPage({ params }: PageProps<"/waves/[id]">) {
  await connection();
  const { id } = await params;
  const data = await getWaveBrief(id);
  if (!data) notFound();
  const { wave, brief, byModel, items } = data;

  return (
    <>
      <p className="mb-4">
        <Link href="/waves" className="link">
          <span aria-hidden="true">← </span>All waves
        </Link>
      </p>
      <PageHead
        kicker={`Wave brief · ${wave.build}`}
        title={wave.title}
        lead={
          <>
            {wave.ask} <span className="whitespace-nowrap">Started {shortDate(wave.created_at)}.</span>
          </>
        }
      />

      <section aria-labelledby="score-heading" className="mb-8">
        <h2 id="score-heading" className="sr-only">
          Score
        </h2>
        <dl className="m-0 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))]">
          <div className="board m-0">
            <dt className="text-[13px] font-semibold uppercase tracking-[0.08em] text-pearl-soft">Responses</dt>
            <dd className="m-0 font-display text-[44px] font-bold leading-none tabular-nums">{brief.responses}</dd>
          </div>
          <div className="board m-0">
            <dt className="text-[13px] font-semibold uppercase tracking-[0.08em] text-pearl-soft">Average score</dt>
            <dd className="m-0 font-display text-[44px] font-bold leading-none tabular-nums">
              {decimal(brief.averageScore)}
              <span className="ml-1 font-sans text-lg font-medium text-pearl-soft">out of 5</span>
            </dd>
          </div>
          <div className="board m-0">
            <dt className="text-[13px] font-semibold uppercase tracking-[0.08em] text-pearl-soft">Tagged by</dt>
            <dd className="m-0 mt-1 text-[15px]">
              {byModel ? `${byModel} by the model, ` : ""}
              {brief.responses - byModel} by keyword
            </dd>
          </div>
        </dl>
      </section>

      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <Board label="Moods">
          <BarChart title="How players felt" rows={moodRows(brief.moods)} unit="responses" tone="mood" headingLevel={2} />
        </Board>
        <Board label="Scores">
          <BarChart title="Scores" rows={scoreSpread(items)} unit="responses" headingLevel={2} />
        </Board>
      </div>

      <ThemeList
        id="fix"
        title="Fix these first"
        intro="Ranked by how many players hit the problem and how unhappy they were. Quotes are what got in their way."
        themes={brief.fixFirst}
        empty="Nothing got in anyone's way. A good wave."
        gold
      />
      <ThemeList
        id="keep"
        title="Keep these"
        intro="What felt good to players who were happy overall."
        themes={brief.keep}
        empty="No clear favourites yet."
      />

      <Board label="Every theme">
        <BarChart title="Every response by theme" rows={themeCounts(items)} unit="responses" headingLevel={2} />
        <p className="mb-0 mt-4 text-sm text-pearl-soft">Each response gets one theme, from what got in the way first and what felt good second.</p>
      </Board>
    </>
  );
}

function ThemeList({ id, title, intro, themes, empty, gold = false }: { id: string; title: string; intro: string; themes: BriefTheme[]; empty: string; gold?: boolean }) {
  return (
    <section aria-labelledby={`${id}-heading`} className="mb-8">
      <h2 id={`${id}-heading`} className="mb-1 font-display text-[clamp(24px,3.4vw,32px)] font-bold">
        {title}
      </h2>
      <p className="mb-4 text-pearl-soft">{intro}</p>
      {themes.length ? (
        <ol className="m-0 grid list-none gap-4 p-0 md:grid-cols-3">
          {themes.map((t, i) => (
            <li key={t.theme} className="board flex flex-col gap-3">
              <h3 className="m-0 flex items-center gap-2 font-display text-xl font-bold">
                {gold ? <Tag gold>{i + 1}</Tag> : null}
                {t.label}
              </h3>
              <p className="m-0 text-pearl-soft">
                {t.players} {t.players === 1 ? "player" : "players"}
              </p>
              {t.quotes.map((q) => (
                <Quote key={q}>{q}</Quote>
              ))}
            </li>
          ))}
        </ol>
      ) : (
        <p className="board m-0">{empty}</p>
      )}
    </section>
  );
}
