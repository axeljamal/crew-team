// Reads the environment once. Plain functions with no Next imports, so tests can call them.

export type CrewConfig = { base: string; token: string | null; real: boolean };

export function readConfig(env: Record<string, string | undefined> = process.env): CrewConfig {
  const base = (env.CREW_API_BASE || "http://localhost:5288").replace(/\/+$/, "");
  const token = env.CREW_ADMIN_TOKEN?.trim() || null;
  return { base, token, real: env.CREW_REAL === "1" };
}

/**
 * The URL for one team route. Demo data unless CREW_REAL=1, so a public build can never show real members.
 * `path` is a route under /api/crew/team, such as "/health" or "/waves/abc".
 */
export function teamUrl(config: CrewConfig, path: string): string {
  const url = new URL(`/api/crew/team${path}`, config.base);
  if (!config.real) url.searchParams.set("demo", "1");
  return url.toString();
}

/** wave ids are D1 ids or seeded slugs; anything else never reaches the API */
export const isWaveId = (id: string) => /^[\w-]{1,80}$/.test(id);
