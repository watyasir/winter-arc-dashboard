"use client";

import Link from "next/link";
import { useDashboard } from "./DashboardContext";

const chipClass =
  "inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-full border-0 bg-hero py-1.5 pr-3.5 pl-1.5 text-[13px] font-semibold text-white no-underline hover:text-white sm:min-h-9";

/** The dark "Day X/90 · Winter Arc →" chip (v6.1). Opens the Winter Arc page. */
export function ArcChip({ onOpen }: { onOpen: () => void }) {
  const { season, settingsHref } = useDashboard().data;
  if (!season) {
    return settingsHref ? (
      <Link href={`${settingsHref}#season`} className={`${chipClass} pl-3.5`}>
        Start Winter Arc →
      </Link>
    ) : null;
  }
  const badge = season.startsIn > 0 ? `In ${season.startsIn} ${season.startsIn === 1 ? "day" : "days"}` : `Day ${season.day}/${season.length}`;
  return (
    <button type="button" onClick={onOpen} className={chipClass}>
      <span className="rounded-full bg-on-dark px-2 py-[3px]">{badge}</span>
      {season.name} →
    </button>
  );
}
