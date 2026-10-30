"use client";

import Link from "next/link";
import { CheckBox } from "@/components/Checkbox";
import { useDashboard } from "@/components/dashboard/DashboardContext";

/*
  Today's trackers on the Health page.
  Yes/no rows tick when tapped (and save on the real dashboard); number rows open the check-in.
*/
export function TodayRows() {
  const { data, todayDone, toggleToday, todayError } = useDashboard();
  const row =
    "flex min-h-11 w-full items-center gap-3 border-0 border-solid border-line bg-transparent p-0 text-left text-sm text-ink no-underline [&:not(:first-child)]:border-t";

  if (data.today.length === 0) {
    return <p className="m-0 py-3 text-sm text-soft">No trackers yet. Open the check-in to start.</p>;
  }

  return (
    <>
      {data.today.map((item, i) => {
        const done = todayDone[i];
        const inner = (
          <>
            <CheckBox checked={done} />
            <span className={`flex-1 ${done ? "text-soft" : ""}`}>{item.label}</span>
            <span className="text-xs text-soft">{item.area}</span>
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
        <p role="alert" className="m-0 py-2 text-sm text-danger">
          {todayError}
        </p>
      )}
    </>
  );
}
