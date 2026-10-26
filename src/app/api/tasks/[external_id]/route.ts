import { revalidatePath } from "next/cache";
import { apiError, apiOk, authorizeApi } from "@/lib/api";

/** Deletes one task by its external_id. */
export async function DELETE(request: Request, { params }: { params: Promise<{ external_id: string }> }) {
  const auth = await authorizeApi(request);
  if (auth instanceof Response) return auth;

  const { external_id } = await params;
  const { data, error } = await auth.supabase
    .from("tasks")
    .delete()
    .eq("user_id", auth.ownerId)
    .eq("external_id", external_id)
    .select("external_id");
  if (error) console.error(`DELETE /api/tasks failed: ${error.message}`);
  if (error) return apiError(500, "Couldn't delete the task. Has the tasks API migration been run?");
  if (data.length === 0) return apiError(404, `No task with external_id "${external_id}".`);

  revalidatePath("/", "layout");
  return apiOk({ deleted: external_id });
}
