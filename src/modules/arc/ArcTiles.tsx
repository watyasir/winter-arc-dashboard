"use client";

import { Card } from "@/components/Card";
import { CardHeader, SectionHeading } from "@/components/SectionHeading";
import { EmptyNote } from "@/components/EmptyNote";
import { ProgressBar } from "@/components/ProgressBar";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import type { Tone } from "@/lib/tones";

/*
  The Winter Arc page's tiles (DESIGN.md v6.1, docs/design-reference/WinterArcPage.dc.html):
  targets this week, streaks per tracker, and the week-by-week chart.
*/

const BAR_TONES: Tone[] = ["brand", "sage", "pine", "mist", "seafoam", "lagoon"];

export function ArcTargetsTile({ className = "flex-[1_1_340px]" }: { className?: string }) {
  const { arc, season } = useDashboard().data;
  if (!arc) return null;
  const waiting = (season?.startsIn ?? 0) > 0;
  return (
    <Card aria-label="Targets this week" className={`flex flex-col gap-1 ${className}`}>
      <CardHeader aside={<span className="text-xs text-sub">week {arc.week} of {arc.weekCount}</span>}>
        <SectionHeading tone="brand">Targets this week</SectionHeading>
      </CardHeader>
      {arc.targets.length === 0 && <EmptyNote>No targets yet. Switch trackers on for Winter Arc in settings and they show here.</EmptyNote>}
      {waiting && arc.targets.length > 0 && <EmptyNote>Counting starts on day 1.</EmptyNote>}
      {arc.targets.map((t, i) => {
        const pct = Math.min(100, Math.round((t.done / t.target) * 100));
        return (
          <div key={t.name} className="flex flex-col gap-1.5 py-[7px]">
            <div className="flex justify-between gap-2 text-[13px]">
              <span className="font-semibold">{t.name}</span>
              <span className="text-right text-xs text-sub">
                {t.done} of {t.target}
                {t.done >= t.target ? " · ✓ hit" : ` · target ${t.target} days`}
              </span>
            </div>
            <ProgressBar pct={pct} tone={BAR_TONES[i % BAR_TONES.length]} label={`${t.name}: ${t.done} of ${t.target} days this week`} />
          </div>
        );
      })}
    </Card>
  );
}

export function ArcStreaksTile({ className = "flex-[1_1_340px]" }: { className?: string }) {
  const { arc } = useDashboard().data;
  if (!arc) return null;
  return (
    <Card aria-label="Streaks" className={`flex flex-col gap-2.5 ${className}`}>
      <CardHeader aside={<span className="text-xs text-sub">days in a row</span>}>
        <SectionHeading tone="sage">Streaks</SectionHeading>
      </CardHeader>
      {arc.streaks.length === 0 && <EmptyNote>No targets yet, so no streaks. Switch trackers on for Winter Arc in settings.</EmptyNote>}
      <dl className="m-0 grid grid-cols-2 gap-2.5">
        {arc.streaks.map((s) => (
          <div key={s.name} className="flex min-w-0 flex-col rounded-[14px] border border-sep p-3">
            <dt className="truncate text-xs text-sub">{s.name}</dt>
            <dd className="m-0">
              <span className="font-rounded text-2xl font-bold">{s.current}</span>
              <span className="sr-only"> {s.current === 1 ? "day" : "days"} now,</span>
              <span className="block text-xs text-sub">best {s.best}</span>
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

/** 13 bars, one per season week: % of tracker targets hit. Summary line above (HIG: charts say their point in words). */
export function ArcWeeksTile() {
  const { arc } = useDashboard().data;
  if (!arc) return null;
  const done = arc.weeks.filter((w): w is number => w != null);
  const current = arc.weeks[arc.week - 1];
  const best = done.length ? Math.max(...done) : null;
  const summary =
    current == null ? "Your first week's bar fills in from day 1." : `Week ${arc.week} so far: ${current}%${best != null && done.length > 1 ? ` · best week ${best}%` : ""}`;

  return (
    <Card aria-label="Week by week" className="flex flex-col gap-2">
      <CardHeader aside={<span className="text-xs text-sub">% of targets hit</span>}>
        <SectionHeading tone="arc">Week by week</SectionHeading>
      </CardHeader>
      <p className="m-0 text-[13px] font-semibold">{summary}</p>
      <div className="overflow-x-auto">
        <div className="flex min-w-[460px] gap-2">
          <ol aria-label="Targets hit per week" className="m-0 grid flex-1 list-none grid-cols-[repeat(13,minmax(0,1fr))] gap-2 p-0">
            {arc.weeks.map((w, i) => (
              <li key={i} className="flex flex-col items-center gap-1.5">
                <span className="sr-only">
                  Week {i + 1}: {w == null ? "not started" : `${w}%`}
                </span>
                <div aria-hidden="true" className="flex h-[110px] w-full items-end justify-center border-b border-sep">
                  <div
                    className={`w-full max-w-7 rounded-t-lg rounded-b ${w == null ? "bg-crust" : i === arc.week - 1 ? "bg-arc" : "bg-brand"}`}
                    style={{ height: `${w == null ? 8 : Math.max(4, w)}%` }}
                  />
                </div>
                <span aria-hidden="true" className={`text-xs ${i === arc.week - 1 ? "font-semibold text-ink" : "text-sub"}`}>
                  W{i + 1}
                </span>
              </li>
            ))}
          </ol>
          {/* Y labels on the right (DESIGN.md §4), lined up with the 110px plot area. */}
          <div aria-hidden="true" className="flex h-[118px] flex-col justify-between pb-0 text-xs leading-none text-sub">
            <span>100%</span>
            <span>50%</span>
            <span>0%</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
