import { revalidatePath } from "next/cache";
import { apiError, apiOk, authorizeApi, readJson } from "@/lib/api";
import { parseDayPlan } from "@/lib/day-plan";

/** The day plan shown as My Day on Overview and in the calendar feed. */
export async function GET(request: Request) {
  const auth = await authorizeApi(request);
  if (auth instanceof Response) return auth;
  const { data, error } = await auth.supabase.from("day_plans").select("plan, updated_at").eq("user_id", auth.ownerId).maybeSingle();
  if (error) console.error(`GET /api/day-plan failed: ${error.message}`);
  if (error) return apiError(500, "Couldn't read the plan. Has the My Day migration been run?");
  return apiOk({ plan: data?.plan ?? null, updated_at: data?.updated_at ?? null });
}

/** Replaces the whole plan. */
export async function POST(request: Request) {
  const auth = await authorizeApi(request);
  if (auth instanceof Response) return auth;

  const parsed = parseDayPlan(await readJson(request));
  if (!parsed.ok) {
    console.warn(`POST /api/day-plan rejected: ${parsed.error}`);
    return apiError(400, parsed.error);
  }
  const { error } = await auth.supabase
    .from("day_plans")
    .upsert({ user_id: auth.ownerId, plan: parsed.plan, updated_at: new Date().toISOString() });
  if (error) console.error(`POST /api/day-plan failed: ${error.message}`);
  if (error) return apiError(500, "Couldn't save the plan. Try again.");

  revalidatePath("/", "layout");
  return apiOk({ phases: parsed.plan.phases.length, sections: parsed.plan.sections.length });
}
