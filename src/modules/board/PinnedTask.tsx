"use client";

import { useDashboard } from "@/components/dashboard/DashboardContext";
import { topHomeTask } from "@/lib/tasks";
import { DueLabel } from "./DueLabel";

/** A slim card at the top of Overview: the open "Home" task with the highest order. Tap opens the Board. */
export function PinnedTask() {
  const { data, tasks, setView } = useDashboard();
  const task = topHomeTask(tasks);
  if (!task) return null;
  return (
    <button
      type="button"
      onClick={() => setView("board")}
      aria-label={`Top priority: ${task.title}. Open Board`}
      className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-2xl border border-sep bg-card px-4 py-2.5 text-left text-ink hover:border-overlay"
    >
      <span className="shrink-0 rounded-full bg-brand/12 px-2.5 py-[3px] text-[11px] font-semibold text-brand-text">Top priority</span>
      <span className="min-w-0 flex-1 truncate text-[14px] font-semibold">{task.title}</span>
      <DueLabel task={task} today={data.todayISO} className="shrink-0" />
    </button>
  );
}
