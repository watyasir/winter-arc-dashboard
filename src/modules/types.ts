import type { Tone } from "@/lib/tones";

/*
  The shape of everything the dashboard shows. /demo fills it with fake data
  (src/data/demo); from Phase 3 the real dashboard fills it from Supabase.
*/

export type ViewId = "overview" | "inbox" | "board" | "instinct";

export type SeasonDay = "all" | "most" | "missed" | "today" | "upcoming";

export type Owner = "Me" | "Claude" | "Both";

export interface Mail {
  id: string;
  from: string;
  subject: string;
  time: string;
  label: string;
  box: string;
  unread: boolean;
  loggedByClaude?: boolean;
  body: string;
  claudeNote: string;
}

export interface BoardCard {
  title: string;
  owner: Owner;
  area: string;
  due?: string;
  /** "soon" = within 3 days (peach), "overdue" = past due (red). */
  dueState?: "soon" | "overdue";
  done?: boolean;
}

export interface DashboardData {
  ownerLine: string;
  views: Record<ViewId, { title: string; subtitle: string }>;
  navBadges: Partial<Record<ViewId, string>>;
  trackers: { label: string; done: boolean; value: string }[];
  season: {
    name: string;
    length: number;
    day: number;
    streak: number;
    targetsHitPct: number;
    bestStreak: number;
    missed: number;
    startLabel: string;
    endLabel: string;
    days: SeasonDay[];
  };
  stats: { label: string; value: string; unit: string; note: string; tone: Tone; trend: number[] }[];
  today: { label: string; area: string; done: boolean }[];
  money: {
    month: string;
    updated: string;
    income: number;
    spent: number;
    split: { needs: number; wants: number; savings: number };
    fund: { name: string; pct: number; target: number };
  };
  weight: {
    unit: string;
    goal: number;
    rangeLabel: string;
    startLabel: string;
    /** One reading per week, oldest first. */
    values: number[];
    /** Y axis bottom and top. */
    axis: [number, number];
  };
  goals: { name: string; progress: string; pct: number; by: string; tone: Tone }[];
  habits: { name: string; days: boolean[] }[];
  mailboxes: { label: string; tone: Tone; count: string }[];
  mailboxNote: string;
  mails: Mail[];
  board: { name: string; tone: Tone; count: string; cards: BoardCard[] }[];
  instinct: {
    draftQuestion: string;
    exchanges: { question: string; answer: string; meta: string; status: "answered" | "paused" }[];
    shares: { key: string; label: string; on: boolean }[];
    digest: string;
  };
  footnote: string;
}
