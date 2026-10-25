"use client";

import { Card } from "@/components/Card";
import { CardHeader, SectionHeading } from "@/components/SectionHeading";
import { TextButton } from "@/components/TextButton";
import { EmptyNote } from "@/components/EmptyNote";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { OwnerChip } from "./OwnerChip";

export function InProgressTile({ className = "flex-[1_1_280px]" }: { className?: string }) {
  const { tasks, setView } = useDashboard();
  const doing = tasks.filter((t) => t.status === "doing");
  return (
    <Card aria-label="Board summary" className={`flex flex-col gap-2.5 ${className}`}>
      <CardHeader aside={<TextButton onClick={() => setView("board")}>Open Board</TextButton>}>
        <SectionHeading tone="yellow">In progress</SectionHeading>
      </CardHeader>
      {doing.length === 0 && <EmptyNote>Nothing in progress. Tasks you start on the Board show here.</EmptyNote>}
      {doing.map((k) => (
        <div key={k.id} className="flex items-center gap-2.5 border-t border-sep py-2">
          <span className="flex-1 text-[13px]">{k.title}</span>
          <OwnerChip owner={k.owner} />
        </div>
      ))}
    </Card>
  );
}
