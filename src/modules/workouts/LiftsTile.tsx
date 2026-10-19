"use client";

import Link from "next/link";
import { Card } from "@/components/Card";
import { EmptyNote } from "@/components/EmptyNote";
import { CardHeader, SectionHeading } from "@/components/SectionHeading";
import { Sparkline } from "@/components/Sparkline";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { kg } from "@/lib/body";

/** Heaviest set per session for the exercises done most, with the change since the first one shown. */
export function LiftsTile() {
  const { lifts, workoutHref } = useDashboard().data;
  return (
    <Card aria-label="Lift progress" className="flex flex-[2_1_480px] flex-col gap-3">
      <CardHeader aside={<span className="text-xs text-sub">Heaviest set each session</span>}>
        <SectionHeading tone="lagoon">Lift progress</SectionHeading>
      </CardHeader>
      {lifts.length === 0 && (
        <EmptyNote>
          No weighted sets yet. <Link href={workoutHref}>Log a workout</Link> with weights and each lift&apos;s progress shows here.
        </EmptyNote>
      )}
      {lifts.length > 0 && (
        <ul className="m-0 grid list-none grid-cols-1 gap-x-6 gap-y-3 p-0 sm:grid-cols-2">
          {lifts.map((l) => {
            const latest = l.tops.at(-1)!;
            const change = Math.round((latest - l.tops[0]) * 10) / 10;
            const changeText = change === 0 ? `Same as ${l.sinceLabel}` : `${change > 0 ? "▲" : "▼"} ${kg(Math.abs(change))} kg since ${l.sinceLabel}`;
            return (
              <li key={l.exercise} className="flex min-w-0 items-center gap-3">
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[13px] font-semibold">{l.exercise}</span>
                  <span className="flex items-baseline gap-2">
                    <span className="font-rounded text-[20px] font-bold">{kg(latest)} kg</span>
                    <span className={`text-xs font-semibold ${change > 0 ? "text-sage-text" : "text-sub"}`}>{changeText}</span>
                  </span>
                </div>
                {l.tops.length > 1 && (
                  <div className="w-20 shrink-0">
                    <Sparkline values={l.tops} tone="lagoon" />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
