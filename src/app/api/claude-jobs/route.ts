import { revalidatePath } from "next/cache";
import { apiError, apiOk, authorizeApi, readJson } from "@/lib/api";
import { JOB_COLUMNS, parseJobUpserts } from "@/lib/claude-jobs";

/** Lists Claude's scheduled tasks, soonest next run first. */
export async function GET(request: Request) {
  const auth = await authorizeApi(request);
  if (auth instanceof Response) return auth;
  const { data, error } = await auth.supabase
    .from("claude_jobs")
    .select(JOB_COLUMNS)
    .eq("user_id", auth.ownerId)
    .order("next_run", { ascending: true, nullsFirst: false })
    .order("name");
  if (error) console.error(`GET /api/claude-jobs failed: ${error.message}`);
  if (error) return apiError(500, "Couldn't read the jobs. Has the My Day migration been run?");
  return apiOk({ count: data.length, jobs: data });
}

/** Adds or updates jobs by name. A new job needs only a name; known ones change only what's sent. */
export async function POST(request: Request) {
  const auth = await authorizeApi(request);
  if (auth instanceof Response) return auth;

  const parsed = parseJobUpserts(await readJson(request));
  if (!parsed.ok) {
    console.warn(`POST /api/claude-jobs rejected: ${parsed.error}`);
    return apiError(400, parsed.error);
  }
  // One upsert per job: a shared one would reset fields some jobs didn't send.
  const saved = await Promise.all(
    parsed.jobs.map((j) =>
      auth.supabase.from("claude_jobs").upsert({ ...j, user_id: auth.ownerId }, { onConflict: "user_id,name" }).select(JOB_COLUMNS).single(),
    ),
  );
  const failed = saved.find((r) => r.error)?.error;
  if (failed) console.error(`POST /api/claude-jobs failed: ${failed.message}`);
  if (failed) return apiError(500, "Couldn't save every job; GET /api/claude-jobs shows what's saved.");

  revalidatePath("/", "layout");
  return apiOk({ saved: saved.length, jobs: saved.map((r) => r.data) });
}

/** Deletes one job: ?name=<name>, matched exactly. */
export async function DELETE(request: Request) {
  const auth = await authorizeApi(request);
  if (auth instanceof Response) return auth;

  const name = new URL(request.url).searchParams.get("name")?.trim();
  if (!name) return apiError(400, "name: add ?name=<job name>.");
  const { data, error } = await auth.supabase.from("claude_jobs").delete().eq("user_id", auth.ownerId).eq("name", name).select("name");
  if (error) console.error(`DELETE /api/claude-jobs failed: ${error.message}`);
  if (error) return apiError(500, "Couldn't delete the job. Try again.");
  if (data.length === 0) return apiError(404, `No job named "${name}".`);

  revalidatePath("/", "layout");
  return apiOk({ deleted: name });
}
