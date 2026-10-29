"use client";

import { EmptyNote } from "@/components/EmptyNote";
import { ProgressBar } from "@/components/ProgressBar";
import { Tile } from "@/components/Tile";
import { useDashboard } from "@/components/dashboard/DashboardContext";

/** Goals with their progress; the heading opens the goals page to add or update them. */
export function GoalsTile() {
  const { goals, goalsHref } = useDashboard().data;
  return (
    <Tile title="Goals" href={goalsHref}>
      {goals.length === 0 && <EmptyNote>No goals yet. Add one with a target and a date, and its progress shows here.</EmptyNote>}
      {goals.map((g, i) => (
        <div key={`${i}-${g.name}`} className="flex flex-col gap-[5px]">
          <div className="flex justify-between gap-2 text-sm">
            <span className="font-semibold">{g.name}</span>
            <span className="text-right text-xs text-sub">{g.progress}</span>
          </div>
          <ProgressBar pct={g.pct} tone={g.tone} label={`${g.name}: ${g.pct}%`} />
          <span className="text-xs text-sub">{g.by}</span>
        </div>
      ))}
    </Tile>
  );
}
