"use client";

import Link from "next/link";
import { EmptyNote } from "@/components/EmptyNote";
import { PillLink } from "@/components/PillLink";
import { ProgressBar } from "@/components/ProgressBar";
import { Tile } from "@/components/Tile";
import { useDashboard } from "@/components/dashboard/DashboardContext";

/** Workouts this week against the weekly target, with "Repeat last workout" one tap away. */
export function WorkoutsTile() {
  const { workouts, workoutHref } = useDashboard().data;
  const { weekCount, weekTarget, week, last } = workouts;
  const pct = weekTarget ? Math.min(100, Math.round((weekCount / weekTarget) * 100)) : 0;

  return (
    <Tile title="Workouts" tone="diet" aside={<span className="text-xs text-soft">This week</span>}>
      <div className="flex flex-col gap-1.5">
        <span className="flex items-baseline gap-1">
          <span className="font-mono text-2xl display">{weekCount}</span>
          <span className="text-sm font-semibold text-soft">{weekTarget ? `of ${weekTarget}` : weekCount === 1 ? "workout" : "workouts"}</span>
          {weekTarget != null && weekCount >= weekTarget && <span className="ml-1 text-sm font-semibold text-ok">✓ Target hit</span>}
        </span>
        {weekTarget != null && <ProgressBar pct={pct} tone="ok" label={`Workouts: ${weekCount} of ${weekTarget} this week`} />}
      </div>

      {!last && <EmptyNote>No workouts yet. Log your first one and it shows here, with your lifts.</EmptyNote>}
      {last && week.length === 0 && (
        <EmptyNote>
          None yet this week. Last workout: {last.name} ({last.when}).
        </EmptyNote>
      )}
      {week.length > 0 && (
        <ul className="m-0 flex list-none flex-col p-0 [&>li+li]:border-t [&>li+li]:border-solid [&>li+li]:border-line">
          {week.map((w, i) => (
            <li key={i} className="flex items-baseline gap-3 py-1.5 text-sm">
              <span className="w-8 shrink-0 text-soft">{w.day}</span>
              <span className="min-w-0 flex-1 truncate font-semibold">{w.name}</span>
              <span className="shrink-0 text-xs text-soft">{w.summary}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2">
        {last && (
          <PillLink href={`${workoutHref}?repeat=1`} aria-label={`Repeat last workout: ${last.name}`}>
            Repeat last workout
          </PillLink>
        )}
        <Link href={workoutHref} className="flex min-h-11 items-center text-sm font-semibold text-accent no-underline hover:underline">
          {last ? "Log a different one" : "Log a workout"}
        </Link>
      </div>
    </Tile>
  );
}
