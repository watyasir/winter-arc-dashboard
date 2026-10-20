"use client";

import { Card } from "@/components/Card";
import { CardHeader, SectionHeading } from "@/components/SectionHeading";
import { EmptyNote } from "@/components/EmptyNote";
import { TextButton } from "@/components/TextButton";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { TaskRows, useTaskLists } from "./TaskRows";

export function DueTodayTile() {
  const { setView, taskError } = useDashboard();
  const { dueToday } = useTaskLists();
  const left = dueToday.filter((t) => t.status !== "done").length;
  return (
    <Card aria-label="Tasks due today" className="flex flex-[1_1_280px] flex-col pb-2.5">
      <div className="pb-2">
        <CardHeader aside={<TextButton onClick={() => setView("board")}>Open Board</TextButton>}>
          <SectionHeading tone="yellow">Due today</SectionHeading>
        </CardHeader>
        {dueToday.length > 0 && <span className="text-xs text-sub">{left === 0 ? "All done" : `${left} left`}</span>}
      </div>
      {dueToday.length === 0 && <EmptyNote>Nothing due today. Give a task a due date on the Board and it shows here.</EmptyNote>}
      <TaskRows tasks={dueToday} />
      {taskError && (
        <p role="alert" className="m-0 py-2 text-[13px] text-coral-text">
          {taskError}
        </p>
      )}
    </Card>
  );
}
