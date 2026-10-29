import "server-only";
import type { createClient } from "./supabase/server";
import type { createServiceClient } from "./supabase/service";
import { defaultTrackers } from "./default-trackers";
import type { Tracker } from "./trackers";

type Supabase = Awaited<ReturnType<typeof createClient>>;
type ServiceClient = NonNullable<ReturnType<typeof createServiceClient>>;

const BASE_COLUMNS = "id, slug, name, area, type, unit, step, scale_labels, target, target_period, sort_order";
/** group_name comes from migration 20261030000001_day_plan_log.sql. */
const TRACKER_COLUMNS = `${BASE_COLUMNS}, group_name`;

/** Postgres "column does not exist": a migration hasn't been run yet. */
const missingColumn = (error: { code?: string } | null) => error?.code === "42703";

/**
 * The signed-in user's trackers in order, and whether a migration is still to run (pending:
 * the app works on the old columns, and the new check-in rows appear once it's run).
 * The first visit (to / or /log) adds the defaults. Null = database error.
 */
export async function loadTrackersWithStatus(supabase: Supabase): Promise<{ trackers: Tracker[]; pending: boolean } | null> {
  const select = (columns: string) => supabase.from("trackers").select(columns).eq("archived", false).order("sort_order").returns<Tracker[]>();
  let pending = false;
  let { data: trackers, error } = await select(TRACKER_COLUMNS);
  if (missingColumn(error)) {
    pending = true;
    ({ data: trackers, error } = await select(BASE_COLUMNS));
    trackers = trackers?.map((t) => ({ ...t, group_name: null })) ?? null;
  }
  if (!trackers) return null;
  if (trackers.length > 0) return { trackers, pending };

  // Before the migration, only the trackers the old schema can hold (none of them set group_name).
  const defaults = pending ? defaultTrackers.filter((t) => !t.group_name && t.type !== "time_of_day" && t.type !== "choice") : defaultTrackers;
  const { data: seeded } = await supabase
    .from("trackers")
    .upsert(defaults, { onConflict: "user_id,slug", ignoreDuplicates: true })
    .select(pending ? BASE_COLUMNS : TRACKER_COLUMNS)
    .order("sort_order")
    .returns<Tracker[]>();
  return seeded ? { trackers: seeded.map((t) => ({ ...t, group_name: t.group_name ?? null })), pending } : null;
}

/** The owner's trackers through the secret-key client (share card, API), with the same fallback. */
export async function loadOwnerTrackers(supabase: ServiceClient, ownerId: string): Promise<Tracker[] | null> {
  const select = (columns: string) =>
    supabase.from("trackers").select(columns).eq("user_id", ownerId).eq("archived", false).order("sort_order").returns<Tracker[]>();
  const first = await select(TRACKER_COLUMNS);
  if (!missingColumn(first.error)) return first.data;
  const { data } = await select(BASE_COLUMNS);
  return data?.map((t) => ({ ...t, group_name: null })) ?? null;
}

export async function loadTrackers(supabase: Supabase): Promise<Tracker[] | null> {
  return (await loadTrackersWithStatus(supabase))?.trackers ?? null;
}
