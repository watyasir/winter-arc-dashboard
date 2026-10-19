import "server-only";
import type { createClient } from "@/lib/supabase/server";
import { loadTrackers } from "@/lib/tracker-store";
import { addDays, todayISO } from "@/lib/trackers";
import type { DashboardData } from "@/modules/types";
import { buildDashboardData, HISTORY_DAYS, type EntryRow, type SeasonRow } from "./build";

type Supabase = Awaited<ReturnType<typeof createClient>>;

// Supabase returns at most 1,000 rows per request, so longer histories are read in pages.
const PAGE = 1000;

/** Everything the real dashboard shows, read fresh on every visit. Null = couldn't reach the database. */
export async function loadDashboardData(supabase: Supabase, email: string): Promise<DashboardData | null> {
  const today = todayISO();
  const [trackers, seasonResult] = await Promise.all([
    loadTrackers(supabase),
    supabase.from("seasons").select("name, start_date, length_days, targets").eq("is_active", true).maybeSingle<SeasonRow>(),
  ]);
  if (!trackers || seasonResult.error) return null;
  const season = seasonResult.data;

  const historyStart = addDays(today, -HISTORY_DAYS);
  const from = season && season.start_date < historyStart ? season.start_date : historyStart;
  const entries: EntryRow[] = [];
  for (let page = 0; ; page++) {
    const { data, error } = await supabase
      .from("entries")
      .select("tracker_id, entry_date, value")
      .gte("entry_date", from)
      .lte("entry_date", today)
      .order("entry_date")
      .order("tracker_id")
      .range(page * PAGE, page * PAGE + PAGE - 1);
    if (error) return null;
    entries.push(...data.map((e) => ({ ...e, value: Number(e.value) })));
    if (data.length < PAGE) break;
  }

  return buildDashboardData({
    trackers,
    entries,
    season,
    today,
    ownerInitial: email.trim().charAt(0).toUpperCase() || "Me",
  });
}
