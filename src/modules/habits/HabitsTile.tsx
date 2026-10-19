"use client";

import { Card } from "@/components/Card";
import { CardHeader, SectionHeading } from "@/components/SectionHeading";
import { useDashboard } from "@/components/dashboard/DashboardContext";

/** Sheet-style grid: one row per habit, one cell per day for the last 4 weeks. */
export function HabitsTile() {
  const { habits } = useDashboard().data;
  return (
    <Card aria-label="Habits" className="flex flex-[2_1_480px] flex-col gap-3">
      <CardHeader aside={<span className="text-xs text-sub">Filled = done</span>}>
        <SectionHeading tone="pine">Habits · last 4 weeks</SectionHeading>
      </CardHeader>
      <div className="overflow-x-auto">
        <div className="flex min-w-[540px] flex-col gap-2">
          {habits.map((h) => {
            const done = h.days.filter(Boolean).length;
            const pct = Math.round((done / h.days.length) * 100);
            return (
              <div key={h.name} className="flex items-center gap-3">
                <span className="w-[104px] shrink-0 text-[13px]">{h.name}</span>
                <div
                  role="img"
                  aria-label={`${h.name}: done ${done} of ${h.days.length} days`}
                  className="grid flex-1 grid-cols-[repeat(28,minmax(0,1fr))] gap-[3px]"
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
