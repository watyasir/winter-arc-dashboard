"use client";

import { EmptyNote } from "@/components/EmptyNote";
import { ProgressBar } from "@/components/ProgressBar";
import { BigNumber, Tile } from "@/components/Tile";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { viewHref } from "@/components/dashboard/Nav";
import { useToast } from "@/components/Toast";
import { useConfetti } from "@/components/useConfetti";
import { timeAgo, useNow } from "@/components/useNow";
import { shortDate } from "@/lib/trackers";
import { useLiveMeals } from "./live";

/** The 1RK move-out fund: the goal with "1RK" in its name. The bar grows in on load. */
export function FundTile() {
  const { data } = useDashboard();
  const fund = data.fund;
  return (
    <Tile title="1RK fund" href={data.goalsHref} tone="fund" area="fund" tilt>
      {fund ? (
        <>
          <BigNumber value={`${fund.pct}%`} size="md" />
          <ProgressBar pct={Math.min(100, fund.pct)} tone="accent" label={`${fund.name}: ${fund.pct}%`} thick />
          <span className="text-xs font-semibold text-soft">{fund.by ? `${fund.progress} · ${fund.by.replace(/^by /, "")}` : fund.progress}</span>
        </>
      ) : (
        <EmptyNote>Add a goal named &ldquo;1RK fund&rdquo; to track it here.</EmptyNote>
      )}
    </Tile>
  );
}

const MARK: Record<string, string> = { Planned: "✓ ", Swapped: "~ ", Skipped: "✕ " };
const CHIP: Record<string, string> = { Planned: "bg-ink text-white", Swapped: "bg-warn-soft text-warn", Skipped: "bg-white/70 text-danger line-through" };

/**
 * Today's 7 meal slots as chips. A tap toggles as planned ↔ skipped and saves to today's check-in
 * (swapped is set in /log). All 7 as planned: confetti and a toast.
 */
export function MealsTile() {
  const { data, setEntry } = useDashboard();
  const meals = useLiveMeals();
  const toast = useToast();
  const confetti = useConfetti();
  const planned = meals.filter((m) => m.status === "Planned").length;

  const tap = (i: number) => {
    const m = meals[i];
    const next = m.status === "Planned" ? 3 : 1;
    const allIn = next === 1 && planned + 1 === meals.length;
    setEntry(m.key, m.trackerId, next, m.name, () => {
      if (!allIn) return;
      confetti({ count: 90 });
      toast({ text: "All meals in. Diet day done." });
    });
  };

  return (
    <Tile
      title="Meals"
      href={data.logHref}
      tone="diet"
      area="diet"
      tilt
      className="gap-2 sm:p-4!"
      aside={meals.length > 0 && <span className="label">{planned}/{meals.length}</span>}
    >
      {meals.length === 0 ? (
        <EmptyNote>Meal slots appear once the check-in has them.</EmptyNote>
      ) : (
        <ul className="m-0 flex list-none flex-wrap gap-1 p-0" aria-label="Meals today">
          {meals.map((m, i) => (
            <li key={m.name}>
              <button
                type="button"
                onClick={() => tap(i)}
                aria-label={`${m.name}: ${m.status ?? "not logged"}. Tap to mark ${m.status === "Planned" ? "skipped" : "as planned"}`}
                className={`press min-h-7 cursor-pointer rounded-full border-0 px-2.5 text-xs font-semibold pointer-coarse:min-h-11 ${m.status ? CHIP[m.status] : "bg-white/70 text-ink"}`}
              >
                {m.status ? MARK[m.status] : ""}
                {m.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Tile>
  );
}

/** TYBBA: open tasks about the course (title or area says TYBBA, exam or study), how many, and the next one. */
export function StudyTile() {
  const { data, tasks } = useDashboard();
  const items = tasks
    .filter((t) => t.status !== "done" && /tybba|exam|study/i.test(`${t.title} ${t.area}`))
    .sort((a, b) => (a.due ?? "9999").localeCompare(b.due ?? "9999"));
  const next = items[0];
  const study = data.study;
  return (
    <Tile title="TYBBA" href={viewHref(data.basePath, "board")} tone="study" area="study" tilt>
      {next ? (
        <>
          <BigNumber value={String(items.length)} unit={items.length === 1 ? "item due" : "items due"} size="md" />
          <span className="line-clamp-2 text-xs font-semibold text-soft">
            Next: {next.title}
            {next.due && ` · ${shortDate(next.due)}`}
          </span>
        </>
      ) : study && study.weekMin > 0 ? (
        <>
          <BigNumber value={(study.weekMin / 60).toLocaleString("en-IN", { maximumFractionDigits: 1 })} unit="hr this week" size="md" />
          <span className="text-xs font-semibold text-soft">Nothing due on the Board.</span>
        </>
      ) : (
        <EmptyNote>Nothing due. Add TYBBA tasks on the Board.</EmptyNote>
      )}
    </Tile>
  );
}

/** Claude's jobs: up to 3, running first, each with a dot (green running, grey idle, red failed + word) and when. */
export function ClaudeTile() {
  const { data } = useDashboard();
  const now = useNow();
  const order = { running: 0, failed: 1, ok: 2, scheduled: 3, paused: 4 };
  const jobs = [...data.claudeJobs].sort((a, b) => order[a.status] - order[b.status]).slice(0, 3);
  return (
    <Tile title="Claude is on it" href={viewHref(data.basePath, "board")} tone="claude" area="claude" tilt aside={<span aria-hidden="true" className="size-2.5 rounded-full bg-claude" />}>
      {jobs.length === 0 ? (
        <EmptyNote>No jobs reported yet.</EmptyNote>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
          {jobs.map((j) => (
            <li key={j.name} className="flex min-w-0 items-center gap-2 text-xs">
              <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${j.status === "running" ? "bg-ok" : j.status === "failed" ? "bg-danger" : "bg-line-strong"}`} />
              <span className="min-w-0 flex-1 truncate font-semibold">{j.name}</span>
              <span className={`shrink-0 ${j.status === "failed" ? "font-semibold text-danger" : "text-soft"}`}>
                {j.status === "running" ? "Running" : j.status === "failed" ? "Failed" : j.lastRun && now != null ? timeAgo(j.lastRun, now) : j.schedule || "Idle"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Tile>
  );
}
