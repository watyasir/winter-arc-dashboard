/*
  Today's score on the Overview ring, 0-100, from saved data only. Tune the weights here: they
  are points out of 100 and should add up to 100.
    checkIn: share of check-in fields filled today (yes/no fields count when ticked)
    meals:   share of meal slots eaten as planned
    water:   litres against the water target (capped at the target)
    tasks:   tasks due today that are done (no tasks due today = full points)
*/
export const SCORE_WEIGHTS = { checkIn: 30, meals: 30, water: 20, tasks: 20 };

/** A season day is a "full check-in" on the Winter Arc dots at this consistency score (0-100) or more. */
export const FULL_DAY = 75;

export interface ScoreInput {
  checkIn: { filled: number; total: number };
  meals: { planned: number; total: number };
  water: { litres: number; target: number } | null;
  tasks: { done: number; due: number };
}

const share = (n: number, of: number) => (of > 0 ? Math.min(1, n / of) : 0);

export function todayScore({ checkIn, meals, water, tasks }: ScoreInput): number {
  const w = SCORE_WEIGHTS;
  const points =
    w.checkIn * share(checkIn.filled, checkIn.total) +
    w.meals * share(meals.planned, meals.total) +
    w.water * (water ? share(water.litres, water.target) : 0) +
    w.tasks * (tasks.due === 0 ? 1 : share(tasks.done, tasks.due));
  return Math.round(points);
}

export function scoreMessage(score: number): string {
  if (score >= 100) return "Perfect day";
  if (score >= 75) return "Almost there";
  if (score >= 40) return "Good pace";
  return "Getting started";
}
