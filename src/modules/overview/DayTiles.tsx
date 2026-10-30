"use client";

import Link from "next/link";
import { EmptyNote } from "@/components/EmptyNote";
import { Tile } from "@/components/Tile";
import { useDashboard } from "@/components/dashboard/DashboardContext";

/** The check-in door: "Log today", or "✓ Logged" once anything is saved today. */
export function CheckInTile() {
  const { data } = useDashboard();
  return (
    <Tile title="Check-in" fill="accent" area="check">
      <p className="m-0 text-sm">{data.checkedIn ? "✓ Logged today" : "Sleep, meals, BP, steps, weight"}</p>
      <Link
        href={data.logHref}
        prefetch
        className="press mt-auto flex min-h-11 items-center justify-center rounded-item border border-line bg-card px-3 text-base display text-ink no-underline shadow-tile hover:bg-fill"
      >
        {data.checkedIn ? "Edit today" : "Log today"}
      </Link>
    </Tile>
  );
}

/** Today from the day plan: the shift (or "Weekend off") and what's on now. */
export function PlanTile() {
  const { plan } = useDashboard().data;
  return (
    <Tile title="Today" area="today">
      {plan ? (
        <>
          <p className={`m-0 text-xl leading-tight font-bold ${/\d/.test(plan.shift) ? "font-mono" : "display"}`}>{plan.shift}</p>
          <p className="m-0 text-sm text-soft">{plan.now ? `Now: ${plan.now}` : "Nothing planned right now"}</p>
        </>
      ) : (
        <EmptyNote>No day plan yet. Claude sends it through the API.</EmptyNote>
      )}
    </Tile>
  );
}
