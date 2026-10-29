import "server-only";
import { timingSafeEqual } from "node:crypto";
import { loadBodyChecks, loadWorkouts } from "@/lib/body-store";
import { BODY_WEEKS } from "@/lib/dashboard/body";
import { buildDashboardData, type SeasonRow } from "@/lib/dashboard/build";
import { loadEntries } from "@/lib/dashboard/load";
import { createServiceClient } from "@/lib/supabase/service";
import { loadOwnerTrackers } from "@/lib/tracker-store";
import { addDays, todayISO } from "@/lib/trackers";

/*
  Reads for the owner with no one signed in: the public share card and the API for
  Claude's scheduled tasks. They use the secret key, which skips row-level security,
  so every query here filters by the owner's user_id itself.
*/

export type ServiceClient = NonNullable<ReturnType<typeof createServiceClient>>;

/** Compares a secret in constant time, so it can't be guessed a letter at a time. */
export function secretMatches(candidate: string | null | undefined, secret: string | null): boolean {
  if (!secret || !candidate) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** The secret-key client plus the owner's user id (the ALLOWED_EMAIL account). Null = not set up, or the lookup failed. */
export async function ownerClient(): Promise<{ supabase: ServiceClient; ownerId: string } | null> {
  const supabase = createServiceClient();
  const email = process.env.ALLOWED_EMAIL?.trim().toLowerCase();
  if (!supabase || !email) return null;
  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const ownerId = data?.users.find((u) => u.email?.toLowerCase() === email)?.id;
  if (error || !ownerId) return null;
  return { supabase, ownerId };
}

/**
 * Trackers, the active season, today's state and the season so far, built into the same
 * shape the dashboard uses (no tasks, goals or money). Undefined = database error.
 */
export async function loadOwnerDashboard(supabase: ServiceClient, ownerId: string) {
  const today = todayISO();
  const [trackers, seasonResult, workouts, bodyChecks] = await Promise.all([
    loadOwnerTrackers(supabase, ownerId),
    supabase.from("seasons").select("name, start_date, length_days, targets").eq("user_id", ownerId).eq("is_active", true).maybeSingle<SeasonRow>(),
    loadWorkouts(supabase, { since: addDays(today, -7), userId: ownerId }),
    loadBodyChecks(supabase, BODY_WEEKS + 2, ownerId),
  ]);
  if (!trackers || seasonResult.error || !workouts || !bodyChecks) return undefined;
  const season = seasonResult.data;

  // The whole season (for the best streak), and at least this week for workouts.
  const weekAgo = addDays(today, -7);
  const from = season && season.start_date < weekAgo ? season.start_date : weekAgo;
  const entries = await loadEntries(supabase, from, today, ownerId);
  if (!entries) return undefined;

  const data = buildDashboardData({
    trackers,
    entries,
    season,
    today,
    workouts,
    bodyChecks,
    weightGoal: null,
    tasks: [],
    goals: [],
    goalTracked: new Map(),
    ownerInitial: "",
  });
  return { data, trackers, entries, today };
}
