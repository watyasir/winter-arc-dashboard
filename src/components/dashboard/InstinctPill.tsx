"use client";

import { Icon } from "@/components/Icon";
import { formatClock, formatDuration } from "@/lib/format";
import { useDashboard } from "./DashboardContext";

/** Header pill: only there while Instinct is working, then green for ~3.5 s, then gone. */
export function InstinctPill() {
  const { instinct } = useDashboard();
  return (
    <div role="status" aria-live="polite" className="flex empty:hidden">
      {instinct.status === "waiting" && (
        <div className="flex min-w-[240px] items-center gap-2.5 rounded-full border border-surface0 bg-base py-2 pr-3.5 pl-2.5">
          <span aria-hidden="true" className="flex size-[22px] items-center justify-center rounded-full bg-mauve text-[11px] font-bold text-white">
            I
          </span>
          <div className="flex flex-1 flex-col gap-[5px]">
            <span className="text-xs font-semibold">Asking Instinct · {formatClock(instinct.secs)}</span>
            <div aria-hidden="true" className="relative h-1 overflow-hidden rounded-full bg-mauve/18">
              <span className="absolute inset-y-0 left-0 w-2/5 rounded-full bg-mauve motion-safe:animate-indeterminate motion-reduce:w-full motion-reduce:opacity-50" />
            </div>
          </div>
        </div>
      )}
      {instinct.status === "done" && (
        <div className="flex items-center gap-2.5 rounded-full border border-surface0 bg-base py-2 pr-3.5 pl-2.5">
          <span aria-hidden="true" className="flex size-[22px] items-center justify-center rounded-full bg-green">
            <Icon name="check" size={12} strokeWidth={3.5} className="stroke-white" />
          </span>
          <span className="text-xs font-semibold">Instinct replied in {formatDuration(instinct.secs)}</span>
        </div>
      )}
    </div>
  );
}
