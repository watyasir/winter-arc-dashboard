import { revalidatePath } from "next/cache";
import { apiError, apiOk, authorizeApi, readJson } from "@/lib/api";
import { parseMoneySnapshot } from "@/lib/money";

/** Saves a money snapshot from Claude's finance task. The Money tiles show the latest one. */
export async function POST(request: Request) {
  const auth = await authorizeApi(request);
  if (auth instanceof Response) return auth;

  const parsed = parseMoneySnapshot(await readJson(request));
  if (!parsed.ok) return apiError(400, parsed.error);

  const { error } = await auth.supabase.from("money_snapshots").insert({ ...parsed.snapshot, user_id: auth.ownerId });
  if (error) return apiError(500, "Couldn't save the snapshot. Has the money_snapshots migration been run?");
  revalidatePath("/");
  return apiOk({ month: parsed.snapshot.month, updated_at: parsed.snapshot.updated_at }, 201);
}
