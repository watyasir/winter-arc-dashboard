import { addDays, shortDate } from "./trackers";
import type { Task } from "./tasks";

/*
  The action gate: before the dashboard shows, every open task due within 3 days (India
  time) gets one card to answer. Overdue first, then soonest; tasks Claude marks urgent
  (sort_order below 0) jump the queue. At most 3 cards per open. An answer quiets the task
  until the next midnight in India, so it doesn't come back on every refresh.
*/

export const GATE_CHOICES = ["done", "doing", "snooze", "move"] as const;
export type GateChoice = (typeof GATE_CHOICES)[number];

const GATE_MAX = 3;

/** The tasks the gate asks about this open, in order. */
export function gateQueue(tasks: Task[], today: string): Task[] {
  const until = addDays(today, 3);
  // Answers quiet a task until the next midnight, so "after the start of today" = answered today.
  const startOfToday = Date.parse(`${today}T00:00:00+05:30`);
  return tasks
    .filter((t) => t.status !== "done" && t.due && t.due <= until && !(t.quietUntil && Date.parse(t.quietUntil) > startOfToday))
    .sort((a, b) => {
      const urgentA = a.order < 0 ? 0 : 1;
      const urgentB = b.order < 0 ? 0 : 1;
      if (urgentA !== urgentB) return urgentA - urgentB;
      if (urgentA === 0 && a.order !== b.order) return a.order - b.order;
      return a.due!.localeCompare(b.due!);
    })
    .slice(0, GATE_MAX);
}

/** The chip on the card. Words carry the meaning; colour only repeats it. */
export function gateChip(due: string, today: string): { label: string; tone: "red" | "amber" | "teal" } {
  const date = shortDate(due);
  if (due < today) return { label: `Overdue · ${date}`, tone: "red" };
  if (due === today) return { label: `Due today · ${date}`, tone: "red" };
  if (due === addDays(today, 1)) return { label: `Due tomorrow · ${date}`, tone: "amber" };
  const days = due === addDays(today, 2) ? 2 : 3;
  return { label: `${days} days left · ${date}`, tone: "teal" };
}

/** Snooze is offered unless the task is more than a day overdue. */
export const canSnooze = (due: string, today: string) => due >= addDays(today, -1);

/** The next midnight in India, as an ISO time: when a quieted task can come back. */
export const nextMidnightIST = (today: string) => `${addDays(today, 1)}T00:00:00+05:30`;

/**
 * Next steps and chat name for the card. When Claude hasn't filled them in, they're read
 * from a note written as: Next: call the movers | Chat: "Flat move"
 */
export function gateDetails(task: Task): { nextSteps: string; chatName: string } {
  const hint = /^\s*Next:\s*([\s\S]*?)\s*(?:\|\s*Chat:\s*["“]([^"”]+)["”]\s*)?$/.exec(task.note ?? "");
  return {
    nextSteps: task.nextSteps?.trim() || hint?.[1]?.trim() || "",
    chatName: task.chatName?.trim() || hint?.[2]?.trim() || "",
  };
}
