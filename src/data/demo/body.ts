import type { BodyCheck, Workout, WorkoutSet } from "@/lib/body";
import { buildBody } from "@/lib/dashboard/body";
import { addDays } from "@/lib/trackers";

/*
  Fake workouts and body checks for /demo: 8 weeks of a push / pull / legs split with
  slowly rising weights. Every number here is made up. "Today" on the demo is 18 Oct 2026.
*/

export const DEMO_TODAY = "2026-10-18";

const sets = (exercise: string, count: number, reps: number, weight: number | null): WorkoutSet[] =>
  Array.from({ length: count }, () => ({ exercise, reps, weight }));

/** Weight that rises 2.5 kg every `every` weeks from `start`. */
const lift = (start: number, week: number, every = 2) => start + Math.floor(week / every) * 2.5;

const sessions: Record<string, (week: number) => WorkoutSet[]> = {
  "Push day": (w) => [...sets("Bench press", 3, 8, lift(50, w)), ...sets("Overhead press", 3, 10, lift(30, w, 3)), ...sets("Dips", 3, 12, null)],
  "Pull day": (w) => [...sets("Deadlift", 3, 5, lift(90, w, 1)), ...sets("Barbell row", 3, 8, lift(45, w)), ...sets("Pull-ups", 3, 8, null)],
  "Leg day": (w) => [...sets("Squat", 4, 6, lift(70, w, 1)), ...sets("Romanian deadlift", 3, 10, lift(55, w)), ...sets("Calf raise", 3, 15, lift(40, w))],
};

// Mon push, Tue pull, Thu legs, Fri push, Sat pull. This week (from 12 Oct) skipped Tue and Sat.
const plan: [number, string][] = [
  [0, "Push day"],
  [1, "Pull day"],
  [3, "Leg day"],
  [4, "Push day"],
  [5, "Pull day"],
];

const FIRST_MONDAY = "2026-08-24";
export const demoWorkouts: Workout[] = Array.from({ length: 8 }, (_, week) =>
  plan
    .filter(([day]) => week < 7 || day === 0 || day === 3 || day === 4)
    .map(([day, name], i) => {
      const date = addDays(FIRST_MONDAY, week * 7 + day);
      return { id: `demo-${week}-${i}`, date, name, sets: sessions[name](week) };
    }),
)
  .flat()
  .reverse(); // latest first

export const DEMO_WEIGHT_GOAL = 76;

const weights = [70.3, 70.6, 70.9, 71.2, 71.4, 71.9, 72.1, 72.4];
export const demoBodyChecks: BodyCheck[] = weights
  .map((weight, i) => ({
    date: addDays("2026-08-23", i * 7),
    weight,
    waist: 80 + Math.round(i * 0.15 * 10) / 10,
    chest: 94 + Math.round(i * 0.5 * 10) / 10,
    arms: 32 + Math.round(i * 0.25 * 10) / 10,
    photo: i % 2 === 0,
  }))
  .reverse();

export const demoBody = buildBody({
  workouts: demoWorkouts,
  bodyChecks: demoBodyChecks,
  today: DEMO_TODAY,
  weekTarget: 5,
});
