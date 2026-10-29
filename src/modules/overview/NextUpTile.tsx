"use client";

import { Chip } from "@/components/Chip";
import { EmptyNote } from "@/components/EmptyNote";
import { Tile } from "@/components/Tile";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { viewHref } from "@/components/dashboard/Nav";
import { shortDate } from "@/lib/trackers";
import type { Task } from "@/lib/tasks";
import { OwnerChip } from "@/modules/board/OwnerChip";

/** The next 3 open tasks from the Board: overdue first, then by due date, then the Board's order. */
export function NextUpTile() {
  const { data, tasks } = useDashboard();
  const today = data.todayISO;
  const next = tasks
    .filter((t) => t.status !== "done")
    .sort((a, b) => (a.due ?? "9999").localeCompare(b.due ?? "9999") || b.order - a.order)
    .slice(0, 3);
  return (
    <Tile title="Next up" href={viewHref(data.basePath, "board")} area="tasks">
      {next.length === 0 && <EmptyNote>Nothing open. Add a task on the Board.</EmptyNote>}
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {next.map((t) => (
          <li key={t.id} className="flex flex-col gap-1.5 rounded-item border border-line p-2.5 text-sm leading-snug font-semibold">
            <span className="line-clamp-2">{t.title}</span>
            <span className="flex flex-wrap items-center gap-1.5">
              <OwnerChip owner={t.owner} />
              <DueChip task={t} today={today} />
            </span>
          </li>
        ))}
      </ul>
    </Tile>
  );
}

/** "! Overdue", "Today" or the date: words, not colour alone. */
function DueChip({ task, today }: { task: Task; today: string }) {
  if (!task.due) return null;
  if (task.due < today) return <Chip tone="danger">! Overdue</Chip>;
  if (task.due === today) return <Chip tone="warn">Today</Chip>;
  return <Chip>{shortDate(task.due)}</Chip>;
}
