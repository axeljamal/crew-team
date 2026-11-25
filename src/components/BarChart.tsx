import type { Bar } from "@/lib/shape";
import { summarise } from "@/lib/shape";

type Props = {
  title: string;
  rows: Bar[];
  unit: string; // what is counted, for the text summary ("members", "responses")
  tone?: "blue" | "mood";
  headingLevel?: 2 | 3;
};

const MOOD_FILL: Record<string, string> = { positive: "bg-sea", mixed: "bg-gold", negative: "bg-red" };

/**
 * A horizontal bar chart in plain HTML: each bar carries its label and count as text,
 * and the caption repeats the whole chart as one sentence, so nothing depends on seeing the bars.
 */
export function BarChart({ title, rows, unit, tone = "blue", headingLevel = 3 }: Props) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <figure className="m-0">
      <Heading className="font-display text-xl font-bold mb-3">{title}</Heading>
      {rows.length ? (
        <ul className="m-0 grid list-none gap-2.5 p-0" aria-hidden="true">
          {rows.map((r) => (
            <li key={r.key} className="grid grid-cols-[minmax(7rem,11rem)_1fr_2.5rem] items-center gap-3">
              <span className="text-[15px] font-semibold leading-tight">{r.label}</span>
              <span className="h-5 rounded-md border-2 border-ink bg-mist">
                <span
                  className={`block h-full rounded-[4px] ${tone === "mood" ? MOOD_FILL[r.key] ?? "bg-blue" : "bg-blue"}`}
                  style={{ width: `${Math.max(r.share * 100, r.count ? 4 : 0)}%` }}
                />
              </span>
              <span className="text-right font-bold tabular-nums">{r.count}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <figcaption className={rows.length ? "sr" : "text-pearl-soft"}>{summarise(rows, unit)}</figcaption>
    </figure>
  );
}
