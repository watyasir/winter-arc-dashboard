import type { Tone } from "@/lib/tones";
import { addDays, formatAmount, formatValue, type Tracker } from "@/lib/trackers";
import type { DashboardData, SeasonDay, TodayItem } from "@/modules/types";
import type { BodyCheck, Workout } from "@/lib/body";
import { dueState, type Goal, type Task } from "@/lib/tasks";
import { buildBody } from "./body";
import { buildGoals } from "./goals";
import { daysBetween, headerDate, lastDays, shortDate, weekStart } from "./dates";

/*
  Turns the real rows (trackers, entries, the active season) into the same DashboardData
  shape /demo uses, so both run on the same tiles. Pure: no database, easy to reason about.
  Sources that aren't connected yet (money, mail) come back empty and
  the tiles show what to do instead.
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

export interface BuildInput {
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
}

/** How far back the dashboard reads: 7 weeks of weekly trends, plus the season if it started earlier. */
export const HISTORY_DAYS = 49;

const STAT_TONES: Tone[] = ["arc", "sage", "yellow", "brand", "pine"];
const FEATURED_STATS = ["sleep", "workout", "study", "water", "steps"];
const HABIT_DAYS = 28;

/** One decimal at most, no trailing ".0": 7 -> "7", 6.25 -> "6.3". */
function oneDecimal(n: number): string {
  return String(Math.round(n * 10) / 10);
}

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
        subtitle: overviewSubtitle(season, today, loggedToday, trackers.length, dueToday),
      },
      arc: {
        title: season?.name ?? "Winter Arc",
        subtitle: season
          ? `${fullDate(season.start_date)} → ${fullDate(addDays(season.start_date, season.length_days - 1))} · ${season.length_days} days`
          : "No season set up yet",
      },
      inbox: { title: "Inbox", subtitle: "Gmail isn't connected yet" },
      board: {
        title: "Board",
        subtitle: open.length === 0 ? "No open tasks" : `${open.length} open${overdue ? ` · ${overdue} overdue` : ""}${dueToday ? ` · ${dueToday} due today` : ""}`,
      },
      instinct: { title: "Instinct", subtitle: "Your on-the-go assistant, kept in sync with this dashboard" },
    },
    navBadges: open.length ? { board: String(open.length) } : {},
    trackers: trackers.map((t) => {
      const v = valueOn(t, today);
      return { label: t.name, done: v !== undefined && hitOn(t, today), value: v === undefined ? "–" : formatValue(t, v) };
    }),
    season: season ? buildSeason(season, today, dayStatus, counts, dailyGoals.length) : null,
    arc: season ? buildArc(season, today, trackers, dailyGoals, hitOn) : null,
    stats: pickStatTrackers(trackers).map((t, i) => buildStat(t, STAT_TONES[i % STAT_TONES.length], today, valueOn)),
    today: trackers.map((t) => todayItem(t, valueOn(t, today), hitOn(t, today))),
    money: null,
    workoutHref: "/log/workout",
    bodyHref: "/log/body",
    goalsHref: "/log/goals",
    settingsHref: "/settings",
    ...body,
    goals: buildGoals(goals, goalTracked, trackers, today),
    habits: trackers
      .filter((t) => t.type === "checkbox" || dailyTarget(t) != null)
      .map((t) => ({ name: t.name, days: lastDays(today, HABIT_DAYS).map((d) => hitOn(t, d)) })),
    mailboxes: [],
    mailboxNote: "",
    mails: [],
    tasks,
    instinct: {
      draftQuestion: "",
      exchanges: [],
      shares: [
        { key: "tasks", label: "Board and tasks", on: true },
        { key: "arc", label: "Winter Arc progress", on: true },
        { key: "money", label: "Money summary", on: true },
        { key: "inbox", label: "Inbox summary", on: true },
        { key: "body", label: "Workouts and weight", on: true },
        { key: "health", label: "Health reports", on: false },
      ],
      digest: digest(season, today, streak, trackers, valueOn),
    },
    footnote: "Your data, updated every time you log. Money shows up here once the finance sheet is connected.",
    isDemo: false,
  };
}

function dailyTarget(t: Tracker): number | null {
  if (t.target_period !== "daily" || t.target == null) return null;
  return Number(t.target);
}

function overviewSubtitle(season: SeasonRow | null, today: string, logged: number, total: number, dueToday: number): string {
  const parts: string[] = [];
  if (season) {
    const day = daysBetween(season.start_date, today) + 1;
    if (day >= 1 && day <= season.length_days) parts.push(`${season.name} day ${day}`);
    if (day < 1) parts.push(`${season.name} starts in ${1 - day} ${1 - day === 1 ? "day" : "days"}`);
  }
  parts.push(logged === 0 ? "Nothing logged today yet" : `${logged} of ${total} trackers logged today`);
  if (dueToday) parts.push(`${dueToday} ${dueToday === 1 ? "task" : "tasks"} due today`);
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
  const label = (t: Tracker, target: number | undefined) =>
    target == null || t.type === "checkbox" || t.type === "scale_1_5" ? t.name : `${t.name} ${formatValue(t, target)}`;
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

function pickStatTrackers(trackers: Tracker[]): Tracker[] {
  const featured = FEATURED_STATS.map((slug) => trackers.find((t) => t.slug === slug)).filter((t): t is Tracker => !!t);
  const rest = trackers.filter((t) => !featured.includes(t) && t.target != null);
  return [...featured, ...rest].slice(0, 5);
}

type ValueOn = (t: Tracker, date: string) => number | undefined;

function buildStat(t: Tracker, tone: Tone, today: string, valueOn: ValueOn): DashboardData["stats"][number] {
  const week = weekStart(today);
  const thisWeek = lastDays(today, daysBetween(week, today) + 1);
  const last7 = lastDays(today, 7);
  const empty = (note: string) => ({ label: t.name, value: "–", unit: "", note, tone, trend: last7.map(() => 0) });

  // Weekly yes/no (workouts): times this week against the weekly target.
  if (t.type === "checkbox") {
    const doneIn = (days: string[]) => days.filter((d) => (valueOn(t, d) ?? 0) >= 1).length;
    const count = doneIn(thisWeek);
    const target = t.target_period === "weekly" && t.target != null ? Number(t.target) : 7;
    const trend = Array.from({ length: 7 }, (_, i) => {
      const start = addDays(week, (i - 6) * 7);
      return doneIn(lastDays(addDays(start, 6), 7).filter((d) => d <= today));
    });
    return {
      label: t.name,
      value: String(count),
      unit: `of ${target}`,
      note: count >= target ? "This week · target hit" : count === 0 ? `None yet this week` : "This week",
      tone,
      trend,
    };
  }

  // Time (study): hours this week against the weekly total.
  if (t.type === "duration_minutes") {
    const minutes = thisWeek.reduce((sum, d) => sum + (valueOn(t, d) ?? 0), 0);
    const weekly = t.target == null ? null : t.target_period === "weekly" ? Number(t.target) : Number(t.target) * 7;
    const left = weekly == null ? 0 : weekly - minutes;
    return {
      label: t.name,
      value: oneDecimal(minutes / 60),
      unit: weekly == null ? "hr" : `of ${oneDecimal(weekly / 60)} hr`,
      note: weekly == null ? "This week" : left <= 0 ? "Weekly target hit" : `${oneDecimal(left / 60)} hr left this week`,
      tone,
      trend: last7.map((d) => (valueOn(t, d) ?? 0) / 60),
    };
  }

  // Numbers and 1-5 scales: average of the days logged in the last 7.
  const logged = last7.map((d) => valueOn(t, d)).filter((v): v is number => v !== undefined);
  if (logged.length === 0) return empty(`No ${t.name.toLowerCase()} logged this week`);
  const avg = logged.reduce((a, b) => a + b, 0) / logged.length;
  const target = dailyTarget(t);
  const shown = target != null && target >= 100 ? formatAmount(Math.round(avg)) : oneDecimal(avg);
  return {
    label: t.name,
    value: t.type === "scale_1_5" ? (t.scale_labels?.[Math.round(avg) - 1] ?? shown) : shown,
    unit: t.type === "scale_1_5" ? "" : (t.unit ?? ""),
    note:
      target == null
        ? "7-day average"
        : avg >= target
          ? "7-day average, on target"
          : `7-day average, target ${formatAmount(target)}${t.unit ? ` ${t.unit}` : ""}`,
    tone,
    trend: last7.map((d) => valueOn(t, d) ?? 0),
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

function digest(season: SeasonRow | null, today: string, streak: number, trackers: Tracker[], valueOn: ValueOn): string {
  const lines: string[] = [];
  if (season) {
    const day = daysBetween(season.start_date, today) + 1;
    if (day >= 1 && day <= season.length_days) lines.push(`Day ${day} of ${season.length_days} · streak ${streak}`);
  } else {
    lines.push(`Streak ${streak} ${streak === 1 ? "day" : "days"}`);
  }
  const yesterday = addDays(today, -1);
  const logged = trackers
    .map((t) => {
      const v = valueOn(t, yesterday);
      if (v === undefined) return null;
      if (t.type === "checkbox") return v >= 1 ? t.name.toLowerCase() : null;
      return `${t.name.toLowerCase()} ${formatValue(t, v)}`;
    })
    .filter(Boolean);
  lines.push(logged.length ? `Yesterday: ${logged.join(", ")}` : "Yesterday: nothing logged");
  return lines.join("\n");
}
