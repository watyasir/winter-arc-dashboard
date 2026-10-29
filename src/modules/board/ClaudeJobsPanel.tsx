"use client";

import { Chip, type ChipTone } from "@/components/Chip";
import { EmptyNote } from "@/components/EmptyNote";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import type { JobStatus } from "@/lib/claude-jobs";
import { istMinutes } from "@/lib/day-plan";
import { clockLabel, shortDate, todayISO } from "@/lib/trackers";

const statusChip: Record<JobStatus, { tone: ChipTone; label: string }> = {
  ok: { tone: "sage", label: "OK" },
  failed: { tone: "coral", label: "Failed" },
  running: { tone: "brand", label: "Running" },
  scheduled: { tone: "neutral", label: "Scheduled" },
  paused: { tone: "neutral", label: "Paused" },
};

/** "27 Oct, 8:45 AM" in India time. */
function when(iso: string | null): string {
  if (!iso) return "–";
  const d = new Date(iso);
  return `${shortDate(todayISO(d))}, ${clockLabel(istMinutes(d))}`;
}

/**
 * Claude's scheduled tasks, beside the Board and kept apart from Yasir's tasks: a different
 * panel, Claude-orange marker, no drag or edit. Claude reports them through /api/claude-jobs.
 */
export function ClaudeJobsPanel() {
  const { data } = useDashboard();
  const jobs = data.claudeJobs;
  return (
    <aside aria-label="Claude's scheduled tasks" className="flex min-w-0 flex-col gap-2 self-start rounded-[20px] border border-dashed border-claude/50 bg-base p-3">
      <div className="flex items-center justify-between gap-2 px-1.5 py-1">
        <h2 className="m-0 flex items-center gap-2 text-sm font-bold">
          <span aria-hidden="true" className="size-[9px] rounded-full bg-claude" />
          Claude&apos;s scheduled tasks
        </h2>
        <Chip>{jobs.length}</Chip>
      </div>
      <p className="m-0 px-1.5 text-xs text-sub">Run by Claude on a timer. Not on your Board.</p>
      {jobs.length === 0 && (
        <div className="px-1.5 py-1">
          <EmptyNote>None reported yet. Claude adds them through the API (POST /api/claude-jobs).</EmptyNote>
        </div>
      )}
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {jobs.map((j) => (
          <li key={j.name} className="flex flex-col gap-1 rounded-[10px] border border-sep bg-column px-3 py-2.5">
            <span className="flex items-start justify-between gap-2">
              <span className="min-w-0 text-[13px] leading-[1.35] font-medium">{j.name}</span>
              <Chip tone={statusChip[j.status].tone}>{statusChip[j.status].label}</Chip>
            </span>
            {j.schedule && <span className="text-xs text-sub">{j.schedule}</span>}
            <span className="flex flex-wrap gap-x-3 text-[11px] text-sub tabular-nums">
              <span>Last: {when(j.lastRun)}</span>
              <span>Next: {when(j.nextRun)}</span>
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
