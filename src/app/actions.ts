"use server";

import { refresh } from "next/cache";
import { requireUser } from "@/lib/auth";
import { canSnooze, GATE_CHOICES, nextMidnightIST, type GateChoice } from "@/lib/gate";
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

/**
 * An answer on the action gate. Done ticks the task off; Doing it now moves it to In progress;
 * Snooze leaves it; Move date sets a new due date. Each one quiets the task until the next
 * midnight in India, and every answer is written to gate_log.
 */
export async function answerGate(id: string, choice: GateChoice, due?: string): Promise<{ ok: boolean }> {
  if (!GATE_CHOICES.includes(choice)) return { ok: false };
  const today = todayISO();
  if (choice === "move" && !(due && /^\d{4}-\d{2}-\d{2}$/.test(due) && due >= today)) return { ok: false };
  const { supabase, user } = await requireUser();
  const { data: task } = await supabase.from("tasks").select("id, due_date").eq("id", id).maybeSingle();
  if (!task || (choice === "snooze" && task.due_date && !canSnooze(task.due_date, today))) return { ok: false };

  const change = {
    done: { status: "done" },
    doing: { status: "doing" },
    snooze: {},
    move: { due_date: due },
  }[choice];
  const [saved, logged] = await Promise.all([
    supabase.from("tasks").update({ ...change, gate_quiet_until: nextMidnightIST(today), updated_by: "Yasir" }).eq("id", id),
    supabase.from("gate_log").insert({ user_id: user.id, task_id: id, choice, new_due: choice === "move" ? due : null }),
  ]);
  if (saved.error || logged.error) return { ok: false };
  refresh();
  return { ok: true };
}
