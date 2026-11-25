import { connection } from "next/server";
import { BarChart } from "@/components/BarChart";
import { Board, PageHead, StatTile } from "@/components/ui";
import { getHealth } from "@/lib/crew-api";
import { funnel, hangoutBars, healthTiles } from "@/lib/shape";

export default async function OverviewPage() {
  await connection(); // read at request time, not at build, so a build never needs the API
  const { health, hangouts } = await getHealth();
  const tiles = healthTiles(health);

  return (
    <>
      <PageHead
        kicker="Overview"
        title="How the Crew is doing"
        lead="Five numbers the team can act on: who joined, who got through the welcome quests, who came back, how much they test, and what needs a look."
      />

      <section aria-labelledby="health-heading" className="mb-10">
        <h2 id="health-heading" className="sr-only">
          Health numbers
        </h2>
        <dl className="m-0 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))]">
          {tiles.map((t) => (
            <StatTile key={t.key} tile={t} />
          ))}
        </dl>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <Board label="Welcome funnel">
          <BarChart title="From joining to finishing the welcome quests" rows={funnel(health)} unit="members" headingLevel={2} />
          <p className="mb-0 mt-4 text-sm text-pearl-soft">
            A snapshot of today. The API gives totals rather than sign-ups by day, so there is no trend line yet.
          </p>
        </Board>
        <Board label="Where members hang out">
          <BarChart title="Where members hang out" rows={hangoutBars(hangouts)} unit="places" headingLevel={2} />
          <p className="mb-0 mt-4 text-sm text-pearl-soft">Members can pick more than one place when they join.</p>
        </Board>
      </div>
    </>
  );
}
