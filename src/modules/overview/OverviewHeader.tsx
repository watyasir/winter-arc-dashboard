"use client";

import { useDashboard } from "@/components/dashboard/DashboardContext";
import { istParts, useNow } from "@/components/useNow";
import { dayKeyOf } from "@/lib/day-plan";
import { clockLabel } from "@/lib/trackers";

/** "Morning" etc. by the hour in India. */
function greeting(minutes: number) {
  const h = minutes / 60;
  if (h < 5) return "Up late";
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  if (h < 22) return "Evening";
  return "Night";
}

/**
 * The Overview header: a big greeting by the time in India, one line from the day plan's shift,
 * and a live clock with the date on the right (hidden on phones).
 */
export function OverviewHeader() {
  const { plan } = useDashboard().data;
  const now = useNow(1000);
  const ist = now == null ? null : istParts(now);

  let line: string | null = null;
  if (ist) {
    const weekend = ["sat", "sun"].includes(dayKeyOf(ist.iso));
    if (weekend) line = "Weekend off.";
    else if (plan?.shiftStart != null && plan.shiftEnd != null) {
      if (ist.minutes < plan.shiftStart) line = `Shift at ${clockLabel(plan.shiftStart)}.`;
      else if (ist.minutes < plan.shiftEnd) line = `On shift till ${clockLabel(plan.shiftEnd)}.`;
      else line = "Shift done. Wind down.";
    }
  }

  return (
    <div className="flex items-end justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="display m-0 text-[36px] leading-[1.05] text-balance sm:text-[48px]">{ist ? `${greeting(ist.minutes)}, Yasir.` : "Hello, Yasir."}</h1>
        <p className="m-0 min-h-5 text-base font-semibold text-soft">{line}</p>
      </div>
      {now != null && (
        <p className="m-0 hidden shrink-0 flex-col items-end gap-0.5 min-[561px]:flex" aria-label="Time in India">
          <span className="display text-[32px] leading-none">
            {new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true }).format(now).toUpperCase()}
          </span>
          <span className="label text-soft">
            {new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(now)} · IST
          </span>
        </p>
      )}
    </div>
  );
}
