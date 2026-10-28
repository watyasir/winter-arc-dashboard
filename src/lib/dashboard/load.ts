import "server-only";
import type { createClient } from "@/lib/supabase/server";
import { loadBodyChecks, loadWeightGoal, loadWorkouts } from "@/lib/body-store";
import { JOB_COLUMNS } from "@/lib/claude-jobs";
import { MONEY_COLUMNS, type MoneySnapshot } from "@/lib/money";
import { loadGoals, loadTasks } from "@/lib/task-store";
import { loadTrackers } from "@/lib/tracker-store";
import { addDays, todayISO } from "@/lib/trackers";
import type { DashboardData } from "@/modules/types";
import { BODY_WEEKS } from "./body";
import { buildDashboardData, HISTORY_DAYS, type EntryRow, type SeasonRow } from "./build";

type Supabase = Awaited<ReturnType<typeof createClient>>;

// Supabase returns at most 1,000 rows per request, so longer histories are read in pages.
const PAGE = 1000;

/**
 * Entries between two dates (inclusive), oldest first. Null = database error.
 * `userId` is only for the share card's server-side read, which isn't limited by row-level security.
 */
export async function loadEntries(supabase: Supabase, from: string, to: string, userId?: string): Promise<EntryRow[] | null> {
  const entries: EntryRow[] = [];
  for (let page = 0; ; page++) {
    let query = supabase.from("entries").select("tracker_id, entry_date, value");
    if (userId) query = query.eq("user_id", userId);
    const { data, error } = await query
      .gte("entry_date", from)
      .lte("entry_date", to)
      .order("entry_date")
      .order("tracker_id")
      .range(page * PAGE, page * PAGE + PAGE - 1);
    if (error) return null;
    entries.push(...data.map((e) => ({ ...e, value: Number(e.value) })));
    if (data.length < PAGE) return entries;
  }
}

/** Everything the real dashboard shows, read fresh on every visit. Null = couldn't reach the database. */
export async function loadDashboardData(supabase: Supabase, email: string): Promise<DashboardData | null> {
  const today = todayISO();
  const historyStart = addDays(today, -HISTORY_DAYS);
  const [trackers, seasonResult, workouts, bodyChecks, weightGoal, tasks, goals, recent, moneyResult, jobsResult] = await Promise.all([
    loadTrackers(supabase),
    supabase.from("seasons").select("name, start_date, length_days, targets").eq("is_active", true).maybeSingle<SeasonRow>(),
    loadWorkouts(supabase, { since: addDays(today, -BODY_WEEKS * 7) }),
    // Weekly, so this covers the chart window plus the check before it.
    loadBodyChecks(supabase, BODY_WEEKS + 2),
    loadWeightGoal(supabase),
    loadTasks(supabase),
    loadGoals(supabase),
    loadEntries(supabase, historyStart, today),
    // Not fatal: before the money migration runs (or with no snapshot yet) the tile shows its empty state.
    supabase.from("money_snapshots").select(MONEY_COLUMNS).order("updated_at", { ascending: false }).limit(1).maybeSingle<MoneySnapshot>(),
    // Not fatal either: no jobs yet = the panel's empty state.
    supabase.from("claude_jobs").select(JOB_COLUMNS).order("next_run", { ascending: true, nullsFirst: false }).order("name"),
  ]);
  if (!trackers || seasonResult.error || !workouts || !bodyChecks || weightGoal === undefined || !tasks || !goals || !recent) return null;
  const season = seasonResult.data;

  // Once the season is older than the history window, read its earlier days too.
  let entries = recent;
  if (season && season.start_date < historyStart) {
    const earlier = await loadEntries(supabase, season.start_date, addDays(historyStart, -1));
    if (!earlier) return null;
    entries = [...earlier, ...recent];
  }

  return buildDashboardData({
    trackers,
    entries,
    season,
    today,
    workouts,
    bodyChecks,
    weightGoal,
    tasks,
    goals: goals.goals,
    goalTracked: goals.tracked,
    money: moneyResult.error ? null : moneyResult.data,
    claudeJobs: (jobsResult.data ?? []).map((j) => ({ name: j.name, schedule: j.schedule, status: j.status, lastRun: j.last_run, nextRun: j.next_run })),
    ownerInitial: email.trim().charAt(0).toUpperCase() || "Me",
  });
}
