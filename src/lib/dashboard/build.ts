import type { Tone } from "@/lib/tones";
import { addDays, formatAmount, formatValue, type Tracker } from "@/lib/trackers";
import type { DashboardData, SeasonDay, TodayItem } from "@/modules/types";

/*
  Turns the real rows (trackers, entries, the active season) into the same DashboardData
  shape /demo uses, so both run on the same tiles. Pure: no database, easy to reason about.
  Sources that aren't connected yet (money, mail, tasks, weight, goals) come back empty and
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
}

/** How far back the dashboard reads: 7 weeks of weekly trends, plus the season if it started earlier. */
export const HISTORY_DAYS = 49;

const STAT_TONES: Tone[] = ["arc", "sage", "yellow", "brand", "pine"];
const FEATURED_STATS = ["sleep", "workout", "study", "water", "steps"];
const HABIT_DAYS = 28;

// ---------------------------------------------------------------- date helpers (YYYY-MM-DD, India time)

function utc(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
}

function daysBetween(from: string, to: string): number {
  return Math.round((utc(to).getTime() - utc(from).getTime()) / 86_400_000);
}

/** Monday of the week the date is in. */
function weekStart(iso: string): string {
  const weekday = (utc(iso).getUTCDay() + 6) % 7; // Monday = 0
  return addDays(iso, -weekday);
}

/** "2026-09-26" -> "26 Sep" */
export function shortDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(utc(iso));
}

/** "2026-10-20" -> "Tuesday, 20 October" */
function headerDate(iso: string): string {
  const part = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { ...o, timeZone: "UTC" }).format(utc(iso));
  return `${part({ weekday: "long" })}, ${part({ day: "numeric", month: "long" })}`;
}

function lastDays(today: string, n: number): string[] {
  return Array.from({ length: n }, (_, i) => addDays(today, i - n + 1));
}

/** One decimal at most, no trailing ".0": 7 -> "7", 6.25 -> "6.3". */
function oneDecimal(n: number): string {
  return String(Math.round(n * 10) / 10);
}

// ---------------------------------------------------------------- the build

export function buildDashboardData({ trackers, entries, season, today, ownerInitial }: BuildInput): DashboardData {
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

  const loggedToday = trackers.filter((t) => valueOn(t, today) !== undefined).length;

  return {
    ownerLine: "Your life dashboard",
    ownerInitial,
    logHref: "/log",
    views: {
      overview: {
        title: headerDate(today),
        subtitle: overviewSubtitle(season, today, loggedToday, trackers.length),
      },
      inbox: { title: "Inbox", subtitle: "Gmail isn't connected yet" },
      board: { title: "Board", subtitle: "Your tasks will live here" },
      instinct: { title: "Instinct", subtitle: "Your on-the-go assistant, kept in sync with this dashboard" },
    },
    navBadges: {},
    trackers: trackers.map((t) => {
      const v = valueOn(t, today);
      return { label: t.name, done: v !== undefined && hitOn(t, today), value: v === undefined ? "–" : formatValue(t, v) };
    }),
    season: season ? buildSeason(season, today, dayStatus, counts, dailyGoals.length) : null,
    stats: pickStatTrackers(trackers).map((t, i) => buildStat(t, STAT_TONES[i % STAT_TONES.length], today, valueOn)),
    today: trackers.map((t) => todayItem(t, valueOn(t, today), hitOn(t, today))),
    money: null,
    weight: null,
    goals: [],
    habits: trackers
      .filter((t) => t.type === "checkbox" || dailyTarget(t) != null)
      .map((t) => ({ name: t.name, days: lastDays(today, HABIT_DAYS).map((d) => hitOn(t, d)) })),
    mailboxes: [],
    mailboxNote: "",
    mails: [],
    board: [],
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
    footnote: "Your data, updated every time you log. Money, mail, tasks and weight show up here as they get connected.",
    isDemo: false,
  };
}

function dailyTarget(t: Tracker): number | null {
  if (t.target_period !== "daily" || t.target == null) return null;
  return Number(t.target);
}

function overviewSubtitle(season: SeasonRow | null, today: string, logged: number, total: number): string {
  const parts: string[] = [];
  if (season) {
    const day = daysBetween(season.start_date, today) + 1;
    if (day >= 1 && day <= season.length_days) parts.push(`${season.name} day ${day}`);
  }
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
