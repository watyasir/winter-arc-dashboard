import type { Tone } from "@/lib/tones";
import type { NewTask, Owner, Task, TaskStatus } from "@/lib/tasks";

export type { Owner, Task };

/*
  The shape of everything the dashboard shows. /demo fills it with fake data
  (src/data/demo); from Phase 3 the real dashboard fills it from Supabase.
*/

export type ViewId = "overview" | "arc" | "inbox" | "board" | "instinct";

export type SeasonDay = "all" | "most" | "missed" | "today" | "upcoming";

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

/** One bank account or card in the Money wallet stack. Card balances are negative (amount owed). */
export interface Account {
  id: string;
  name: string;
  kind: "savings" | "current" | "card" | "other";
  balance: number;
  /** Cards only: next bill due date, e.g. "5 Nov". */
  due?: string;
  /** Latest first. Positive = money in. */
  transactions: { label: string; date: string; amount: number }[];
}

/** One row in the Today checklist (desktop) and Focus list (phone). */
export interface TodayItem {
  label: string;
  /** Right-hand text: the area on the demo, today's value on the real dashboard. */
  area: string;
  done: boolean;
  /** Real dashboard: a yes/no tracker the row saves when tapped. */
  trackerId?: string;
  /** Real dashboard: number trackers open the check-in instead of toggling. */
  href?: string;
}

/** Saves a tap on a Today row. Only the real dashboard passes one; the demo just flips the box. */
export type ToggleTodayAction = (trackerId: string, done: boolean) => Promise<{ ok: boolean }>;

/** Saves task changes. Only the real dashboard passes these; the demo changes stay on the page. */
export interface TaskActions {
  add: (task: NewTask) => Promise<{ ok: boolean }>;
  move: (id: string, status: TaskStatus) => Promise<{ ok: boolean }>;
  remove: (id: string) => Promise<{ ok: boolean }>;
}

/*
  Real data can be missing while a source isn't connected or nothing is logged yet.
  null / empty lists mean "show the empty state", which tells you what to log.
*/
export interface DashboardData {
  ownerLine: string;
  /** YYYY-MM-DD the dashboard counts as today (fixed on the demo). */
  todayISO: string;
  /** Letter in the phone avatar. */
  ownerInitial: string;
  /** Where "Log Today" goes: /demo/log on the demo, /log for real. */
  logHref: string;
  views: Record<ViewId, { title: string; subtitle: string }>;
  navBadges: Partial<Record<ViewId, string>>;
  trackers: { label: string; done: boolean; value: string }[];
  season: {
    name: string;
    length: number;
    /** 0 = started. Before the start date: days until day 1. */
    startsIn: number;
    day: number;
    streak: number;
    targetsHitPct: number;
    bestStreak: number;
    missed: number;
    startLabel: string;
    endLabel: string;
    days: SeasonDay[];
  } | null;
  /** The Winter Arc page (DESIGN.md v6.1). null = no season set up. */
  arc: {
    /** "26 Oct 2026 → 23 Jan 2027" */
    rangeLabel: string;
    /** Season week today is in (1-based; 1 before the start), out of weekCount. */
    week: number;
    weekCount: number;
    /** This season week, per tracker: days on target so far against the days it asks for. */
    targets: { name: string; done: number; target: number }[];
    /** Days in a row on target, per tracker. */
    streaks: { name: string; current: number; best: number }[];
    /** % of tracker targets hit in each season week. null = week not started yet. */
    weeks: (number | null)[];
  } | null;
  stats: { label: string; value: string; unit: string; note: string; tone: Tone; trend: number[] }[];
  today: TodayItem[];
  money: {
    month: string;
    updated: string;
    income: number;
    spent: number;
    split: { needs: number; wants: number; savings: number };
    fund: { name: string; pct: number; target: number };
    accounts: Account[];
  } | null;
  /** Where the workout log and the weekly body check live (/log/... or /demo/log/...). */
  workoutHref: string;
  bodyHref: string;
  workouts: {
    /** Days with a workout this week (Monday to today). */
    weekCount: number;
    /** From the "Workout done" tracker's weekly target. null = no target. */
    weekTarget: number | null;
    /** This week's sessions, latest first. */
    week: { day: string; name: string; summary: string }[];
    /** The latest session, for "Repeat last workout". null = none logged yet. */
    last: { name: string; when: string; summary: string } | null;
  };
  /** Top set per session for the most-done exercises. Empty = nothing weighted logged yet. */
  lifts: {
    exercise: string;
    /** Kilograms, oldest session first. */
    tops: number[];
    sinceLabel: string;
  }[];
  weight: {
    unit: string;
    /** null = no goal weight set. */
    goal: number | null;
    rangeLabel: string;
    startLabel: string;
    endLabel: string;
    /** One reading per weekly check, oldest first. */
    values: number[];
    /** Y axis bottom and top. */
    axis: [number, number];
  } | null;
  bodyCheck: {
    /** "Today", "3 days ago", "11 Oct". null = never done. */
    lastLabel: string | null;
    /** A week or more since the last check. */
    due: boolean;
    /** Latest measurements, with the change since the check before. */
    measures: { label: string; value: string; change: number | null }[];
  };
  /** Where goals are added and updated (/log/goals or /demo/log/goals). */
  goalsHref: string;
  /** The shareable Winter Arc card (/progress or /demo/progress). */
  shareHref: string;
  /** Season, trackers and reset. null on the demo (no settings to change). */
  settingsHref: string | null;
  goals: { name: string; progress: string; pct: number; by: string; tone: Tone }[];
  habits: { name: string; days: boolean[] }[];
  mailboxes: { label: string; tone: Tone; count: string }[];
  mailboxNote: string;
  mails: Mail[];
  /** Open tasks plus the ones done in the last two weeks. */
  tasks: Task[];
  instinct: {
    draftQuestion: string;
    exchanges: { question: string; answer: string; meta: string; status: "answered" | "paused" }[];
    shares: { key: string; label: string; on: boolean }[];
    digest: string;
  };
  footnote: string;
  /** True on /demo: pretend actions (Instinct replies) run instead of real ones. */
  isDemo: boolean;
}
