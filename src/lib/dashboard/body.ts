import { kg, MEASURES, workoutSummary, type BodyCheck, type Workout } from "@/lib/body";
import type { DashboardData } from "@/modules/types";
import { daysBetween, relativeDay, weekStart, weekdayShort } from "./dates";

/*
  Workouts and body checks -> the Workouts and Body tiles on Health.
  Pure, like build.ts. /demo runs its fake workouts through this too.
*/

interface BodyInput {
  /** Latest first. */
  workouts: Workout[];
  /** Latest first. */
  bodyChecks: BodyCheck[];
  today: string;
  /** Days the "Workout done" tracker was ticked without a logged session still count. */
  workoutDays?: string[];
  weekTarget: number | null;
}

/** How far back workouts and body checks are read (the weight chart's 90 days, rounded up). */
export const BODY_WEEKS = 13;

export function buildBody({ workouts, bodyChecks, today, workoutDays = [], weekTarget }: BodyInput): Pick<DashboardData, "workouts" | "bodyCheck"> {
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
    bodyCheck: buildBodyCheck(bodyChecks, today),
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
