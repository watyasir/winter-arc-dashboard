import { TASK_STATUSES, type Owner, type TaskStatus } from "./tasks";

/*
  Checking bodies for /api/tasks (docs/API.md). Claude's task list sends tasks by
  external_id; a new one needs a title, an existing one can send only what changed.
  Matches supabase/migrations/20261027000002_tasks_api.sql.
*/

/** The columns sent back by GET /api/tasks and written by POST. */
export const TASK_API_COLUMNS = "external_id, title, status, owner, area, due_date, note, sort_order, updated_at, updated_by, done_at";

const MAX_TASKS = 100;

/** The database keeps "Me" for Yasir; the API says "Yasir". */
const OWNERS: Record<string, Owner> = { yasir: "Me", me: "Me", claude: "Claude", both: "Both" };
export const apiOwner = (owner: Owner) => (owner === "Me" ? "Yasir" : owner);

/** One task's changes, in database columns. Only the fields that were sent. */
interface TaskUpsert {
  external_id: string;
  title?: string;
  status?: TaskStatus;
  owner?: Owner;
  area?: string;
  due_date?: string | null;
  note?: string | null;
  sort_order?: number;
  updated_by: "Yasir" | "Claude";
}

type Parsed = { ok: true; tasks: TaskUpsert[] } | { ok: false; error: string };

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const isDate = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

/** Reads ?status=todo,doing. Undefined = no filter; a string = the error to send. */
export function parseStatusFilter(param: string | null): TaskStatus[] | undefined | string {
  if (!param) return undefined;
  const wanted = param.split(",").map((s) => s.trim());
  const bad = wanted.find((s) => !TASK_STATUSES.includes(s as TaskStatus));
  if (bad !== undefined) return `status: "${bad}" isn't one of ${TASK_STATUSES.join(", ")}.`;
  return wanted as TaskStatus[];
}

/** Checks the JSON body of POST /api/tasks: one task, a list, or { "tasks": [...] }. */
export function parseTaskUpserts(body: unknown): Parsed {
  const fail = (error: string): Parsed => ({ ok: false, error });
  const single = isObject(body) && !Array.isArray(body.tasks);
  const list = Array.isArray(body) ? body : single ? [body] : isObject(body) ? (body.tasks as unknown[]) : null;
  if (!list) return fail("Send a task object, a list of tasks, or { \"tasks\": [...] }.");
  if (list.length === 0 || list.length > MAX_TASKS) return fail(`tasks: send 1 to ${MAX_TASKS} tasks.`);

  const tasks: TaskUpsert[] = [];
  const seen = new Set<string>();
  for (const [i, raw] of list.entries()) {
    // Errors name the field, and its list position when a list was sent.
    const at = single ? "" : `tasks[${i}].`;
    if (!isObject(raw)) return fail(`${single ? "task" : `tasks[${i}]`}: send an object.`);
    const { external_id, title, status, owner, area, due_date, note, sort_order, updated_by } = raw;

    if (typeof external_id !== "string" || !external_id.trim() || external_id.trim().length > 100) {
      return fail(`${at}external_id: text, 1 to 100 characters.`);
    }
    const id = external_id.trim();
    if (seen.has(id)) return fail(`${at}external_id: "${id}" is in the list twice.`);
    seen.add(id);

    const task: TaskUpsert = { external_id: id, updated_by: "Claude" };
    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim() || title.trim().length > 120) return fail(`${at}title: text, 1 to 120 characters.`);
      task.title = title.trim();
    }
    if (status !== undefined) {
      if (!TASK_STATUSES.includes(status as TaskStatus)) return fail(`${at}status: one of ${TASK_STATUSES.join(", ")}.`);
      task.status = status as TaskStatus;
    }
    if (owner !== undefined) {
      const o = typeof owner === "string" ? OWNERS[owner.trim().toLowerCase()] : undefined;
      if (!o) return fail(`${at}owner: Yasir, Claude or Both.`);
      task.owner = o;
    }
    if (area !== undefined) {
      if (area !== null && (typeof area !== "string" || area.trim().length > 40)) return fail(`${at}area: text, up to 40 characters.`);
      task.area = area?.trim() ?? "";
    }
    if (due_date !== undefined) {
      if (due_date !== null && !isDate(due_date)) return fail(`${at}due_date: YYYY-MM-DD, or null for none.`);
      task.due_date = due_date;
    }
    if (note !== undefined) {
      if (note !== null && (typeof note !== "string" || note.trim().length > 500)) return fail(`${at}note: text, up to 500 characters, or null.`);
      task.note = note?.trim() || null;
    }
    if (sort_order !== undefined) {
      if (!Number.isInteger(sort_order) || Math.abs(sort_order as number) > 1e6) return fail(`${at}sort_order: a whole number (higher = more important).`);
      task.sort_order = sort_order as number;
    }
    if (updated_by !== undefined) {
      if (updated_by !== "Yasir" && updated_by !== "Claude") return fail(`${at}updated_by: Yasir or Claude (default Claude).`);
      task.updated_by = updated_by;
    }
    tasks.push(task);
  }
  return { ok: true, tasks };
}
