import "server-only";
import { timingSafeEqual } from "node:crypto";
import { loadBodyChecks, loadWorkouts } from "@/lib/body-store";
import { BODY_WEEKS } from "@/lib/dashboard/body";
import { buildDashboardData, type SeasonRow } from "@/lib/dashboard/build";
import { loadEntries } from "@/lib/dashboard/load";
import { toShareCard, type ShareCard } from "@/lib/share";
import { createServiceClient } from "@/lib/supabase/service";
import { TRACKER_COLUMNS } from "@/lib/tracker-store";
import { addDays, todayISO, type Tracker } from "@/lib/trackers";

/*
  The public side of /progress. Anyone with ?t=<SHARE_TOKEN> sees the Winter Arc card,
  and nothing else: the numbers are worked out here and only the card leaves the server.
*/

/** The secret in the share link. Null = sharing is off. */
export function shareToken(): string | null {
  return process.env.SHARE_TOKEN?.trim() || null;
}

/** Compares in constant time, so the token can't be guessed a letter at a time. */
export function isShareToken(candidate: string | undefined): boolean {
  const token = shareToken();
  if (!token || !candidate) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** The owner's card, read with the secret key. Null = no season; undefined = not set up or database error. */
export async function loadPublicShareCard(): Promise<ShareCard | null | undefined> {
  const supabase = createServiceClient();
  const email = process.env.ALLOWED_EMAIL?.trim().toLowerCase();
  if (!supabase || !email) return undefined;

  const { data: users, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const ownerId = users?.users.find((u) => u.email?.toLowerCase() === email)?.id;
  if (error || !ownerId) return undefined;

  const today = todayISO();
  const [trackers, seasonResult, workouts, bodyChecks] = await Promise.all([
    supabase.from("trackers").select(TRACKER_COLUMNS).eq("user_id", ownerId).eq("archived", false).order("sort_order").returns<Tracker[]>(),
    supabase.from("seasons").select("name, start_date, length_days, targets").eq("user_id", ownerId).eq("is_active", true).maybeSingle<SeasonRow>(),
    loadWorkouts(supabase, { since: addDays(today, -7), userId: ownerId }),
    loadBodyChecks(supabase, BODY_WEEKS + 2, ownerId),
  ]);
  if (trackers.error || seasonResult.error || !workouts || !bodyChecks) return undefined;
  const season = seasonResult.data;
  if (!season) return null;

  // The whole season (for the best streak), and at least this week for workouts.
  const from = season.start_date < addDays(today, -7) ? season.start_date : addDays(today, -7);
  const entries = await loadEntries(supabase, from, today, ownerId);
  if (!entries) return undefined;

  return toShareCard(
    buildDashboardData({
      trackers: trackers.data,
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
    }),
  );
}
