import Link from "next/link";

export default function NotFound() {
  return (
    <section className="board" aria-labelledby="nf-heading">
      <p className="kicker">Not here</p>
      <h1 id="nf-heading" className="mb-3 font-display text-3xl font-bold">
        No such page or wave
      </h1>
      <p>
        It may be a real wave on a demo build, which this view won&apos;t show. <Link href="/waves" className="link">See all waves</Link>.
      </p>
    </section>
  );
}
