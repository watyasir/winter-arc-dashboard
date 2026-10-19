/*
  Workouts and the weekly body check, shared by the forms (browser), the server actions
  and the dashboard builder. Matches supabase/migrations/20261020000002_workouts_body.sql.
*/

export interface WorkoutSet {
  exercise: string;
  reps: number;
  /** Kilograms. null = bodyweight. */
  weight: number | null;
}

export interface Workout {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  name: string;
  /** In the order they were logged. */
  sets: WorkoutSet[];
}

export interface WorkoutInput {
  date: string;
  name: string;
  sets: WorkoutSet[];
}

export interface BodyCheck {
  date: string;
  weight: number | null;
  waist: number | null;
  chest: number | null;
  arms: number | null;
  photo: boolean;
}

export interface BodyCheckInput extends BodyCheck {
  /** Goal weight in kg. null = no goal. */
  goal: number | null;
}

export type SaveResult = { ok: true } | { ok: false; message: string };

/** The measurements on the body check, in form order. */
export const MEASURES = [
  { key: "waist", label: "Waist" },
  { key: "chest", label: "Chest" },
  { key: "arms", label: "Arms" },
] as const;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Exercises in the order they first appear, each with its sets. */
export function groupSets(sets: WorkoutSet[]): { exercise: string; sets: WorkoutSet[] }[] {
  const groups: { exercise: string; sets: WorkoutSet[] }[] = [];
  for (const s of sets) {
    const group = groups.find((g) => g.exercise.toLowerCase() === s.exercise.toLowerCase());
    if (group) group.sets.push(s);
    else groups.push({ exercise: s.exercise, sets: [s] });
  }
  return groups;
}

/** "4 exercises · 14 sets" */
export function workoutSummary(sets: WorkoutSet[]): string {
  const exercises = groupSets(sets).length;
  return `${exercises} ${exercises === 1 ? "exercise" : "exercises"} · ${sets.length} ${sets.length === 1 ? "set" : "sets"}`;
}

/** "8 × 60 kg" or "12 × bodyweight" */
export function formatSet(s: Pick<WorkoutSet, "reps" | "weight">): string {
  return `${s.reps} × ${s.weight == null ? "bodyweight" : `${kg(s.weight)} kg`}`;
}

/** One decimal at most: 72.40 -> "72.4", 60 -> "60". */
export function kg(n: number): string {
  return String(Math.round(n * 10) / 10);
}

/** Returns what's wrong with a workout, or null when it can be saved. */
export function workoutProblem(w: WorkoutInput, today: string): string | null {
  if (!ISO_DATE.test(w.date) || w.date > today) return "Pick a date that isn't in the future.";
  const name = w.name.trim();
  if (!name) return "Give the workout a name, like “Push day”.";
  if (name.length > 60) return "Keep the workout name under 60 characters.";
  if (w.sets.length === 0) return "Add at least one set.";
  if (w.sets.length > 200) return "That's more than 200 sets. Split it into two workouts.";
  for (const s of w.sets) {
    const exercise = s.exercise.trim();
    if (!exercise) return "Every exercise needs a name.";
    if (exercise.length > 60) return "Keep exercise names under 60 characters.";
    if (!Number.isInteger(s.reps) || s.reps < 1 || s.reps > 500) return `${exercise}: reps should be a whole number from 1 to 500.`;
    if (s.weight != null && (!Number.isFinite(s.weight) || s.weight < 0 || s.weight >= 1000)) return `${exercise}: that weight doesn't fit.`;
  }
  return null;
}

/** Returns what's wrong with a body check, or null when it can be saved. */
export function bodyCheckProblem(b: BodyCheckInput, today: string): string | null {
  if (!ISO_DATE.test(b.date) || b.date > today) return "Pick a date that isn't in the future.";
  const fits = (v: number | null, max: number) => v == null || (Number.isFinite(v) && v > 0 && v < max);
  if (!fits(b.weight, 500)) return "Weight: that number doesn't fit.";
  if (!fits(b.goal, 500)) return "Goal weight: that number doesn't fit.";
  if (!fits(b.waist, 300) || !fits(b.chest, 300) || !fits(b.arms, 150)) return "One of the measurements doesn't fit. Use centimetres.";
  if (b.weight == null && b.waist == null && b.chest == null && b.arms == null && !b.photo) return "Fill in at least one number.";
  return null;
}

/** Turns what's typed in a number box into a number. Empty = null. Accepts "72,4" too. */
export function parseNumber(text: string): number | null {
  const cleaned = text.trim().replace(",", ".");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}
