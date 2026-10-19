"use client";

import { Card } from "@/components/Card";
import { CheckBox } from "@/components/Checkbox";
import { CardHeader, SectionHeading } from "@/components/SectionHeading";
import { useDashboard } from "@/components/dashboard/DashboardContext";

/** Today's checklist. The whole row is the button. */
export function TodayTile() {
  const { data, todayDone, toggleToday } = useDashboard();
  const doneCount = todayDone.filter(Boolean).length;
  return (
    <Card id="today" aria-label="Today" tabIndex={-1} className="flex-[1_1_300px] pb-2.5 outline-none">
      <div className="pb-2">
        <CardHeader aside={<span className="text-xs text-sub">{doneCount} of {data.today.length} done</span>}>
          <SectionHeading tone="coral">Today</SectionHeading>
        </CardHeader>
      </div>
      {data.today.map((item, i) => {
        const done = todayDone[i];
        return (
          <button
            key={item.label}
            type="button"
            aria-pressed={done}
            onClick={() => toggleToday(i)}
            className="flex min-h-11 w-full cursor-pointer items-center gap-3 border-0 border-t border-solid border-sep bg-transparent p-0 text-left text-sm text-ink"
          >
            <CheckBox checked={done} />
            <span className={`flex-1 ${done ? "text-sub" : ""}`}>{item.label}</span>
            <span className="text-xs text-sub">{item.area}</span>
          </button>
        );
      })}
    </Card>
  );
}
