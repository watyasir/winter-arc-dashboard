import "server-only";
import type { createClient } from "./supabase/server";
import { defaultTrackers } from "./default-trackers";
import type { Tracker } from "./trackers";

type Supabase = Awaited<ReturnType<typeof createClient>>;

export const TRACKER_COLUMNS = "id, slug, name, area, type, unit, step, scale_labels, target, target_period, sort_order, group_name";

/** The signed-in user's trackers in order. The first visit (to / or /log) adds the defaults. Null = database error. */
export async function loadTrackers(supabase: Supabase): Promise<Tracker[] | null> {
  const { data: trackers } = await supabase
    .from("trackers")
    .select(TRACKER_COLUMNS)
    .eq("archived", false)
    .order("sort_order")
    .returns<Tracker[]>();
  if (!trackers || trackers.length > 0) return trackers;

  const { data: seeded } = await supabase
    .from("trackers")
    .upsert(defaultTrackers, { onConflict: "user_id,slug", ignoreDuplicates: true })
    .select(TRACKER_COLUMNS)
    .order("sort_order")
    .returns<Tracker[]>();
  return seeded;
}
