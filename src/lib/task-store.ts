import "server-only";
import type { createClient } from "./supabase/server";
import type { Goal, Owner, Task, TaskStatus } from "./tasks";

type Supabase = Awaited<ReturnType<typeof createClient>>;

type TaskRow = {
  id: string;
  title: string;
  area: string;
  due_date: string | null;
  status: TaskStatus;
  owner: Owner;
  note: string | null;
  sort_order: number;
  done_at: string | null;
  next_steps: string | null;
  questions: string[] | null;
  chat_name: string | null;
  gate_quiet_until: string | null;
};

const TASK_COLUMNS = "id, title, area, due_date, status, owner, done_at, note, sort_order, next_steps, questions, chat_name, gate_quiet_until";

/** Every task (the Board shows the latest 20 done, with "Show all"). Null = database error. */
export async function loadTasks(supabase: Supabase): Promise<Task[] | null> {
  const { data, error } = await supabase.from("tasks").select(TASK_COLUMNS).order("created_at").returns<TaskRow[]>();
  if (error || !data) return null;
  return data.map((t) => ({
    id: t.id,
    title: t.title,
    area: t.area,
    due: t.due_date,
    status: t.status,
    owner: t.owner,
    note: t.note,
    order: t.sort_order,
    doneAt: t.done_at,
    nextSteps: t.next_steps,
    questions: t.questions ?? [],
    chatName: t.chat_name,
    quietUntil: t.gate_quiet_until,
  }));
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
