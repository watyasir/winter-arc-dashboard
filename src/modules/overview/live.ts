"use client";

import { useDashboard } from "@/components/dashboard/DashboardContext";
import { todayScore } from "@/lib/score";

/*
  Today's water and meals as shown right now: what was loaded, plus taps on the Overview that
  are saving or saved (DashboardContext.entries). The score uses the same numbers.
*/

const MEAL_WORDS = ["Planned", "Swapped", "Skipped"];

export function useLiveWater() {
  const { data, entries } = useDashboard();
  const water = data.water;
  if (!water) return null;
  const litres = "water" in entries ? entries.water : water.litres;
  return { ...water, litres: litres ?? 0 };
}

export function useLiveMeals() {
  const { data, entries } = useDashboard();
  return data.meals.map((m) => {
    const key = `meal:${m.name}`;
    return key in entries ? { ...m, key, status: entries[key] == null ? null : MEAL_WORDS[entries[key]! - 1] } : { ...m, key };
  });
}

/** The ring's score from saved data (src/lib/score.ts has the weights). */
export function useLiveScore() {
  const { data, tasks } = useDashboard();
  const water = useLiveWater();
  const meals = useLiveMeals();
  const f = data.checkInFields;
  const dueToday = tasks.filter((t) => t.due === data.todayISO);
  return todayScore({
    checkIn: { filled: f.filled - (f.water ? 1 : 0) + (water && water.litres > 0 ? 1 : 0), total: f.total },
    meals: { planned: meals.filter((m) => m.status === "Planned").length, total: meals.length },
    water: water ? { litres: water.litres, target: water.target } : null,
    tasks: { done: dueToday.filter((t) => t.status === "done").length, due: dueToday.length },
  });
}
