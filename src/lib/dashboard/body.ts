import { groupSets, kg, MEASURES, workoutSummary, type BodyCheck, type Workout } from "@/lib/body";
import type { DashboardData } from "@/modules/types";
import { daysBetween, relativeDay, shortDate, weekStart, weekdayShort } from "./dates";

/*
  Workouts and body checks -> the Workouts, Lift progress and Weight tiles.
  Pure, like build.ts. /demo runs its fake workouts through this too.
*/

export interface BodyInput {
  /** Latest first. */
  workouts: Workout[];
  /** Latest first. */
  bodyChecks: BodyCheck[];
  weightGoal: number | null;
  today: string;
  /** Days the "Workout done" tracker was ticked without a logged session still count. */
  workoutDays?: string[];
  weekTarget: number | null;
}

/** How far back the Weight chart and Lift progress look. */
export const BODY_WEEKS = 12;
const MAX_LIFTS = 4;
const LIFT_POINTS = 8;

export function buildBody({ workouts, bodyChecks, weightGoal, today, workoutDays = [], weekTarget }: BodyInput): Pick<
  DashboardData,
  "workouts" | "lifts" | "weight" | "bodyCheck"
> {
  const monday = weekStart(today);
  const thisWeek = workouts.filter((w) => w.date >= monday && w.date <= today);
  const days = new Set([...thisWeek.map((w) => w.date), ...workoutDays.filter((d) => d >= monday && d <= today)]);
  const last = workouts[0];

  return {
    workouts: {
      weekCount: days.size,
      weekTarget,
      week: thisWeek.map((w) => ({ day: weekdayShort(w.date), name: w.name, summary: workoutSummary(w.sets) })),
      last: last ? { name: last.name, when: relativeDay(last.date, today), summary: workoutSummary(last.sets) } : null,
    },
    lifts: buildLifts(workouts, today),
    weight: buildWeight(bodyChecks, weightGoal, today),
    bodyCheck: buildBodyCheck(bodyChecks, today),
  };
}

/** Heaviest set per session for the exercises done most often (weighted sets only). */
function buildLifts(workouts: Workout[], today: string): DashboardData["lifts"] {
  const recent = [...workouts.filter((w) => daysBetween(w.date, today) < BODY_WEEKS * 7)].reverse(); // oldest first
  const byExercise = new Map<string, { exercise: string; sessions: { date: string; top: number }[] }>();
  for (const w of recent) {
    for (const g of groupSets(w.sets)) {
      const weights = g.sets.map((s) => s.weight).filter((v): v is number => v != null && v > 0);
      if (weights.length === 0) continue;
      const key = g.exercise.toLowerCase();
      const entry = byExercise.get(key) ?? { exercise: g.exercise, sessions: [] };
      entry.sessions.push({ date: w.date, top: Math.max(...weights) });
      byExercise.set(key, entry);
    }
  }
  return [...byExercise.values()]
    .sort((a, b) => b.sessions.length - a.sessions.length || b.sessions.at(-1)!.date.localeCompare(a.sessions.at(-1)!.date))
    .slice(0, MAX_LIFTS)
    .map(({ exercise, sessions }) => {
      const shown = sessions.slice(-LIFT_POINTS);
      return { exercise, tops: shown.map((s) => s.top), sinceLabel: shortDate(shown[0].date) };
    });
}

function buildWeight(checks: BodyCheck[], goal: number | null, today: string): DashboardData["weight"] {
  const readings = checks
    .filter((c) => c.weight != null && daysBetween(c.date, today) < BODY_WEEKS * 7)
    .reverse() as (BodyCheck & { weight: number })[];
  if (readings.length < 2) return null;
  const values = readings.map((r) => r.weight);
  const first = readings[0].date;
  const end = readings.at(-1)!.date;
  const weeks = Math.max(1, Math.round(daysBetween(first, end) / 7));

  // Whole-kg axis that fits every reading and the goal, at least 4 kg tall, even so the middle line is whole.
  const all = goal == null ? values : [...values, goal];
  let lo = Math.floor(Math.min(...all) - 0.5);
  let hi = Math.ceil(Math.max(...all) + 0.5);
  if (hi - lo < 4) {
    const pad = 4 - (hi - lo);
    lo -= Math.floor(pad / 2);
    hi += Math.ceil(pad / 2);
  }
  if ((hi - lo) % 2) hi += 1;

  return {
    unit: "kg",
    goal,
    rangeLabel: `${weeks} ${weeks === 1 ? "week" : "weeks"}`,
    startLabel: shortDate(first),
    endLabel: shortDate(end),
    values,
    axis: [lo, hi],
  };
}

function buildBodyCheck(checks: BodyCheck[], today: string): DashboardData["bodyCheck"] {
  const latest = checks[0];
  return {
    lastLabel: latest ? relativeDay(latest.date, today) : null,
    due: !latest || daysBetween(latest.date, today) >= 7,
    measures: MEASURES.flatMap(({ key, label }) => {
      const withValue = checks.filter((c) => c[key] != null);
      if (withValue.length === 0) return [];
      const [now, before] = withValue.map((c) => c[key]!);
      return [{ label, value: `${kg(now)} cm`, change: before === undefined ? null : Math.round((now - before) * 10) / 10 }];
    }),
  };
}
