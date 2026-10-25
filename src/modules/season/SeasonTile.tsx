"use client";

import Link from "next/link";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import type { SeasonDay } from "@/modules/types";

const cellStyle: Record<SeasonDay, string> = {
  all: "bg-hero-all",
  most: "bg-hero-most",
  missed: "border-[1.5px] border-hero-missed bg-transparent",
  today: "bg-white",
  upcoming: "bg-hero-upcoming",
};

const cellWords: Record<SeasonDay, string> = {
  all: "all targets",
  most: "most targets",
  missed: "missed",
  today: "today",
  upcoming: "upcoming",
};

const legend: SeasonDay[] = ["all", "most", "missed", "today"];

/** The one dark hero card per view: big "23 of 90" plus the 90-cell season strip. */
export function SeasonTile() {
  const { season, settingsHref, shareHref } = useDashboard().data;
  if (!season) {
    return (
      <section aria-label="Season" className="flex flex-col gap-1.5 rounded-[20px] bg-hero px-6 py-[22px] text-white">
        <span className="text-[13px] font-semibold text-hero-label">Winter Arc · 90 days</span>
        <span className="text-[22px] font-bold">No season running yet</span>
        <span className="text-[15px] text-hero-sub">
          Keep logging every day. Once Winter Arc has a start date, each day fills in here.
        </span>
        {settingsHref && (
          <Link href={`${settingsHref}#season`} className="mt-1 self-start text-[15px] font-semibold text-white underline hover:text-hero-sage">
            Start Winter Arc
          </Link>
        )}
      </section>
    );
  }
  const waiting = season.startsIn > 0;
  return (
    <section
      aria-label={`${season.name} season`}
      className="flex min-w-0 flex-wrap items-center gap-7 rounded-[20px] bg-hero px-6 py-[22px] text-white"
    >
      <div className="flex flex-[0_1_260px] flex-col gap-1.5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] font-semibold text-hero-label">
            {season.name} · {season.length} days
          </span>
          <Link
            href={shareHref}
            className="-my-3 flex min-h-11 items-center text-[13px] font-semibold text-white underline hover:text-hero-sage sm:min-h-0 sm:my-0"
          >
            Share progress
          </Link>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-rounded text-[64px] leading-none font-bold tracking-[-0.03em]">{waiting ? season.startsIn : season.day}</span>
          <span className="text-[17px] font-semibold text-hero-sub">
            {waiting ? (season.startsIn === 1 ? "day to go" : "days to go") : `of ${season.length}`}
          </span>
        </div>
        <span className="text-[15px]">
          {waiting
            ? `Starts in ${season.startsIn} ${season.startsIn === 1 ? "day" : "days"}, on ${season.startLabel}. Keep logging; day 1 counts every target.`
            : `You're on a ${season.streak}-day streak. ${season.length - season.day} days to go.`}
        </span>
        <div className={`flex gap-[18px] pt-2.5 ${waiting ? "hidden" : ""}`}>
          <Figure value={`${season.targetsHitPct}%`} label="targets hit" className="text-hero-sage" />
          <Figure value={String(season.streak)} label="streak" />
          <Figure value={String(season.bestStreak)} label="best streak" />
          <Figure value={String(season.missed)} label="missed" className="text-hero-yellow" />
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
        <div className="flex flex-wrap justify-between gap-2.5 text-xs text-hero-sub">
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
    </section>
  );
}

function Figure({ value, label, className = "" }: { value: string; label: string; className?: string }) {
  return (
    <div>
      <div className={`font-rounded text-xl font-bold ${className}`}>{value}</div>
      <div className="text-xs text-hero-sub">{label}</div>
    </div>
  );
}
