import "server-only";
import type { createClient } from "./supabase/server";
import type { BodyCheck, Workout } from "./body";

type Supabase = Awaited<ReturnType<typeof createClient>>;

interface WorkoutRow {
  id: string;
  workout_date: string;
  name: string;
  workout_sets: { position: number; exercise: string; reps: number; weight_kg: number | string | null }[];
}

interface BodyCheckRow {
  check_date: string;
  weight_kg: number | string | null;
  waist_cm: number | string | null;
  chest_cm: number | string | null;
  arms_cm: number | string | null;
  progress_photo: boolean;
}

// Postgres numbers can arrive as strings; null stays null.
const num = (v: number | string | null) => (v == null ? null : Number(v));

/** Workouts with their sets, latest first. `since` = YYYY-MM-DD; `limit` caps the count. Null = database error. */
export async function loadWorkouts(supabase: Supabase, { since, limit }: { since?: string; limit?: number }): Promise<Workout[] | null> {
  let query = supabase
    .from("workouts")
    .select("id, workout_date, name, workout_sets(position, exercise, reps, weight_kg)")
    .order("workout_date", { ascending: false })
    .order("created_at", { ascending: false })
    .order("position", { referencedTable: "workout_sets" });
  if (since) query = query.gte("workout_date", since);
  if (limit) query = query.limit(limit);
  const { data, error } = await query.returns<WorkoutRow[]>();
  if (error) return null;
  return data.map((w) => ({
    id: w.id,
    date: w.workout_date,
    name: w.name,
    sets: w.workout_sets.map((s) => ({ exercise: s.exercise, reps: s.reps, weight: num(s.weight_kg) })),
  }));
}

/** Body checks, latest first. Null = database error. */
export async function loadBodyChecks(supabase: Supabase, limit: number): Promise<BodyCheck[] | null> {
  const { data, error } = await supabase
    .from("body_checks")
    .select("check_date, weight_kg, waist_cm, chest_cm, arms_cm, progress_photo")
    .order("check_date", { ascending: false })
    .limit(limit)
    .returns<BodyCheckRow[]>();
  if (error) return null;
  return data.map((b) => ({
    date: b.check_date,
    weight: num(b.weight_kg),
    waist: num(b.waist_cm),
    chest: num(b.chest_cm),
    arms: num(b.arms_cm),
    photo: b.progress_photo,
  }));
}

/** Goal weight in kg. undefined = database error, null = no goal set. */
export async function loadWeightGoal(supabase: Supabase): Promise<number | null | undefined> {
  const { data, error } = await supabase.from("user_settings").select("weight_goal_kg").maybeSingle<{ weight_goal_kg: number | string | null }>();
  if (error) return undefined;
  return num(data?.weight_goal_kg ?? null);
}
