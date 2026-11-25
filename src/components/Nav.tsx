"use client";
// The only client component: it needs the current path to mark the open page with aria-current.
// The layout wraps it in <Suspense> with <NavLinks path={null} /> as the fallback, because the path of a
// dynamic route (/waves/[id]) is only known at request time.
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Overview" },
  { href: "/waves", label: "Waves" },
  { href: "/reports", label: "Reports" },
];

export function NavLinks({ path }: { path: string | null }) {
  return (
    <nav aria-label="Team view">
      <ul className="m-0 flex list-none flex-wrap gap-2.5 p-0">
        {LINKS.map((l) => {
          const current = path !== null && (l.href === "/" ? path === "/" : path.startsWith(l.href));
          return (
            <li key={l.href}>
              <Link href={l.href} aria-current={current ? "page" : undefined} className={`btn ${current ? "" : "ghost"}`}>
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function Nav() {
  return <NavLinks path={usePathname()} />;
}
