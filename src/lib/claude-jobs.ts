/*
  Claude's scheduled tasks (claude_jobs table), shown beside the Board and never mixed
  with Yasir's tasks. Claude reports them through POST /api/claude-jobs, by name.
*/

const JOB_STATUSES = ["ok", "failed", "running", "scheduled", "paused"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export interface ClaudeJob {
  name: string;
  schedule: string;
  status: JobStatus;
  /** ISO times, or null. */
  lastRun: string | null;
  nextRun: string | null;
}

export const JOB_COLUMNS = "name, schedule, status, last_run, next_run, updated_at";

/** One job's changes, in database columns. Only the fields that were sent. */
interface JobUpsert {
  name: string;
  schedule?: string;
  status?: JobStatus;
  last_run?: string | null;
  next_run?: string | null;
  updated_at: string;
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const isTime = (v: unknown) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v) && !Number.isNaN(Date.parse(v));

/** Checks the body of POST /api/claude-jobs: one job, a list, or { "jobs": [...] }. */
export function parseJobUpserts(body: unknown): { ok: true; jobs: JobUpsert[] } | { ok: false; error: string } {
  const fail = (error: string) => ({ ok: false as const, error });
  const single = isObject(body) && !Array.isArray(body.jobs);
  const list = Array.isArray(body) ? body : single ? [body] : isObject(body) ? (body.jobs as unknown[]) : null;
  if (!list) return fail('Send a job object, a list of jobs, or { "jobs": [...] }.');
  if (list.length === 0 || list.length > 50) return fail("jobs: send 1 to 50 jobs.");

  const jobs: JobUpsert[] = [];
  const seen = new Set<string>();
  const now = new Date().toISOString();
  for (const [i, raw] of list.entries()) {
    const at = single ? "" : `jobs[${i}].`;
    if (!isObject(raw)) return fail(`${single ? "job" : `jobs[${i}]`}: send an object.`);
    const { name, schedule, status, last_run, next_run } = raw;
    if (typeof name !== "string" || !name.trim() || name.trim().length > 100) return fail(`${at}name: text, 1 to 100 characters.`);
    if (seen.has(name.trim())) return fail(`${at}name: "${name.trim()}" is in the list twice.`);
    seen.add(name.trim());

    const job: JobUpsert = { name: name.trim(), updated_at: now };
    if (schedule !== undefined) {
      if (typeof schedule !== "string" || schedule.trim().length > 100) return fail(`${at}schedule: text, up to 100 characters, like "Daily 8:45 AM".`);
      job.schedule = schedule.trim();
    }
    if (status !== undefined) {
      if (!JOB_STATUSES.includes(status as JobStatus)) return fail(`${at}status: one of ${JOB_STATUSES.join(", ")}.`);
      job.status = status as JobStatus;
    }
    for (const [key, value] of [["last_run", last_run], ["next_run", next_run]] as const) {
      if (value === undefined) continue;
      if (value !== null && !isTime(value)) return fail(`${at}${key}: an ISO time like 2026-10-27T08:45:00+05:30, or null.`);
      job[key] = value as string | null;
    }
    jobs.push(job);
  }
  return { ok: true, jobs };
}
