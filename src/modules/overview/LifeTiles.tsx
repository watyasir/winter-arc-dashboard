"use client";

import { Chip, type ChipTone } from "@/components/Chip";
import { EmptyNote } from "@/components/EmptyNote";
import { ProgressBar } from "@/components/ProgressBar";
import { BigNumber, Tile } from "@/components/Tile";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { viewHref } from "@/components/dashboard/Nav";

/** The 1RK move-out fund: the goal with "1RK" in its name. */
export function FundTile() {
  const { data } = useDashboard();
  const fund = data.fund;
  return (
    <Tile title="1RK fund" href={data.goalsHref} area="fund">
      {fund ? (
        <>
          <BigNumber value={`${fund.pct}%`} size="md" />
          <ProgressBar pct={Math.min(100, fund.pct)} tone="accent" label={`${fund.name}: ${fund.pct}%`} />
          <span className="text-sm text-soft">{fund.by ? `${fund.progress} · ${fund.by}` : fund.progress}</span>
        </>
      ) : (
        <EmptyNote>Add a goal named &ldquo;1RK fund&rdquo; to track it here.</EmptyNote>
      )}
    </Tile>
  );
}

const mealTone: Record<string, ChipTone> = { Planned: "ok", Swapped: "warn", Skipped: "danger" };

/** Today's meal slots as chips: ✓ as planned, ~ swapped, ✕ skipped, plain = not logged yet. */
export function DietTile() {
  const { data } = useDashboard();
  const planned = data.meals.filter((m) => m.status === "Planned").length;
  return (
    <Tile title="Diet" href={data.logHref} area="diet" aside={data.meals.length > 0 && <span className="font-mono text-xs text-soft">{planned}/{data.meals.length}</span>}>
      {data.meals.length === 0 ? (
        <EmptyNote>Meal slots appear once the check-in update is run.</EmptyNote>
      ) : (
        <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0" aria-label="Meals today">
          {data.meals.map((m) => (
            <li key={m.name}>
              <Chip tone={m.status ? mealTone[m.status] ?? "neutral" : "neutral"}>
                {m.status === "Planned" ? "✓ " : m.status === "Swapped" ? "~ " : m.status === "Skipped" ? "✕ " : ""}
                {m.name}
                <span className="sr-only">: {m.status ?? "not logged"}</span>
              </Chip>
            </li>
          ))}
        </ul>
      )}
    </Tile>
  );
}

/** TYBBA study: minutes today, hours this week, and the page you've reached. */
export function StudyTile() {
  const { data } = useDashboard();
  const study = data.study;
  const hours = (m: number) => (m / 60).toLocaleString("en-IN", { maximumFractionDigits: 1 });
  return (
    <Tile title="TYBBA study" href={data.logHref} area="study">
      {!study || (study.weekMin === 0 && study.page == null) ? (
        <EmptyNote>Log study minutes in the check-in to see them here.</EmptyNote>
      ) : (
        <>
          <BigNumber value={hours(study.weekMin)} unit="hr this week" size="md" />
          <span className="text-sm text-soft">
            Today {study.todayMin ?? 0} min{study.dailyTarget ? ` of ${study.dailyTarget}` : ""}
            {study.page != null && ` · page ${study.page}`}
          </span>
        </>
      )}
    </Tile>
  );
}

/** Claude's scheduled jobs: how many are running and their names. */
export function ClaudeTile() {
  const { data } = useDashboard();
  const jobs = data.claudeJobs;
  const running = jobs.filter((j) => j.status === "running");
  const failed = jobs.filter((j) => j.status === "failed").length;
  const names = (running.length ? running : jobs).map((j) => j.name);
  return (
    <Tile title="Claude's jobs" href={viewHref(data.basePath, "board")} area="claude" aside={<span aria-hidden="true" className="size-2.5 rounded-full bg-claude" />}>
      {jobs.length === 0 ? (
        <EmptyNote>None reported yet.</EmptyNote>
      ) : (
        <>
          <BigNumber value={String(running.length)} unit="running" size="md" />
          <span className="line-clamp-2 text-sm text-soft">
            {failed > 0 && <span className="font-semibold text-danger">{failed} failed · </span>}
            {names.join(" · ")}
          </span>
        </>
      )}
    </Tile>
  );
}
