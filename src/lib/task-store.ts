import "server-only";
import type { createClient } from "./supabase/server";
import type { Goal, Owner, Task, TaskStatus } from "./tasks";

type Supabase = Awaited<ReturnType<typeof createClient>>;

/** How long done tasks stay in the Done column. */
const DONE_DAYS = 14;

/** Open tasks plus the ones done in the last two weeks, soonest due first. Null = database error. */
export async function loadTasks(supabase: Supabase): Promise<Task[] | null> {
  const doneSince = new Date(Date.now() - DONE_DAYS * 86_400_000).toISOString();
  const { data, error } = await supabase
    .from("tasks")
    .select("id, title, area, due_date, status, owner")
    .or(`status.neq.done,done_at.gte.${doneSince}`)
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at")
    .returns<{ id: string; title: string; area: string; due_date: string | null; status: TaskStatus; owner: Owner }[]>();
  if (error || !data) return null;
  return data.map((t) => ({ id: t.id, title: t.title, area: t.area, due: t.due_date, status: t.status, owner: t.owner }));
}

/** Goals, nearest deadline first, with each linked tracker's total since the goal started. Null = database error. */
export async function loadGoals(supabase: Supabase): Promise<{ goals: Goal[]; tracked: Map<string, number> } | null> {
  const [goals, progress] = await Promise.all([
    supabase
      .from("goals")
      .select("id, title, area, target, unit, deadline, tracker_id, current")
      .order("deadline", { ascending: true, nullsFirst: false })
      .order("created_at"),
    supabase.from("goal_progress").select("goal_id, tracked"),
  ]);
  if (goals.error || progress.error) return null;
  return {
    goals: goals.data.map((g) => ({
      id: g.id,
      title: g.title,
      area: g.area,
      target: Number(g.target),
      unit: g.unit,
      deadline: g.deadline,
      trackerId: g.tracker_id,
      current: Number(g.current),
    })),
    tracked: new Map(progress.data.map((p) => [p.goal_id as string, Number(p.tracked)])),
  };
}
