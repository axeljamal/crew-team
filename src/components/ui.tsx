import type { ReactNode } from "react";
import type { Tile } from "@/lib/shape";

/** a white board with the thick outline and hard shadow of The Crew's signage */
export function Board({ children, className = "", as: As = "section", label }: { children: ReactNode; className?: string; as?: "section" | "article" | "div"; label?: string }) {
  return (
    <As aria-label={label} className={`board ${className}`}>
      {children}
    </As>
  );
}

export function StatTile({ tile }: { tile: Tile }) {
  return (
    <div className={`board m-0 flex flex-col gap-1 ${tile.alert ? "bg-gold-soft" : ""}`}>
      <dt className="text-[13px] font-semibold uppercase tracking-[0.08em] text-pearl-soft">{tile.label}</dt>
      <dd className="m-0 font-display text-[44px] font-bold leading-none tabular-nums">{tile.value}</dd>
      <dd className="m-0 text-[14px] text-pearl-soft">{tile.hint}</dd>
    </div>
  );
}

export function Tag({ children, gold = false }: { children: ReactNode; gold?: boolean }) {
  return <span className={`tag ${gold ? "bg-gold" : ""}`}>{children}</span>;
}

export function PageHead({ kicker, title, lead }: { kicker: string; title: string; lead?: ReactNode }) {
  return (
    <header className="mb-6">
      <p className="kicker">{kicker}</p>
      <h1 className="font-display text-[clamp(34px,5.5vw,52px)] font-bold leading-[1.05]">{title}</h1>
      {lead ? <p className="mt-3 max-w-[60ch] text-lg text-pearl-soft">{lead}</p> : null}
    </header>
  );
}

export function Quote({ children }: { children: ReactNode }) {
  return (
    <blockquote className="m-0 rounded-xl border-2 border-ink bg-mist px-4 py-2.5 text-[15px] before:content-['“'] after:content-['”']">
      {children}
    </blockquote>
  );
}
