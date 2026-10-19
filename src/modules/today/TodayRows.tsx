"use client";

import Link from "next/link";
import { CheckBox } from "@/components/Checkbox";
import { useDashboard } from "@/components/dashboard/DashboardContext";

/*
  The Today rows, shared by the desktop Today tile and the phone Focus list.
  Yes/no rows tick when tapped (and save on the real dashboard); number rows open the check-in.
*/
export function TodayRows({ size = "desktop" }: { size?: "desktop" | "phone" }) {
  const { data, todayDone, toggleToday, todayError } = useDashboard();
  const phone = size === "phone";
  const row = `flex w-full items-center gap-3 border-0 border-solid border-sep bg-transparent p-0 text-left text-ink no-underline ${
    phone ? "min-h-[46px] text-[17px] [&:not(:first-child)]:border-t" : "min-h-11 border-t text-sm"
  }`;

  if (data.today.length === 0) {
    return <p className="m-0 py-3 text-[13px] text-sub">No trackers yet. Open Log Today to start.</p>;
  }

  return (
    <>
      {data.today.map((item, i) => {
        const done = todayDone[i];
        const inner = (
          <>
            <CheckBox checked={done} />
            <span className={`flex-1 ${done ? "text-sub" : ""}`}>{item.label}</span>
            <span className={`text-sub ${phone ? "text-[13px]" : "text-xs"}`}>{item.area}</span>
          </>
        );
        if (item.href) {
          return (
            <Link key={item.label} href={item.href} className={`${row} hover:text-ink`}>
              {inner}
              <span className="sr-only">{done ? ", target hit. Open check-in" : ", open check-in"}</span>
            </Link>
          );
        }
        return (
          <button key={item.label} type="button" aria-pressed={done} onClick={() => toggleToday(i)} className={`${row} cursor-pointer`}>
            {inner}
          </button>
        );
      })}
      {todayError && (
        <p role="alert" className="m-0 py-2 text-[13px] text-coral-text">
          {todayError}
        </p>
      )}
    </>
  );
}
