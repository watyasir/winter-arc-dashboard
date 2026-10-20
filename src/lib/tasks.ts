/*
  Task and goal shapes, shared by the real dashboard and /demo.
  Matches supabase/migrations/20261021000001_tasks_goals.sql.
*/

export type TaskStatus = "todo" | "doing" | "waiting" | "done";
export type Owner = "Me" | "Claude" | "Both";

export interface Task {
  id: string;
  title: string;
  area: string;
  /** YYYY-MM-DD, or null for no due date. */
  due: string | null;
  status: TaskStatus;
  owner: Owner;
}

export interface NewTask {
  title: string;
  area: string;
  due: string | null;
  status: TaskStatus;
}

/** The Board columns, in order. */
export const TASK_COLUMNS: { status: TaskStatus; name: string }[] = [
  { status: "todo", name: "To do" },
  { status: "doing", name: "In progress" },
  { status: "waiting", name: "Waiting" },
  { status: "done", name: "Done" },
];

export const TASK_STATUSES = TASK_COLUMNS.map((c) => c.status);

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** What's wrong with a new task, or null if it can be saved. */
export function taskProblem(t: NewTask): string | null {
  if (!t.title.trim()) return "Give the task a title.";
  if (t.title.trim().length > 120) return "Keep the title under 120 characters.";
  if (t.area.trim().length > 40) return "Keep the area under 40 characters.";
  if (t.due && !ISO_DATE.test(t.due)) return "Pick a due date from the calendar.";
  if (!TASK_STATUSES.includes(t.status)) return "Pick a column.";
  return null;
}

/** "soon" = due within 3 days (yellow), "overdue" = past due (coral). Done tasks are never late. */
export function dueState(task: Task, today: string): "soon" | "overdue" | undefined {
  if (!task.due || task.status === "done") return undefined;
  if (task.due < today) return "overdue";
  const [y, m, d] = today.split("-").map(Number);
  const inThree = new Date(Date.UTC(y, m - 1, d + 3)).toISOString().slice(0, 10);
  return task.due <= inThree ? "soon" : undefined;
}

// ---------------------------------------------------------------- goals

export interface Goal {
  id: string;
  title: string;
  area: string;
  target: number;
  unit: string | null;
  /** YYYY-MM-DD or null. */
  deadline: string | null;
  /** null = progress typed in by hand. */
  trackerId: string | null;
  /** Hand-typed progress (ignored when linked to a tracker). */
  current: number;
}

export interface NewGoal {
  title: string;
  area: string;
  target: number | null;
  unit: string;
  deadline: string | null;
  trackerId: string | null;
}

export function goalProblem(g: NewGoal): string | null {
  if (!g.title.trim()) return "Give the goal a name.";
  if (g.title.trim().length > 60) return "Keep the name under 60 characters.";
  if (g.target == null || !(g.target > 0)) return "Set a target above 0.";
  if (g.unit.trim().length > 12) return "Keep the unit short, like kg or km.";
  if (g.deadline && !ISO_DATE.test(g.deadline)) return "Pick a deadline from the calendar.";
  return null;
}
