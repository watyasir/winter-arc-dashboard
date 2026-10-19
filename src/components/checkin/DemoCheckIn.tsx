"use client";

import { demoCheckInValues, demoTrackers } from "@/data/demo/checkin";
import { CheckIn } from "./CheckIn";
import { MoreLogs } from "./MoreLogs";

/** /demo version of the check-in: same sheet, nothing is saved. */
export function DemoCheckIn({ dayLabel }: { dayLabel: string }) {
  return (
    <CheckIn
      trackers={demoTrackers}
      initialValues={demoCheckInValues}
      dayLabel={dayLabel}
      cancelHref="/demo"
      onSave={() => new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 400))}
      footer={
        <>
          <MoreLogs workoutHref="/demo/log/workout" bodyHref="/demo/log/body" />
          <p className="m-0 mx-4 text-[13px] text-sub">Demo: nothing is saved. The real check-in stores each value in the database.</p>
        </>
      }
    />
  );
}
