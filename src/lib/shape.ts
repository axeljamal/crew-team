// Pure functions that turn API rows into what the pages show. No fetching here, so each one is easy to test.
import type { FeedbackItem, Health, Mood, Report } from "./types";

// the same labels as src/crew/logic/tagging.ts in the portfolio repo
export const THEME_LABELS: Record<string, string> = {
  building: "Building the boat",
  sailing: "Sailing feel",
  controls: "Controls",
  difficulty: "Difficulty",
  looks: "Looks",
  sound: "Sound",
  performance: "Speed and loading",
  onboarding: "Getting started",
  bugs: "Bugs",
  other: "Other",
};

export const MOOD_ORDER: Mood[] = ["positive", "mixed", "negative"];
export const MOOD_LABELS: Record<Mood, string> = { positive: "Positive", mixed: "Mixed", negative: "Negative" };

const PLACE_LABELS: Record<string, string> = {
  discord: "Discord",
  reddit: "Reddit",
  tiktok: "TikTok",
  twitch: "Twitch",
  youtube: "YouTube",
  instagram: "Instagram",
  x: "X",
  bluesky: "Bluesky",
  steam: "Steam",
};

/** 0.429 -> "43%"; null (nobody to count yet) -> "–" */
export function percent(rate: number | null): string {
  return rate === null || !Number.isFinite(rate) ? "–" : `${Math.round(rate * 100)}%`;
}

/** a number that may be missing, with one decimal at most */
export function decimal(n: number | null): string {
  if (n === null || !Number.isFinite(n)) return "–";
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

export type Tile = { key: string; label: string; value: string; hint: string; alert?: boolean };

/** the health numbers as stat tiles, each with a one-line meaning */
export function healthTiles(h: Health): Tile[] {
  return [
    { key: "members", label: "Members", value: String(h.members), hint: `${h.joinedThisWeek} joined in the last 7 days` },
    { key: "activation", label: "Activated", value: percent(h.activationRate), hint: "finished every welcome quest" },
    { key: "return", label: "Came back", value: percent(h.returnRate7d), hint: "seen again a week or more after joining" },
    { key: "feedback", label: "Feedback per tester", value: decimal(h.feedbackPerTester), hint: "responses from each member who gave any" },
    {
      key: "reports",
      label: "Open reports",
      value: String(h.openReports),
      hint: h.reportsPer100 === null ? "no members yet" : `${decimal(h.reportsPer100)} reports per 100 members, all time`,
      alert: h.openReports > 0,
    },
  ];
}

export type Bar = { key: string; label: string; count: number; share: number };

/** counts as bars, biggest first (ties by label), each with its share of the largest bar for drawing */
export function bars(counts: Record<string, number>, labels: Record<string, string> = {}): Bar[] {
  const rows = Object.entries(counts)
    .filter(([, n]) => Number.isFinite(n) && n > 0)
    .map(([key, count]) => ({ key, label: labels[key] ?? titleCase(key), count }));
  rows.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  const max = rows[0]?.count ?? 0;
  return rows.map((r) => ({ ...r, share: max ? r.count / max : 0 }));
}

export const hangoutBars = (hangouts: Record<string, number>) => bars(hangouts, PLACE_LABELS);

/**
 * The welcome funnel from the health snapshot: members, then how many finished the quests.
 * The API returns a rate, not a count, so the count is rounded back from it.
 */
export function funnel(h: Health): Bar[] {
  const activated = h.activationRate === null ? 0 : Math.round(h.activationRate * h.members);
  const rows = [
    { key: "members", label: "Joined", count: h.members },
    { key: "new", label: "Joined this week", count: h.joinedThisWeek },
    { key: "activated", label: "Finished welcome quests", count: activated },
  ];
  const max = h.members;
  return rows.map((r) => ({ ...r, share: max ? r.count / max : 0 }));
}

/** a sentence that says what a bar chart shows, for screen readers and anyone skimming */
export function summarise(rows: Bar[], unit: string): string {
  if (!rows.length) return `No ${unit} yet.`;
  return rows.map((r) => `${r.label}: ${r.count}`).join(", ") + ".";
}

/** every tagged response counted by theme, so the brief shows the whole spread, not just the top three */
export function themeCounts(items: FeedbackItem[]): Bar[] {
  const counts: Record<string, number> = {};
  for (const f of items) if (f.theme) counts[f.theme] = (counts[f.theme] ?? 0) + 1;
  return bars(counts, THEME_LABELS);
}

/** moods in a fixed order (positive, mixed, negative) with shares of all responses */
export function moodRows(moods: Partial<Record<Mood, number>>): Bar[] {
  const total = MOOD_ORDER.reduce((n, m) => n + (moods[m] ?? 0), 0);
  return MOOD_ORDER.map((m) => ({ key: m, label: MOOD_LABELS[m], count: moods[m] ?? 0, share: total ? (moods[m] ?? 0) / total : 0 }));
}

/** scores 1 to 5 as a histogram */
export function scoreSpread(items: FeedbackItem[]): Bar[] {
  const counts = [0, 0, 0, 0, 0];
  for (const f of items) if (f.score >= 1 && f.score <= 5) counts[Math.round(f.score) - 1] += 1;
  const max = Math.max(...counts);
  return counts.map((count, i) => ({ key: String(i + 1), label: `${i + 1} out of 5`, count, share: max ? count / max : 0 }));
}

export type ReportCard = {
  id: string;
  kind: string;
  reports: number;
  reasons: string[];
  notes: string[];
  text: string;
  author: string;
  lastReported: string;
};

/** the grouped report rows, with GROUP_CONCAT strings split back into lists */
export function reportCards(rows: Report[]): ReportCard[] {
  return rows.map((r) => ({
    id: r.id,
    kind: r.target_type === "feedback" ? "Playtest feedback" : "Deck post",
    reports: r.reports,
    reasons: (r.reason ?? "").split(",").map((s) => s.trim()).filter(Boolean).map(titleCase),
    notes: (r.note ?? "").split(" · ").map((s) => s.trim()).filter(Boolean),
    text: r.target_text?.trim() || "(the reported item is gone)",
    author: r.author ?? "Unknown member",
    lastReported: r.created_at,
  }));
}

/** "25 Nov 2026" in UK style, in UTC so server and tests agree */
export function shortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

function titleCase(s: string) {
  return s.replace(/[-_]+/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}
