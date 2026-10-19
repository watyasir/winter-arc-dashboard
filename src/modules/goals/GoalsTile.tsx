"use client";

import { Card } from "@/components/Card";
import { ProgressBar } from "@/components/ProgressBar";
import { SectionHeading } from "@/components/SectionHeading";
import { EmptyNote } from "@/components/EmptyNote";
import { useDashboard } from "@/components/dashboard/DashboardContext";

export function GoalsTile() {
  const { goals } = useDashboard().data;
  return (
    <Card aria-label="Goals" className="flex flex-[1_1_280px] flex-col gap-3">
      <SectionHeading tone="seafoam">Goals</SectionHeading>
      {goals.length === 0 && <EmptyNote>No goals yet. Add one with a target and a date, and its progress shows here.</EmptyNote>}
      {goals.map((g) => (
        <div key={g.name} className="flex flex-col gap-[5px]">
          <div className="flex justify-between text-[13px]">
            <span className="font-semibold">{g.name}</span>
            <span className="text-xs text-sub">{g.progress}</span>
          </div>
          <ProgressBar pct={g.pct} tone={g.tone} label={`${g.name}: ${g.pct}%`} />
          <span className="text-xs text-sub">{g.by}</span>
        </div>
      ))}
    </Card>
  );
}
