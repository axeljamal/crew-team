import { describe, expect, it } from "vitest";
import { readConfig, teamUrl, isWaveId } from "./config";
import { bars, decimal, funnel, hangoutBars, healthTiles, moodRows, percent, reportCards, scoreSpread, shortDate, summarise, themeCounts } from "./shape";
import type { FeedbackItem, Health } from "./types";

const health: Health = {
  members: 14,
  joinedThisWeek: 5,
  activationRate: 0.429,
  returnRate7d: 0.556,
  feedbackPerTester: 1,
  openReports: 3,
  reportsPer100: 21.4,
};

const item = (id: string, theme: string | null, score = 3): FeedbackItem => ({
  id, score, liked: "", blocked: "", theme, mood: "mixed", tagged_by: "keywords", created_at: "2026-11-20T12:00:00Z",
});

describe("numbers", () => {
  it("formats rates, and shows a dash when there is nobody to count", () => {
    expect(percent(0.429)).toBe("43%");
    expect(percent(1)).toBe("100%");
    expect(percent(null)).toBe("–");
    expect(decimal(1)).toBe("1");
    expect(decimal(21.4)).toBe("21.4");
    expect(decimal(null)).toBe("–");
  });

  it("turns health into five tiles and flags open reports", () => {
    const tiles = healthTiles(health);
    expect(tiles.map((t) => t.value)).toEqual(["14", "43%", "56%", "1", "3"]);
    expect(tiles[0].hint).toBe("5 joined in the last 7 days");
    expect(tiles.find((t) => t.key === "reports")?.alert).toBe(true);
    expect(healthTiles({ ...health, openReports: 0, reportsPer100: null }).at(-1)).toMatchObject({ alert: false, hint: "no members yet" });
  });
});

describe("bars", () => {
  it("sorts biggest first, breaks ties by label, drops zeros and scales to the largest", () => {
    const rows = bars({ b: 2, a: 2, c: 4, d: 0 });
    expect(rows.map((r) => r.key)).toEqual(["c", "a", "b"]);
    expect(rows.map((r) => r.share)).toEqual([1, 0.5, 0.5]);
  });

  it("names the places members hang out", () => {
    expect(hangoutBars({ tiktok: 5, discord: 5, youtube: 4, somewhere_else: 1 }).map((r) => r.label)).toEqual([
      "Discord", "TikTok", "YouTube", "Somewhere else",
    ]);
  });

  it("rounds the activated count back from the rate", () => {
    expect(funnel(health).map((r) => r.count)).toEqual([14, 5, 6]);
    expect(funnel({ ...health, members: 0, joinedThisWeek: 0, activationRate: null }).every((r) => r.share === 0)).toBe(true);
  });

  it("summarises a chart as text", () => {
    expect(summarise(bars({ discord: 2, reddit: 1 }), "places")).toBe("Discord: 2, Reddit: 1.");
    expect(summarise([], "places")).toBe("No places yet.");
  });
});

describe("waves", () => {
  it("counts every tagged response by theme, skipping untagged ones", () => {
    const rows = themeCounts([item("1", "controls"), item("2", "controls"), item("3", "onboarding"), item("4", null)]);
    expect(rows.map((r) => [r.label, r.count])).toEqual([["Controls", 2], ["Getting started", 1]]);
  });

  it("keeps moods in a fixed order with shares of the whole", () => {
    const rows = moodRows({ positive: 2, mixed: 5, negative: 2 });
    expect(rows.map((r) => r.key)).toEqual(["positive", "mixed", "negative"]);
    expect(rows[1].share).toBeCloseTo(5 / 9);
    expect(moodRows({}).every((r) => r.count === 0 && r.share === 0)).toBe(true);
  });

  it("spreads scores into five buckets and ignores out-of-range ones", () => {
    const rows = scoreSpread([item("1", "x", 5), item("2", "x", 5), item("3", "x", 1), item("4", "x", 9)]);
    expect(rows.map((r) => r.count)).toEqual([1, 0, 0, 0, 2]);
    expect(rows[4].share).toBe(1);
  });
});

describe("reports", () => {
  it("splits the grouped reasons and notes back into lists", () => {
    const [card] = reportCards([
      {
        id: "r1", created_at: "2026-11-25T12:26:00Z", target_type: "post", target_id: "p6", reports: 3,
        reason: "spam,unkind", note: "Looks like a scam link. · Rude too", target_text: " Free boats! ", author: "Coral Compass",
      },
    ]);
    expect(card).toMatchObject({ kind: "Deck post", reasons: ["Spam", "Unkind"], notes: ["Looks like a scam link.", "Rude too"], text: "Free boats!" });
  });

  it("copes with a target that has gone", () => {
    const [card] = reportCards([
      { id: "r2", created_at: "", target_type: "feedback", target_id: "f1", reports: 1, reason: null, note: null, target_text: null, author: null },
    ]);
    expect(card).toMatchObject({ kind: "Playtest feedback", reasons: [], notes: [], text: "(the reported item is gone)", author: "Unknown member" });
  });

  it("writes dates the UK way, in UTC", () => {
    expect(shortDate("2026-11-25T23:30:00Z")).toBe("25 Nov 2026");
    expect(shortDate("not a date")).toBe("");
  });
});

describe("config", () => {
  it("asks for demo data unless CREW_REAL=1", () => {
    const demo = readConfig({ CREW_API_BASE: "https://example.test/" });
    expect(teamUrl(demo, "/health")).toBe("https://example.test/api/crew/team/health?demo=1");
    const real = readConfig({ CREW_API_BASE: "https://example.test", CREW_REAL: "1", CREW_ADMIN_TOKEN: " t " });
    expect(teamUrl(real, "/reports")).toBe("https://example.test/api/crew/team/reports");
    expect(real.token).toBe("t");
    expect(readConfig({ CREW_REAL: "true" }).real).toBe(false);
  });

  it("only lets plain wave ids through", () => {
    expect(isWaveId("demo-wave-01")).toBe(true);
    expect(isWaveId("../reports")).toBe(false);
    expect(isWaveId("")).toBe(false);
  });
});
