// Shapes returned by The Crew's team API (worker/crew.ts in the portfolio repo).
// Kept by hand: this app only reads, so a copy of the few fields it uses is enough.

export type Health = {
  members: number;
  joinedThisWeek: number;
  activationRate: number | null; // share of members who finished every welcome quest
  returnRate7d: number | null; // of members who joined 7+ days ago, share seen again 7+ days after joining
  feedbackPerTester: number | null; // feedback items per member who gave any
  openReports: number;
  reportsPer100: number | null; // all reports per 100 members
};

export type HealthResponse = { health: Health; hangouts: Record<string, number>; demo: boolean };

export type Wave = {
  id: string;
  title: string;
  build: string;
  ask: string;
  play_url: string;
  status: "open" | "closed" | string;
  created_at: string;
  responses: number;
};

export type WavesResponse = { waves: Wave[] };

export type Mood = "positive" | "mixed" | "negative";

export type BriefTheme = { theme: string; label: string; players: number; quotes: string[] };

export type Brief = {
  responses: number;
  averageScore: number | null;
  moods: Record<Mood, number>;
  fixFirst: BriefTheme[];
  keep: BriefTheme[];
};

export type FeedbackItem = {
  id: string;
  score: number;
  liked: string;
  blocked: string;
  theme: string | null;
  mood: Mood | null;
  tagged_by: string | null;
  created_at: string;
};

export type WaveBriefResponse = { brief: Brief; byModel: number; items: FeedbackItem[] };

export type Report = {
  id: string;
  created_at: string;
  target_type: "post" | "feedback" | string;
  target_id: string;
  reports: number;
  reason: string | null; // comma-joined distinct reasons (GROUP_CONCAT)
  note: string | null; // " · "-joined notes
  target_text: string | null;
  author: string | null;
};

export type ReportsResponse = { reports: Report[] };
