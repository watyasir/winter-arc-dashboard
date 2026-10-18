"use client";

import { Card } from "@/components/Card";
import { CardHeader, SectionHeading } from "@/components/SectionHeading";
import { TextButton } from "@/components/TextButton";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { OwnerChip } from "./OwnerChip";

export function InProgressTile() {
  const { data, setView } = useDashboard();
  const doing = data.board.find((c) => c.name === "In progress")?.cards ?? [];
  return (
    <Card aria-label="Board summary" className="flex flex-[1_1_280px] flex-col gap-2.5">
      <CardHeader aside={<TextButton onClick={() => setView("board")}>Open Board</TextButton>}>
        <SectionHeading tone="yellow">In progress</SectionHeading>
      </CardHeader>
      {doing.map((k) => (
        <div key={k.title} className="flex items-center gap-2.5 border-t border-surface0 py-2">
          <span className="flex-1 text-[13px]">{k.title}</span>
          <OwnerChip owner={k.owner} />
        </div>
      ))}
    </Card>
  );
}
