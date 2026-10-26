"use server";

import { refresh } from "next/cache";
import { requireUser } from "@/lib/auth";
import { TASK_STATUSES, taskProblem, type NewTask, type TaskStatus } from "@/lib/tasks";
import { todayISO } from "@/lib/trackers";

/** A tap on a yes/no Today row: saves today's entry, then sends the dashboard fresh numbers. */
export async function toggleTodayTracker(trackerId: string, done: boolean): Promise<{ ok: boolean }> {
  const { supabase, user } = await requireUser();
  // Row-level security only returns this user's trackers.
  const { data: tracker } = await supabase.from("trackers").select("id, type").eq("id", trackerId).maybeSingle();
  if (!tracker || tracker.type !== "checkbox") return { ok: false };

  const { error } = await supabase
    .from("entries")
    .upsert(
      { user_id: user.id, tracker_id: trackerId, entry_date: todayISO(), value: done ? 1 : 0 },
      { onConflict: "tracker_id,entry_date" },
    );
  if (error) return { ok: false };
  refresh();
  return { ok: true };
}

/** The columns the Board's sheet saves. Changes from the app are marked as Yasir's. */
const taskRow = (task: NewTask) => ({
  title: task.title.trim(),
  area: task.area.trim(),
  due_date: task.due || null,
  status: task.status,
  note: task.note.trim() || null,
  owner: task.owner,
  updated_by: "Yasir",
});

/** Adds a task from the Board. */
export async function addTask(task: NewTask): Promise<{ ok: boolean }> {
  if (taskProblem(task)) return { ok: false };
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("tasks").insert({ user_id: user.id, ...taskRow(task) });
  if (error) return { ok: false };
  refresh();
  return { ok: true };
}

/** Saves the Board's edit sheet. */
export async function updateTask(id: string, task: NewTask): Promise<{ ok: boolean }> {
  if (taskProblem(task)) return { ok: false };
  const { supabase } = await requireUser();
  // Row-level security limits this to the user's own tasks.
  const { error } = await supabase.from("tasks").update(taskRow(task)).eq("id", id);
  if (error) return { ok: false };
  refresh();
  return { ok: true };
}

/** Moves a task to another Board column (Done ticks it off). */
export async function moveTask(id: string, status: TaskStatus): Promise<{ ok: boolean }> {
  if (!TASK_STATUSES.includes(status)) return { ok: false };
  const { supabase } = await requireUser();
  const { error } = await supabase.from("tasks").update({ status, updated_by: "Yasir" }).eq("id", id);
  if (error) return { ok: false };
  refresh();
  return { ok: true };
}

export async function deleteTask(id: string): Promise<{ ok: boolean }> {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) return { ok: false };
  refresh();
  return { ok: true };
}
