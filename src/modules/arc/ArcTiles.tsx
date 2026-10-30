"use client";

import { EmptyNote } from "@/components/EmptyNote";
import { Tile } from "@/components/Tile";
import { ProgressBar } from "@/components/ProgressBar";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import type { Tone } from "@/lib/tones";

/* The Winter Arc page's tiles: targets this week, streaks per tracker, and the week-by-week bars. */

const BAR_TONES: Tone[] = ["accent", "ok"];

export function ArcTargetsTile() {
  const { arc, season } = useDashboard().data;
  if (!arc) return null;
  const waiting = (season?.startsIn ?? 0) > 0;
  return (
    <Tile title="Targets this week" aside={<span className="text-xs text-soft">week {arc.week} of {arc.weekCount}</span>}>
      {arc.targets.length === 0 && <EmptyNote>No targets yet. Switch trackers on for Winter Arc in settings and they show here.</EmptyNote>}
      {waiting && arc.targets.length > 0 && <EmptyNote>Counting starts on day 1.</EmptyNote>}
      {arc.targets.map((t, i) => {
        const pct = Math.min(100, Math.round((t.done / t.target) * 100));
        return (
          <div key={t.name} className="flex flex-col gap-1.5 py-[7px]">
            <div className="flex justify-between gap-2 text-sm">
              <span className="font-semibold">{t.name}</span>
              <span className="text-right text-xs text-soft">
                {t.done} of {t.target}
                {t.done >= t.target ? " · ✓ hit" : ` · target ${t.target} days`}
              </span>
            </div>
            <ProgressBar pct={pct} tone={BAR_TONES[i % BAR_TONES.length]} label={`${t.name}: ${t.done} of ${t.target} days this week`} />
          </div>
        );
      })}
    </Tile>
  );
}

export function ArcStreaksTile() {
  const { arc } = useDashboard().data;
  if (!arc) return null;
  return (
    <Tile title="Streaks" tone="tasks" aside={<span className="text-xs text-soft">days in a row</span>}>
      {arc.streaks.length === 0 && <EmptyNote>No targets yet, so no streaks. Switch trackers on for Winter Arc in settings.</EmptyNote>}
      <dl className="m-0 grid grid-cols-2 gap-2.5">
        {arc.streaks.map((s) => (
          <div key={s.name} className="flex min-w-0 flex-col rounded-item border border-line bg-fill p-3">
            <dt className="truncate text-xs text-soft">{s.name}</dt>
            <dd className="m-0">
              <span className="font-mono text-2xl display">{s.current}</span>
              <span className="sr-only"> {s.current === 1 ? "day" : "days"} now,</span>
              <span className="block text-xs text-soft">best {s.best}</span>
            </dd>
          </div>
        ))}
      </dl>
    </Tile>
  );
}

/** 13 bars, one per season week: % of tracker targets hit, with the point in words above. */
export function ArcWeeksTile() {
  const { arc } = useDashboard().data;
  if (!arc) return null;
  const done = arc.weeks.filter((w): w is number => w != null);
  const current = arc.weeks[arc.week - 1];
  const best = done.length ? Math.max(...done) : null;
  const summary =
    current == null ? "Your first week's bar fills in from day 1." : `Week ${arc.week} so far: ${current}%${best != null && done.length > 1 ? ` · best week ${best}%` : ""}`;

  return (
    <Tile title="Week by week" aside={<span className="text-xs text-soft">% of targets hit</span>}>
      <p className="m-0 text-sm font-semibold">{summary}</p>
      {/* relative: keeps the hidden screen-reader labels inside the scroll box, so the page never scrolls sideways */}
      <div className="relative overflow-x-auto">
        <div className="flex min-w-[460px] gap-2">
          <ol aria-label="Targets hit per week" className="m-0 grid flex-1 list-none grid-cols-[repeat(13,minmax(0,1fr))] gap-2 p-0">
            {arc.weeks.map((w, i) => (
              <li key={i} className="flex flex-col items-center gap-1.5">
                <span className="sr-only">
                  Week {i + 1}: {w == null ? "not started" : `${w}%`}
                </span>
                <div aria-hidden="true" className="flex h-[110px] w-full items-end justify-center border-b border-line">
                  <div
                    className={`w-full max-w-7 rounded-t-lg rounded-b ${w == null ? "bg-fill" : i === arc.week - 1 ? "bg-accent" : "bg-pop"}`}
                    style={{ height: `${w == null ? 8 : Math.max(4, w)}%` }}
                  />
                </div>
                <span aria-hidden="true" className={`text-xs ${i === arc.week - 1 ? "font-semibold text-ink" : "text-soft"}`}>
                  W{i + 1}
                </span>
              </li>
            ))}
          </ol>
          {/* Y labels on the right, lined up with the 110px plot area. */}
          <div aria-hidden="true" className="flex h-[118px] flex-col justify-between pb-0 text-xs leading-none text-soft">
            <span>100%</span>
            <span>50%</span>
            <span>0%</span>
          </div>
        </div>
      </div>
    </Tile>
  );
}
