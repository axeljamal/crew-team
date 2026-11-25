// Shown while a page's server components fetch from the team API.
export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="grid gap-4">
      <p className="m-0 font-semibold text-pearl-soft">Fetching the latest from the Crew…</p>
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))]" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="board h-[120px] motion-safe:animate-pulse !bg-mist" />
        ))}
      </div>
    </div>
  );
}
