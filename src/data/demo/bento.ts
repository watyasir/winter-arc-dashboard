import { addDays } from "@/lib/trackers";
import type { DashboardData, HeroDay, Point } from "@/modules/types";
import { DEMO_TODAY } from "./body";

/*
  Made-up numbers for the Overview tiles and charts on /demo. "Today" is 18 Oct 2026,
  day 23 of a season that started 26 Sep. Nothing here is real.
*/

/** A gentle made-up wave, the same on every build. */
const wave = (i: number, seed: number) => Math.sin(i * 0.9 + seed) * 0.5 + Math.sin(i * 0.37 + seed * 2) * 0.5;

function daily(days: number, value: (i: number) => number | null): Point[] {
  return Array.from({ length: days }, (_, i) => ({ date: addDays(DEMO_TODAY, i - days + 1), v: value(i) }))
    .filter((p): p is { date: string; v: number } => p.v != null)
    .map(({ date, v }) => ({ date, value: v }));
}

const SEASON_START = "2026-09-26";
// Days 8 and 16 were missed; every third day was partial; everything else up to today is a full check-in.
const days: HeroDay[] = Array.from({ length: 90 }, (_, i) => (i > 22 ? "ahead" : i === 7 || i === 15 ? "missed" : i % 3 === 2 ? "partial" : "full"));

export const demoBento: Pick<
  DashboardData,
  "hero" | "checkedIn" | "plan" | "steps" | "sleep" | "meals" | "water" | "checkInFields" | "bp" | "fund" | "study" | "consistency" | "weight"
> = {
  hero: { day: 23, length: 90, startsIn: 0, daysLeft: 67, checkIns: 21, finishLabel: "24 Dec", start: SEASON_START, days, streak: 7, todayIndex: 22 },
  checkedIn: true,
  // 18 Oct 2026 is a Sunday.
  plan: { shift: "Weekend off", now: "Rest and review till 9:00 PM", shiftStart: null, shiftEnd: null },
  water: { litres: 1.5, target: 3, step: 0.5 },
  checkInFields: { filled: 9, total: 16, water: true },
  weight: {
    unit: "kg",
    goal: 76,
    // Rising about 0.5 kg a week, weighed most days.
    points: daily(90, (i) => (i % 5 === 3 ? null : Math.round((68.6 + i * 0.07 + wave(i, 1) * 0.3) * 10) / 10)),
  },
  steps: daily(90, (i) => Math.round(7200 + wave(i, 2) * 2600 + (i % 7 === 6 ? -2500 : 0))),
  sleep: daily(90, (i) => Math.round((7 + wave(i, 3) * 0.9) * 10) / 10),
  meals: [
    { name: "Pre-gym", status: "Planned" },
    { name: "Breakfast", status: "Planned" },
    { name: "Lunch", status: "Swapped" },
    { name: "Snack 1", status: "Planned" },
    { name: "Dinner", status: null },
    { name: "Snack 2", status: null },
    { name: "Night", status: null },
  ],
  bp: [
    { label: "Morning", value: "118/76" },
    { label: "Evening", value: null },
  ],
  fund: { name: "1RK fund", progress: "₹42,000 of ₹1,00,000", pct: 42, by: "by 31 Jan 2027" },
  study: { todayMin: 60, weekMin: 330, dailyTarget: 90, page: 142 },
  consistency: Array.from({ length: 23 }, (_, i) => ({
    date: addDays(SEASON_START, i),
    value: i === 7 || i === 15 ? 12 : Math.round(72 + wave(i, 4) * 14 + i * 0.4),
  })),
};
