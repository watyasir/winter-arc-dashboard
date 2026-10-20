"use client";

import { Card } from "@/components/Card";
import { CardHeader, SectionHeading } from "@/components/SectionHeading";
import { EmptyNote } from "@/components/EmptyNote";
import { TaskRows, useTaskLists } from "./TaskRows";

export function OverdueTile() {
  const { overdue } = useTaskLists();
  return (
    <Card aria-label="Overdue tasks" className="flex flex-[1_1_280px] flex-col pb-2.5">
      <div className="pb-2">
        <CardHeader aside={overdue.length > 0 && <span className="text-xs text-sub">{overdue.length} overdue</span>}>
          <SectionHeading tone="coral">Overdue</SectionHeading>
        </CardHeader>
      </div>
      {overdue.length === 0 && <EmptyNote>Nothing overdue. Tasks past their due date show here until you tick them off.</EmptyNote>}
      <TaskRows tasks={overdue} />
    </Card>
  );
}
