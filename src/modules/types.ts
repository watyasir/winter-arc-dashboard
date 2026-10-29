import type { ClaudeJob } from "@/lib/claude-jobs";
import type { GateChoice } from "@/lib/gate";
import type { GalleryItem } from "@/lib/gallery";
import type { Tone } from "@/lib/tones";
import type { NewTask, Owner, Task, TaskStatus } from "@/lib/tasks";

export type { Owner, Task };

/*
  The shape of everything the dashboard shows. /demo fills it with fake data
  (src/data/demo); from Phase 3 the real dashboard fills it from Supabase.
*/

/** Each view has its own address: / (overview), /winter-arc, /board, /money, /health, /gallery (and the same under /demo). */
export type ViewId = "overview" | "arc" | "board" | "money" | "health" | "gallery";

/** One day's value on a line chart. */
export interface Point {
  date: string;
  value: number;
}

export type SeasonDay = "all" | "most" | "missed" | "today" | "upcoming";

/** One bank account or card in the Money wallet stack. Card balances are negative (amount owed). */
export interface Account {
  id: string;
  name: string;
  kind: "savings" | "current" | "card" | "other";
  balance: number;
  /** Cards only: next bill due date, e.g. "5 Nov". */
  due?: string;
  /** Latest first. Positive = money in. The finance snapshots don't carry these. */
  transactions?: { label: string; date: string; amount: number }[];
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
/** Reads and deletes gallery files. Only the real dashboard passes these; the demo uses data.gallery. */
export interface GalleryActions {
  list: () => Promise<{ ok: true; items: GalleryItem[] } | { ok: false }>;
  remove: (id: string) => Promise<{ ok: boolean }>;
}

export interface TaskActions {
  add: (task: NewTask) => Promise<{ ok: boolean }>;
  update: (id: string, task: NewTask) => Promise<{ ok: boolean }>;
  move: (id: string, status: TaskStatus) => Promise<{ ok: boolean }>;
  remove: (id: string) => Promise<{ ok: boolean }>;
  /** An answer on the action gate (also logged). `due` only for "move". */
  gate: (id: string, choice: GateChoice, due?: string) => Promise<{ ok: boolean }>;
}

/*
  Real data can be missing while a source isn't connected or nothing is logged yet.
  null / empty lists mean "show the empty state", which tells you what to log.
*/
export interface DashboardData {
  ownerLine: string;
  /** YYYY-MM-DD the dashboard counts as today (fixed on the demo). */
  todayISO: string;
  /** "" for the real app, "/demo" for the demo: every view's address starts with it. */
  basePath: "" | "/demo";
  /** Where "Log Today" goes: /demo/log on the demo, /log for real. */
  logHref: string;
  views: Record<ViewId, { title: string; subtitle: string }>;
  navBadges: Partial<Record<ViewId, string>>;
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
  /** The Overview hero. null = no season set up. */
  hero: {
    /** 1..length once started; 0 before day 1. */
    day: number;
    length: number;
    /** Before day 1: days until it starts. */
    startsIn: number;
    daysLeft: number;
    /** Season days so far with anything logged. */
    checkIns: number;
    finishLabel: string;
    /** One per season day: anything logged that day. */
    logged: boolean[];
    /** -1 outside the season. */
    todayIndex: number;
  } | null;
  /** Anything logged today. */
  checkedIn: boolean;
  /** From the day plan. null = no plan sent yet. */
  plan: { shift: string; now: string | null } | null;
  /** Last 90 days (Health toggles 14 / 30 / 90). */
  steps: Point[];
  /** Hours: wake time minus lights out, else the Sleep tracker. */
  sleep: Point[];
  /** Today's meal slots. status = the logged option ("Planned", "Swapped", "Skipped"), null = not logged. */
  meals: { name: string; status: string | null }[];
  /** Today's readings, "118/76". */
  bp: { label: string; value: string | null }[];
  /** The goal whose name has "1RK" in it. null = no such goal yet. */
  fund: { name: string; progress: string; pct: number; by: string } | null;
  /** null = no Study tracker. */
  study: { todayMin: number | null; weekMin: number; dailyTarget: number | null; page: number | null } | null;
  /** Winter Arc: 0-100 per season day so far. */
  consistency: Point[];
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
  today: TodayItem[];
  money: {
    month: string;
    updated: string;
    income: number;
    spent: number;
    /** What's left to spend this month (the wallet's front card). */
    spendable: number;
    /** % of income, actual against target (50/20/30 by default). */
    split: Record<"needs" | "wants" | "savings", { actual: number; target: number }>;
    /** Biggest spends first, at most 4. */
    categories: { name: string; amount: number }[];
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
  /** Check-in and weekly body check readings, last 90 days. */
  weight: { unit: "kg"; goal: number | null; points: Point[] };
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
  /** Open tasks plus the ones done in the last two weeks. */
  tasks: Task[];
  /** The demo's gallery. null on the real dashboard: the gallery loads when it's opened. */
  gallery: GalleryItem[] | null;
  /** Claude's scheduled tasks, beside the Board. */
  claudeJobs: ClaudeJob[];
}
