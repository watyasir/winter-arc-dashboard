/*
  Task and goal shapes, shared by the real dashboard and /demo.
  Matches supabase/migrations/…_tasks_goals.sql, …_tasks_api.sql and …_my_day_gate_jobs.sql.
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
  /** A short line under the title, or null. */
  note: string | null;
  /** Higher = more important. Claude sets it through the API. */
  order: number;
  /** ISO time the task moved to Done, or null. */
  doneAt: string | null;
  /** For the action gate (src/lib/gate.ts), set by Claude through the API. */
  nextSteps: string | null;
  questions: string[];
  chatName: string | null;
  /** Answered on the gate: not asked again before this ISO time. */
  quietUntil: string | null;
}

/** What the Board's add and edit sheet saves. */
export interface NewTask {
  title: string;
  area: string;
  due: string | null;
  status: TaskStatus;
  note: string;
  owner: Owner;
}

/** The Board columns, in order. */
export const TASK_COLUMNS: { status: TaskStatus; name: string }[] = [
  { status: "todo", name: "To do" },
  { status: "doing", name: "In progress" },
  { status: "waiting", name: "Waiting on others" },
  { status: "done", name: "Done" },
];

export const OWNERS: Owner[] = ["Me", "Claude", "Both"];

export const TASK_STATUSES = TASK_COLUMNS.map((c) => c.status);

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** What's wrong with a new task, or null if it can be saved. */
export function taskProblem(t: NewTask): string | null {
  if (!t.title.trim()) return "Give the task a title.";
  if (t.title.trim().length > 120) return "Keep the title under 120 characters.";
  if (t.area.trim().length > 40) return "Keep the area under 40 characters.";
  if (t.due && !ISO_DATE.test(t.due)) return "Pick a due date from the calendar.";
  if (!TASK_STATUSES.includes(t.status)) return "Pick a column.";
  if (t.note.trim().length > 500) return "Keep the note under 500 characters.";
  if (!OWNERS.includes(t.owner)) return "Pick who's on it.";
  return null;
}

/** Board order: most important first, then soonest due. Done: latest done first. */
export function boardOrder(a: Task, b: Task): number {
  if (a.status === "done" && b.status === "done") return (b.doneAt ?? "").localeCompare(a.doneAt ?? "");
  if (a.order !== b.order) return b.order - a.order;
  return (a.due ?? "9999").localeCompare(b.due ?? "9999");
}

/** The pinned card on Overview: the open "Home" task with the highest order. */
export function topHomeTask(tasks: Task[]): Task | undefined {
  return tasks.filter((t) => t.status !== "done" && t.area.trim().toLowerCase() === "home").sort(boardOrder)[0];
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
