"use client";

import { Card } from "@/components/Card";
import { CardHeader, SectionHeading } from "@/components/SectionHeading";
import { EmptyNote } from "@/components/EmptyNote";
import { useDashboard } from "@/components/dashboard/DashboardContext";

/**
 * Sheet-style grid: one row per habit, one cell per day for the last 4 weeks.
 * `weeks={2}` is the phone version (v6.1): two weeks fit a 390px screen without scrolling sideways.
 */
export function HabitsTile({ weeks = 4, className = "flex-[2_1_480px]" }: { weeks?: 2 | 4; className?: string }) {
  const all = useDashboard().data.habits;
  const habits = all.map((h) => ({ name: h.name, days: h.days.slice(-weeks * 7) }));
  const nothingYet = habits.every((h) => !h.days.some(Boolean));
  const span = weeks === 2 ? "last 2 weeks" : "last 4 weeks";
  return (
    <Card aria-label="Habits" className={`flex flex-col gap-3 ${className}`}>
      <CardHeader aside={<span className="text-xs text-sub">Filled = done</span>}>
        <SectionHeading tone="pine">Habits · {span}</SectionHeading>
      </CardHeader>
      {nothingYet && <EmptyNote>Nothing ticked in the {span}. Hit a target on Log Today and its square fills in.</EmptyNote>}
      <div className="overflow-x-auto">
        <div className={`flex flex-col gap-2 ${weeks === 4 ? "min-w-[540px]" : ""}`}>
          {habits.map((h) => {
            const done = h.days.filter(Boolean).length;
            const pct = Math.round((done / h.days.length) * 100);
            return (
              <div key={h.name} className="flex items-center gap-3">
                <span className={`shrink-0 text-[13px] ${weeks === 4 ? "w-[104px]" : "w-[84px] truncate"}`}>{h.name}</span>
                <div
                  role="img"
                  aria-label={`${h.name}: done ${done} of ${h.days.length} days`}
                  className={`grid flex-1 gap-[3px] ${weeks === 4 ? "grid-cols-[repeat(28,minmax(0,1fr))]" : "grid-cols-[repeat(14,minmax(0,1fr))]"}`}
                >
                  {h.days.map((ok, i) => (
                    <div key={i} className={`aspect-square rounded ${ok ? "bg-sage" : "bg-crust"}`} />
                  ))}
                </div>
                <span className="w-10 text-right font-rounded text-[13px] font-bold">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
