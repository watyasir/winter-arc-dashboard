"use server";

import { refresh } from "next/cache";
import { requireUser } from "@/lib/auth";
import { todayISO } from "@/lib/trackers";

/** A tap on a yes/no Today row: saves today's entry, then sends the dashboard fresh numbers. */
export async function toggleTodayTracker(trackerId: string, done: boolean): Promise<{ ok: boolean }> {
  const { supabase, user } = await requireUser();
  // Row-level security only returns this user's trackers.
  const { data: tracker } = await supabase.from("trackers").select("id, type").eq("id", trackerId).maybeSingle();
  if (!tracker || tracker.type !== "checkbox") return { ok: false };

  const { error } = await supabase
    .from("entries")
    .upsert(
      { user_id: user.id, tracker_id: trackerId, entry_date: todayISO(), value: done ? 1 : 0 },
      { onConflict: "tracker_id,entry_date" },
    );
  if (error) return { ok: false };
  refresh();
  return { ok: true };
}
