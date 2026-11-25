// The only place that talks to The Crew's team API. Server-only: the admin token is read from the environment
// here and sent from the server, so it never reaches the browser bundle or the page HTML.
import "server-only";
import { isWaveId, readConfig, teamUrl } from "./config";
import type { HealthResponse, ReportsResponse, WaveBriefResponse, WavesResponse } from "./types";

export class CrewApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "CrewApiError";
  }
}

async function getTeam<T>(path: string): Promise<T> {
  const config = readConfig();
  const headers: HeadersInit = { Accept: "application/json" };
  if (config.token) headers.Authorization = `Bearer ${config.token}`;

  let res: Response;
  try {
    res = await fetch(teamUrl(config, path), { headers, cache: "no-store" }); // fresh each request: a small team, a quick API
  } catch {
    throw new CrewApiError(502, "The team API could not be reached. Is CREW_API_BASE right, and is the server running?");
  }
  if (res.status === 401) throw new CrewApiError(401, "The team API said no. Set CREW_ADMIN_TOKEN, or run the API on localhost with the dev bypass.");
  if (!res.ok) throw new CrewApiError(res.status, `The team API answered ${res.status}.`);
  return (await res.json()) as T;
}

export const getHealth = () => getTeam<HealthResponse>("/health");
export const getWaves = () => getTeam<WavesResponse>("/waves");
export const getReports = () => getTeam<ReportsResponse>("/reports");

/**
 * One wave's brief, or null when the id is not one of the listed waves.
 * The brief route itself does not filter by demo, so checking the id against the (demo-filtered) list first
 * keeps a public build from showing a real wave to anyone who guesses its id.
 */
export async function getWaveBrief(id: string) {
  if (!isWaveId(id)) return null;
  const { waves } = await getWaves();
  const wave = waves.find((w) => w.id === id);
  if (!wave) return null;
  const brief = await getTeam<WaveBriefResponse>(`/waves/${encodeURIComponent(id)}`);
  return { wave, ...brief };
}
