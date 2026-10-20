"use client";

import { Card } from "@/components/Card";
import { PillLink } from "@/components/PillLink";
import { ProgressBar } from "@/components/ProgressBar";
import { SectionHeading } from "@/components/SectionHeading";
import { EmptyNote } from "@/components/EmptyNote";
import { useDashboard } from "@/components/dashboard/DashboardContext";

export function GoalsTile() {
  const { goals, goalsHref } = useDashboard().data;
  return (
    <Card aria-label="Goals" className="flex flex-[1_1_280px] flex-col gap-3">
      <SectionHeading tone="seafoam">Goals</SectionHeading>
      {goals.length === 0 && <EmptyNote>No goals yet. Add one with a target and a date, and its progress shows here.</EmptyNote>}
      {goals.map((g, i) => (
        <div key={`${i}-${g.name}`} className="flex flex-col gap-[5px]">
          <div className="flex justify-between gap-2 text-[13px]">
            <span className="font-semibold">{g.name}</span>
            <span className="text-right text-xs text-sub">{g.progress}</span>
          </div>
          <ProgressBar pct={g.pct} tone={g.tone} label={`${g.name}: ${g.pct}%`} />
          <span className="text-xs text-sub">{g.by}</span>
        </div>
      ))}
      <PillLink href={goalsHref} className="self-start">
        {goals.length === 0 ? "Add a goal" : "Update goals"}
      </PillLink>
    </Card>
  );
}
