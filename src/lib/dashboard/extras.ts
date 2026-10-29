import type { BodyCheck } from "@/lib/body";
import { dayKeyOf, phasesFor, type DayPlan } from "@/lib/day-plan";
import { addDays, clockLabel, type Tracker } from "@/lib/trackers";
import type { DashboardData, Point } from "@/modules/types";
import type { SeasonRow } from "./build";
import { daysBetween, shortDate, weekStart } from "./dates";

/*
  The Soft bento pieces (v8): Winter Arc hero, today's plan, the three line charts, diet,
  study, blood pressure and the daily consistency score. Pure, like build.ts.
*/

/** How far back the charts go (Health's longest toggle). */
export const CHART_DAYS = 90;

type ValueOn = (t: Tracker, date: string) => number | undefined;

export function buildHero(season: SeasonRow | null, today: string, loggedDays: Set<string>): DashboardData["hero"] {
  if (!season) return null;
  const length = season.length_days;
  const day = daysBetween(season.start_date, today) + 1;
  const logged = Array.from({ length }, (_, i) => loggedDays.has(addDays(season.start_date, i)));
  const end = addDays(season.start_date, length - 1);
  return {
    day: Math.min(Math.max(day, 0), length),
    length,
    startsIn: Math.max(0, -day + 1),
    daysLeft: Math.max(0, Math.min(length, length - day)),
    checkIns: logged.filter((on, i) => on && i < day).length,
    finishLabel: shortDate(end),
    logged,
    todayIndex: day >= 1 && day <= length ? day - 1 : -1,
  };
}

/** "1:30–10:30 PM" from the plan's work phases, "Weekend off" on a free Saturday or Sunday, and what's on now. */
export function buildPlan(plan: DayPlan | null, today: string, nowMinutes: number): DashboardData["plan"] {
  if (!plan) return null;
  // Before the day's first phase it's still last night (lights out runs past midnight).
  const todays = phasesFor(plan, today);
  const late = todays.length > 0 && nowMinutes < todays[0].start;
  const phases = late ? phasesFor(plan, addDays(today, -1)) : todays;
  const at = late ? nowMinutes + 1440 : nowMinutes;
  const now = phases.find((p) => p.start <= at && at < p.end) ?? null;

  const work = todays.filter((p) => p.kind === "work");
  const weekend = ["sat", "sun"].includes(dayKeyOf(today));
  const shift = work.length
    ? range(work[0].start, work.at(-1)!.end)
    : weekend
      ? "Weekend off"
      : "No shift today";
  return { shift, now: now ? `${now.title} till ${clockLabel(now.end)}` : null };
}

/** "13:30–22:30" -> "1:30–10:30 PM" (one AM/PM when both match). */
function range(start: number, end: number): string {
  const [a, b] = [clockLabel(start), clockLabel(end)];
  return a.slice(-2) === b.slice(-2) ? `${a.slice(0, -3)}–${b}` : `${a}–${b}`;
}

/** Weight from the check-in and the weekly body check (the check-in wins on the same day); steps; sleep hours. */
export function buildSeries(trackers: Tracker[], valueOn: ValueOn, bodyChecks: BodyCheck[], today: string) {
  const days = Array.from({ length: CHART_DAYS }, (_, i) => addDays(today, i - CHART_DAYS + 1));
  const bySlug = (slug: string) => trackers.find((t) => t.slug === slug);
  const series = (get: (d: string) => number | undefined): Point[] =>
    days.flatMap((date) => {
      const value = get(date);
      return value === undefined ? [] : [{ date, value }];
    });

  const weightTracker = bySlug("weight");
  const checks = new Map(bodyChecks.filter((c) => c.weight != null).map((c) => [c.date, c.weight as number]));
  const steps = bySlug("steps");
  const [sleep, lightsOut, wake] = [bySlug("sleep"), bySlug("lights-out"), bySlug("wake")];
  return {
    weight: series((d) => (weightTracker && valueOn(weightTracker, d)) || checks.get(d)),
    steps: series((d) => (steps ? valueOn(steps, d) : undefined)),
    sleep: series((d) => {
      const out = lightsOut && valueOn(lightsOut, d);
      const up = wake && valueOn(wake, d);
      // Lights out is last night's: 12:30 AM = 30, 11:30 PM = 1410.
      if (out != null && up != null) return Math.round((((up - out + 1440) % 1440) / 60) * 10) / 10;
      return sleep ? valueOn(sleep, d) : undefined;
    }),
  };
}

/** Today's meal slots with what was logged (the option's word), in plan order. */
export function buildMeals(trackers: Tracker[], valueOn: ValueOn, today: string): DashboardData["meals"] {
  return trackers
    .filter((t) => t.type === "choice" && t.group_name === "Meals")
    .map((t) => {
      const v = valueOn(t, today);
      return { name: t.name, status: v === undefined ? null : (t.scale_labels?.[v - 1] ?? null) };
    });
}

/** Today's blood pressure, "118/76" per reading (morning, evening). */
export function buildBp(trackers: Tracker[], valueOn: ValueOn, today: string): DashboardData["bp"] {
  const get = (slug: string) => {
    const t = trackers.find((x) => x.slug === slug);
    return t ? valueOn(t, today) : undefined;
  };
  return [
    { label: "Morning", sys: get("bp-am-sys"), dia: get("bp-am-dia") },
    { label: "Evening", sys: get("bp-pm-sys"), dia: get("bp-pm-dia") },
  ].map(({ label, sys, dia }) => ({ label, value: sys != null && dia != null ? `${sys}/${dia}` : null }));
}

/** Study minutes today and this week (Monday on), against the daily target, plus the reading page. */
export function buildStudy(trackers: Tracker[], valueOn: ValueOn, today: string): DashboardData["study"] {
  const study = trackers.find((t) => t.slug === "study");
  if (!study) return null;
  const reading = trackers.find((t) => t.slug === "reading-page");
  let weekMin = 0;
  for (let d = weekStart(today); d <= today; d = addDays(d, 1)) weekMin += valueOn(study, d) ?? 0;
  return {
    todayMin: valueOn(study, today) ?? null,
    weekMin,
    dailyTarget: study.target_period === "daily" && study.target != null ? Number(study.target) : null,
    page: reading ? (lastValue(reading, valueOn, today) ?? null) : null,
  };
}

function lastValue(t: Tracker, valueOn: ValueOn, today: string): number | undefined {
  for (let i = 0; i < 14; i++) {
    const v = valueOn(t, addDays(today, -i));
    if (v !== undefined) return v;
  }
  return undefined;
}

/**
 * Winter Arc consistency, 0-100 per season day so far: the share of check-in fields filled
 * (a yes/no counts when it's ticked) plus meals eaten as planned.
 */
export function buildConsistency(season: SeasonRow | null, trackers: Tracker[], valueOn: ValueOn, today: string): Point[] {
  if (!season || trackers.length === 0) return [];
  const meals = trackers.filter((t) => t.type === "choice");
  const fields = trackers.filter((t) => t.type !== "choice");
  const points: Point[] = [];
  for (let d = season.start_date; d <= today && points.length < season.length_days; d = addDays(d, 1)) {
    const filled = fields.filter((t) => {
      const v = valueOn(t, d);
      return v !== undefined && (t.type !== "checkbox" || v >= 1);
    }).length;
    const planned = meals.filter((t) => valueOn(t, d) === 1).length;
    points.push({ date: d, value: Math.round(((filled + planned) / trackers.length) * 100) });
  }
  return points;
}
