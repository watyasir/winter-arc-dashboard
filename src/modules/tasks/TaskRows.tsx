"use client";

import { CheckBox } from "@/components/Checkbox";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import type { Task } from "@/lib/tasks";
import { DueLabel } from "@/modules/board/DueLabel";

/** Task rows with a tick box. Ticking moves the task to Done; ticking again puts it back in To do. */
export function TaskRows({ tasks, size = "desktop" }: { tasks: Task[]; size?: "desktop" | "phone" }) {
  const { data, moveTask } = useDashboard();
  const phone = size === "phone";
  return (
    <>
      {tasks.map((t) => {
        const done = t.status === "done";
        return (
          <button
            key={t.id}
            type="button"
            aria-pressed={done}
            onClick={() => moveTask(t.id, done ? "todo" : "done")}
            className={`flex w-full cursor-pointer items-center gap-3 border-0 border-solid border-sep bg-transparent p-0 text-left text-ink ${
              phone ? "min-h-[46px] text-[17px] [&:not(:first-child)]:border-t" : "min-h-11 border-t text-sm"
            }`}
          >
            <CheckBox checked={done} />
            <span className={`min-w-0 flex-1 ${done ? "text-sub line-through" : ""}`}>{t.title}</span>
            {t.due === data.todayISO ? (
              <span className={`text-sub ${phone ? "text-[13px]" : "text-xs"}`}>{t.area}</span>
            ) : (
              <DueLabel task={t} today={data.todayISO} className={phone ? "text-[13px]" : "text-xs"} />
            )}
          </button>
        );
      })}
    </>
  );
}

/** Due today (still open, or ticked off today so the tick stays visible) and overdue tasks. */
export function useTaskLists() {
  const { data, tasks } = useDashboard();
  const today = data.todayISO;
  return {
    dueToday: tasks.filter((t) => t.due === today),
    overdue: tasks.filter((t) => t.due != null && t.due < today && t.status !== "done"),
  };
}
