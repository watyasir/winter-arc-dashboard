"use client";

import { Card } from "@/components/Card";
import { CardHeader, SectionHeading } from "@/components/SectionHeading";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { TodayRows } from "./TodayRows";

/** Today's checklist. The whole row is the button. */
export function TodayTile() {
  const { data, todayDone } = useDashboard();
  const doneCount = todayDone.filter(Boolean).length;
  return (
    <Card id="today" aria-label="Today" tabIndex={-1} className="flex-[1_1_300px] pb-2.5 outline-none">
      <div className="pb-2">
        <CardHeader aside={<span className="text-xs text-sub">{doneCount} of {data.today.length} done</span>}>
          <SectionHeading tone="coral">Today</SectionHeading>
        </CardHeader>
      </div>
      <TodayRows />
    </Card>
  );
}
