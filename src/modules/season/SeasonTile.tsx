"use client";

import { Card } from "@/components/Card";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import type { SeasonDay } from "@/modules/types";

const cellStyle: Record<SeasonDay, string> = {
  all: "bg-green",
  most: "bg-green-light",
  missed: "border-[1.5px] border-peach bg-transparent",
  today: "bg-mauve",
  upcoming: "bg-crust",
};

const cellWords: Record<SeasonDay, string> = {
  all: "all targets",
  most: "most targets",
  missed: "missed",
  today: "today",
  upcoming: "upcoming",
};

const legend: SeasonDay[] = ["all", "most", "missed", "today"];

/** The hero: big "23 of 90" plus the 90-cell season strip. */
export function SeasonTile() {
  const { season } = useDashboard().data;
  return (
    <Card aria-label={`${season.name} season`} className="flex flex-wrap items-center gap-7 px-6 py-[22px]">
      <div className="flex flex-[0_1_260px] flex-col gap-1.5">
        <span className="text-[13px] font-semibold text-mauve-text">
          {season.name} · {season.length} days
        </span>
        <div className="flex items-baseline gap-2">
          <span className="font-rounded text-[64px] leading-none font-bold tracking-[-0.03em]">{season.day}</span>
          <span className="text-[17px] font-semibold text-subtext1">of {season.length}</span>
        </div>
        <span className="text-[15px]">
          You&apos;re on a {season.streak}-day streak. {season.length - season.day} days to go.
        </span>
        <div className="flex gap-[18px] pt-2.5">
          <Figure value={`${season.targetsHitPct}%`} label="targets hit" className="text-green-text" />
          <Figure value={String(season.bestStreak)} label="best streak" />
          <Figure value={String(season.missed)} label="missed" className="text-peach-text" />
        </div>
      </div>

      <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-2.5">
        <div className="grid grid-cols-[repeat(15,minmax(0,1fr))] gap-1 sm:grid-cols-[repeat(30,minmax(0,1fr))]" role="list" aria-label="Season days">
          {season.days.map((d, i) => {
            const label = `Day ${i + 1}: ${cellWords[d]}`;
            return (
              <div
                key={i}
                role="listitem"
                aria-label={label}
                title={label}
                className={`aspect-square rounded-[5px] ${cellStyle[d]}`}
              />
            );
          })}
        </div>
        <div className="flex flex-wrap justify-between gap-2.5 text-xs text-subtext1">
          <span>{season.startLabel}</span>
          <span className="order-last flex w-full flex-wrap gap-3 sm:order-none sm:w-auto">
            {legend.map((d) => (
              <span key={d} className="flex items-center gap-[5px]">
                <span aria-hidden="true" className={`size-2.5 rounded-[3px] ${cellStyle[d]}`} />
                {d === "all" ? "All targets" : d === "most" ? "Most targets" : d === "missed" ? "Missed" : "Today"}
              </span>
            ))}
          </span>
          <span>{season.endLabel}</span>
        </div>
      </div>
    </Card>
  );
}

function Figure({ value, label, className = "" }: { value: string; label: string; className?: string }) {
  return (
    <div>
      <div className={`font-rounded text-xl font-bold ${className}`}>{value}</div>
      <div className="text-xs text-subtext1">{label}</div>
    </div>
  );
}
