import { addDays, formatAmount, formatValue, type Tracker } from "@/lib/trackers";
import type { DashboardData, SeasonDay, TodayItem } from "@/modules/types";
import type { BodyCheck, Workout } from "@/lib/body";
import { dueState, type Goal, type Task } from "@/lib/tasks";
import { toMoneyTile, type MoneySnapshot } from "@/lib/money";
import { buildBody } from "./body";
import { buildGoals } from "./goals";
import { daysBetween, headerDate, lastDays, shortDate } from "./dates";

/*
  Turns the real rows (trackers, entries, the active season) into the same DashboardData
  shape /demo uses, so both run on the same tiles. Pure: no database, easy to reason about.
  Sources with nothing in them yet (money before the first snapshot) come back
  empty and the tiles show what to do instead.
*/

export interface EntryRow {
  tracker_id: string;
  entry_date: string;
  value: number;
}

export interface SeasonRow {
  name: string;
  start_date: string;
  length_days: number;
  /** { "<tracker slug>": <daily target> }. Empty = use each tracker's own daily target. */
  targets: Record<string, number>;
}

interface BuildInput {
  trackers: Tracker[];
  entries: EntryRow[];
  season: SeasonRow | null;
  today: string;
  ownerInitial: string;
  /** Latest first. */
  workouts: Workout[];
  /** Latest first. */
  bodyChecks: BodyCheck[];
  weightGoal: number | null;
  tasks: Task[];
  goals: Goal[];
  /** Linked-tracker totals by goal id. */
  goalTracked: Map<string, number>;
  /** The latest money snapshot. Null/missing = none pushed yet. */
  money?: MoneySnapshot | null;
}

/** How far back the dashboard reads: 7 weeks of weekly trends, plus the season if it started earlier. */
export const HISTORY_DAYS = 49;

const HABIT_DAYS = 28;


// ---------------------------------------------------------------- the build

export function buildDashboardData({
  trackers,
  entries,
  season,
  today,
  ownerInitial,
  workouts,
  bodyChecks,
  weightGoal,
  tasks,
  goals,
  goalTracked,
  money,
}: BuildInput): DashboardData {
  const values = new Map<string, number>();
  for (const e of entries) values.set(`${e.tracker_id}|${e.entry_date}`, Number(e.value));
  const valueOn = (t: Tracker, date: string) => values.get(`${t.id}|${date}`);

  /** Did this tracker hit its daily bar on this date? */
  const hitOn = (t: Tracker, date: string, target = dailyTarget(t)) => {
    const v = valueOn(t, date);
    if (v === undefined) return false;
    if (t.type === "checkbox") return v >= 1;
    return target == null ? true : v >= target;
  };

  // The trackers a day is judged on. A season can name its own; otherwise every daily target counts.
  const seasonTargets = season && Object.keys(season.targets).length > 0 ? season.targets : null;
  const dailyGoals: { tracker: Tracker; target: number | undefined }[] = seasonTargets
    ? trackers.filter((t) => t.slug in seasonTargets).map((t) => ({ tracker: t, target: seasonTargets[t.slug] }))
    : trackers.filter((t) => dailyTarget(t) != null).map((t) => ({ tracker: t, target: dailyTarget(t) ?? undefined }));

  const dayStatus = (date: string): "all" | "most" | "missed" => {
    if (dailyGoals.length === 0) return "missed";
    const hits = dailyGoals.filter((g) => hitOn(g.tracker, date, g.target)).length;
    if (hits === dailyGoals.length) return "all";
    return hits / dailyGoals.length >= 0.5 ? "most" : "missed";
  };
  const counts = (date: string) => dayStatus(date) !== "missed";

  // Streak: today counts once it's hit; until then the streak runs to yesterday.
  let streak = 0;
  for (let d = counts(today) ? today : addDays(today, -1); counts(d) && streak < 3650; d = addDays(d, -1)) streak++;

  const workoutTracker = trackers.find((t) => t.slug === "workout");
  const body = buildBody({
    workouts,
    bodyChecks,
    weightGoal,
    today,
    workoutDays: workoutTracker ? entries.filter((e) => e.tracker_id === workoutTracker.id && e.value >= 1).map((e) => e.entry_date) : [],
    weekTarget: workoutTracker?.target_period === "weekly" && workoutTracker.target != null ? Number(workoutTracker.target) : null,
  });

  const loggedToday = trackers.filter((t) => valueOn(t, today) !== undefined).length;
  const open = tasks.filter((t) => t.status !== "done");
  const overdue = open.filter((t) => dueState(t, today) === "overdue").length;
  const dueToday = open.filter((t) => t.due === today).length;

  return {
    ownerLine: "Life, tracked",
    ownerInitial,
    todayISO: today,
    logHref: "/log",
    shareHref: "/progress",
    views: {
      overview: {
        title: headerDate(today),
        subtitle: overviewSubtitle(loggedToday, trackers.length, dueToday, overdue),
      },
      arc: {
        title: season?.name ?? "Winter Arc",
        subtitle: season
          ? `${fullDate(season.start_date)} → ${fullDate(addDays(season.start_date, season.length_days - 1))} · ${season.length_days} days`
          : "No season set up yet",
      },
      board: {
        title: "Board",
        subtitle: open.length === 0 ? "No open tasks" : `${open.length} open${overdue ? ` · ${overdue} overdue` : ""}${dueToday ? ` · ${dueToday} due today` : ""}`,
      },
    },
    navBadges: open.length ? { board: String(open.length) } : {},
    trackers: trackers.map((t) => {
      const v = valueOn(t, today);
      return { label: t.name, done: v !== undefined && hitOn(t, today), value: v === undefined ? "–" : formatValue(t, v) };
    }),
    season: season ? buildSeason(season, today, dayStatus, counts, dailyGoals.length) : null,
    arc: season ? buildArc(season, today, trackers, dailyGoals, hitOn) : null,
    today: trackers.map((t) => todayItem(t, valueOn(t, today), hitOn(t, today))),
    money: money ? toMoneyTile(money) : null,
    workoutHref: "/log/workout",
    bodyHref: "/log/body",
    goalsHref: "/log/goals",
    settingsHref: "/settings",
    ...body,
    goals: buildGoals(goals, goalTracked, trackers, today),
    habits: trackers
      .filter((t) => t.type === "checkbox" || dailyTarget(t) != null)
      .map((t) => ({ name: t.name, days: lastDays(today, HABIT_DAYS).map((d) => hitOn(t, d)) })),
    tasks,
    footnote: "Your data, updated every time you log. Money shows up here after the finance task sends its first snapshot.",
  };
}

function dailyTarget(t: Tracker): number | null {
  if (t.target_period !== "daily" || t.target == null) return null;
  return Number(t.target);
}

// The season day lives in the header's Winter Arc chip (v6.1), so it isn't repeated here.
function overviewSubtitle(logged: number, total: number, dueToday: number, overdue: number): string {
  const parts: string[] = [];
  if (dueToday) parts.push(`${dueToday} ${dueToday === 1 ? "task" : "tasks"} due today`);
  if (overdue) parts.push(`${overdue} overdue`);
  parts.push(logged === 0 ? "Nothing logged today yet" : `${logged} of ${total} trackers logged today`);
  return parts.join(" · ");
}

function buildSeason(
  season: SeasonRow,
  today: string,
  dayStatus: (date: string) => "all" | "most" | "missed",
  counts: (date: string) => boolean,
  goalCount: number,
): NonNullable<DashboardData["season"]> {
  const length = season.length_days;
  const dayNum = Math.min(Math.max(daysBetween(season.start_date, today) + 1, 0), length);
  const days: SeasonDay[] = Array.from({ length }, (_, i) => {
    if (i < dayNum - 1) return dayStatus(addDays(season.start_date, i));
    return i === dayNum - 1 ? "today" : "upcoming";
  });

  // Past days only: today is still in progress.
  const past = Array.from({ length: Math.max(dayNum - 1, 0) }, (_, i) => addDays(season.start_date, i));
  let best = 0;
  let run = 0;
  for (const d of [...past, ...(counts(today) ? [today] : [])]) {
    run = counts(d) ? run + 1 : 0;
    best = Math.max(best, run);
  }
  let streak = 0;
  for (let d = counts(today) ? today : addDays(today, -1); d >= season.start_date && counts(d); d = addDays(d, -1)) streak++;
  const hitDays = past.filter((d) => dayStatus(d) === "all").length;

  return {
    name: season.name,
    length,
    startsIn: Math.max(0, daysBetween(today, season.start_date)),
    day: dayNum,
    streak,
    targetsHitPct: past.length && goalCount ? Math.round((hitDays / past.length) * 100) : 0,
    bestStreak: best,
    missed: past.filter((d) => dayStatus(d) === "missed").length,
    startLabel: shortDate(season.start_date),
    endLabel: shortDate(addDays(season.start_date, length - 1)),
    days,
  };
}

// ---------------------------------------------------------------- Winter Arc page

type HitOn = (t: Tracker, date: string, target?: number) => boolean;

/** "2026-10-26" -> "26 Oct 2026" */
function fullDate(iso: string): string {
  return `${shortDate(iso)} ${iso.slice(0, 4)}`;
}

function buildArc(
  season: SeasonRow,
  today: string,
  trackers: Tracker[],
  dailyGoals: { tracker: Tracker; target: number | undefined }[],
  hitOn: HitOn,
): NonNullable<DashboardData["arc"]> {
  const length = season.length_days;
  const end = addDays(season.start_date, length - 1);
  const weekCount = Math.ceil(length / 7);
  const dayNum = daysBetween(season.start_date, today) + 1;
  const started = dayNum >= 1;
  const weekIndex = started ? Math.min(Math.floor((dayNum - 1) / 7), weekCount - 1) : 0;

  /** Season days of week `w` (0-based) up to today. */
  const daysOfWeek = (w: number) => {
    const days: string[] = [];
    for (let i = w * 7; i < Math.min(w * 7 + 7, length); i++) {
      const d = addDays(season.start_date, i);
      if (d <= today) days.push(d);
    }
    return days;
  };
  const weekLength = (w: number) => Math.min(7, length - w * 7);

  // Daily targets, plus weekly yes/no ones like workouts ("5 days a week").
  const weekly = trackers.filter((t) => t.type === "checkbox" && t.target_period === "weekly" && t.target != null);
  const goals = [
    ...dailyGoals.map((g) => ({ tracker: g.tracker, target: g.target, perWeek: weekLength(weekIndex) })),
    ...weekly.filter((t) => !dailyGoals.some((g) => g.tracker.id === t.id)).map((t) => ({ tracker: t, target: undefined, perWeek: Number(t.target) })),
  ];
  // "Sleep 7 hr", "Study 1.5 hr"; "Steps 8,000" rather than "Steps 8,000 steps".
  const label = (t: Tracker, target: number | undefined) => {
    if (target == null || t.type === "checkbox" || t.type === "scale_1_5") return t.name;
    if (t.unit && t.unit.toLowerCase() === t.name.toLowerCase()) return `${t.name} ${formatAmount(target)}`;
    return `${t.name} ${formatValue(t, target)}`;
  };
  const thisWeek = started ? daysOfWeek(weekIndex) : [];

  return {
    rangeLabel: `${fullDate(season.start_date)} → ${fullDate(end)}`,
    week: weekIndex + 1,
    weekCount,
    targets: goals.map((g) => ({
      name: label(g.tracker, g.target),
      done: thisWeek.filter((d) => hitOn(g.tracker, d, g.target)).length,
      target: g.perWeek,
    })),
    streaks: goals.map((g) => {
      const hit = (d: string) => hitOn(g.tracker, d, g.target);
      let current = 0;
      for (let d = hit(today) ? today : addDays(today, -1); d >= season.start_date && hit(d); d = addDays(d, -1)) current++;
      let best = 0;
      let run = 0;
      for (let d = season.start_date; d <= today && d <= end; d = addDays(d, 1)) {
        run = hit(d) ? run + 1 : 0;
        best = Math.max(best, run);
      }
      return { name: label(g.tracker, g.target), current, best };
    }),
    weeks: Array.from({ length: weekCount }, (_, w) => {
      const days = daysOfWeek(w);
      if (days.length === 0 || dailyGoals.length === 0) return null;
      const hits = days.reduce((n, d) => n + dailyGoals.filter((g) => hitOn(g.tracker, d, g.target)).length, 0);
      return Math.round((hits / (days.length * dailyGoals.length)) * 100);
    }),
  };
}

function todayItem(t: Tracker, value: number | undefined, hit: boolean): TodayItem {
  if (t.type === "checkbox") return { label: t.name, area: t.area, done: value !== undefined && hit, trackerId: t.id };
  const target = dailyTarget(t);
  let note = "Not logged";
  if (value !== undefined) {
    note = formatValue(t, value);
    if (target != null && t.type === "number") note = `${formatAmount(value)} of ${formatAmount(target)}${t.unit ? ` ${t.unit}` : ""}`;
    if (target != null && t.type === "duration_minutes") note = `${formatValue(t, value)} of ${formatValue(t, target)}`;
  }
  return { label: t.name, area: note, done: value !== undefined && hit, href: "/log" };
}
