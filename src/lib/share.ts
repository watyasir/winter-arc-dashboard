import { shortDate } from "@/lib/trackers";
import type { DashboardData } from "@/modules/types";
import { daysBetween, weekStart } from "./dashboard/dates";

/*
  The shareable Winter Arc card (/progress and /demo/progress). Only these numbers
  ever leave the server for the public link: no tracker names, values, tasks or money.
*/
export interface ShareCard {
  name: string;
  length: number;
  /** 0 = started. Before the start date: days until day 1. */
  startsIn: number;
  day: number;
  startLabel: string;
  endLabel: string;
  streak: number;
  bestStreak: number;
  /** Share of finished days with every target hit. null = no finished day yet. */
  targets: { pct: number | null; label: "This week" | "Last week" };
  workouts: { count: number; target: number | null };
  /** kg, latest minus first reading in the last 90 days. null = fewer than two readings. */
  weight: { change: number; sinceLabel: string } | null;
  /** "26 Oct 2026" */
  asOf: string;
}

/** Picks the card's numbers out of the full dashboard. Null = no season set up. */
export function toShareCard(data: DashboardData): ShareCard | null {
  const { season, workouts, weight, todayISO: today } = data;
  if (!season) return null;
  const points = weight.points;

  return {
    name: season.name,
    length: season.length,
    startsIn: season.startsIn,
    day: season.day,
    startLabel: season.startLabel,
    endLabel: season.endLabel,
    streak: season.streak,
    bestStreak: season.bestStreak,
    targets: weekTargets(season.days, season.day, today),
    workouts: { count: workouts.weekCount, target: workouts.weekTarget },
    weight:
      points.length >= 2
        ? { change: Math.round((points.at(-1)!.value - points[0].value) * 10) / 10, sinceLabel: shortDate(points[0].date) }
        : null,
    asOf: `${shortDate(today)} ${today.slice(0, 4)}`,
  };
}

/**
 * % of this week's finished season days (Monday to yesterday) with every target hit.
 * On a Monday there's nothing finished yet, so it shows last week instead.
 */
function weekTargets(days: NonNullable<DashboardData["season"]>["days"], day: number, today: string): ShareCard["targets"] {
  const todayIndex = day - 1;
  const sinceMonday = daysBetween(weekStart(today), today);
  const pct = (from: number, to: number) => {
    const finished = days.slice(Math.max(0, from), Math.max(0, to));
    return finished.length ? Math.round((finished.filter((d) => d === "all").length / finished.length) * 100) : null;
  };
  if (day < 1) return { pct: null, label: "This week" };
  if (sinceMonday > 0) return { pct: pct(todayIndex - sinceMonday, todayIndex), label: "This week" };
  const lastWeek = pct(todayIndex - 7, todayIndex);
  return { pct: lastWeek, label: lastWeek == null ? "This week" : "Last week" };
}
