"use client";

import { Card } from "@/components/Card";
import { CardHeader, SectionHeading } from "@/components/SectionHeading";
import { EmptyNote } from "@/components/EmptyNote";
import { TextButton } from "@/components/TextButton";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { TaskRows, useTaskLists } from "./TaskRows";

const MAX_ROWS = 5;

/** Life Overview's Tasks tile (v6.1): overdue, then due today, then the next few with a due date. Tick = done. */
export function TasksTile({ className = "flex-[1_1_280px]", size = "desktop" }: { className?: string; size?: "desktop" | "phone" }) {
  const { data, tasks, setView, taskError } = useDashboard();
  const { overdue, dueToday } = useTaskLists();
  const today = data.todayISO;
  const upcoming = tasks
    .filter((t) => t.due != null && t.due > today && t.status !== "done")
    .sort((a, b) => a.due!.localeCompare(b.due!));
  const rows = [...overdue, ...dueToday, ...upcoming].slice(0, Math.max(MAX_ROWS, overdue.length + dueToday.length));
  const open = tasks.filter((t) => t.status !== "done").length;

  return (
    <Card aria-label="Tasks" className={`flex flex-col pb-2.5 ${className}`}>
      <div className="pb-2">
        <CardHeader aside={<TextButton onClick={() => setView("board")}>Open Board</TextButton>}>
          <SectionHeading tone="yellow">Tasks</SectionHeading>
        </CardHeader>
        <span className="text-xs text-sub">
          {open} open{overdue.length ? ` · ${overdue.length} overdue` : ""}
          {dueToday.length ? ` · ${dueToday.length} today` : ""}
        </span>
      </div>
      {rows.length === 0 && <EmptyNote>Nothing due. Give a task a due date on the Board and it shows here.</EmptyNote>}
      <TaskRows tasks={rows} size={size} />
      {taskError && (
        <p role="alert" className="m-0 py-2 text-[13px] text-coral-text">
          {taskError}
        </p>
      )}
    </Card>
  );
}
