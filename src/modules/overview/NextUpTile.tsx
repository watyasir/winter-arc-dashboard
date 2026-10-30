"use client";

import Link from "next/link";
import { useState } from "react";
import { Chip } from "@/components/Chip";
import { Tile } from "@/components/Tile";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { viewHref } from "@/components/dashboard/Nav";
import { useToast } from "@/components/Toast";
import { centreOf, useConfetti } from "@/components/useConfetti";
import { shortDate } from "@/lib/trackers";
import type { Task } from "@/lib/tasks";
import { OwnerChip } from "@/modules/board/OwnerChip";

const SLIDE_MS = 280;

/**
 * The next 3 open tasks: overdue first, then by due date, then the Board's order. The round
 * button ticks one off (saved like a move to Done on the Board): the row slides out, a small
 * confetti burst, and a toast with Undo (which reopens it where it was).
 */
export function NextUpTile() {
  const { data, tasks, moveTask } = useDashboard();
  const toast = useToast();
  const confetti = useConfetti();
  const [leaving, setLeaving] = useState<string[]>([]);
  const today = data.todayISO;
  const open = tasks.filter((t) => t.status !== "done");
  const next = [...open]
    .sort((a, b) => Number(!overdue(a, today)) - Number(!overdue(b, today)) || (a.due ?? "9999").localeCompare(b.due ?? "9999") || b.order - a.order)
    .slice(0, 3);
  const boardHref = viewHref(data.basePath, "board");

  const tick = (t: Task, button: HTMLElement) => {
    if (leaving.includes(t.id)) return;
    const before = t.status;
    setLeaving((l) => [...l, t.id]);
    confetti({ count: 40, from: centreOf(button) });
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(
      () => {
        moveTask(t.id, "done");
        setLeaving((l) => l.filter((id) => id !== t.id));
        const left = open.length - 1;
        toast({ text: left === 0 ? "Nice. All clear." : `Nice. ${left} left.`, undo: () => moveTask(t.id, before) });
      },
      reduced ? 0 : SLIDE_MS,
    );
  };

  return (
    <Tile title="Next up" href={boardHref} tone="tasks" area="tasks" tilt aside={open.length > 0 && <span className="label text-soft">{open.length} open</span>}>
      {next.length === 0 ? (
        <div className="flex flex-1 flex-col justify-center gap-2">
          <p className="display m-0 text-[28px]">All clear.</p>
          <Link href={boardHref} prefetch className="flex min-h-11 items-center text-sm font-semibold text-accent">
            Open the Board →
          </Link>
        </div>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {next.map((t) => {
            const gone = leaving.includes(t.id);
            return (
              <li
                key={t.id}
                className={`flex items-center gap-2 rounded-item bg-card/70 py-1 pr-3 pl-1 transition-[transform,opacity] duration-300 ${gone ? "translate-x-8 opacity-0" : ""}`}
              >
                <button
                  type="button"
                  onClick={(e) => tick(t, e.currentTarget)}
                  disabled={gone}
                  aria-label={`Mark done: ${t.title}`}
                  className="press group grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent"
                >
                  <span
                    aria-hidden="true"
                    className={`grid size-6 place-items-center rounded-full border-2 border-ink text-xs font-bold ${gone ? "bg-ink text-white" : "text-transparent group-hover:text-ink"}`}
                  >
                    ✓
                  </span>
                </button>
                <span className="flex min-w-0 flex-1 flex-col gap-1 py-1.5">
                  <span className="line-clamp-2 text-sm leading-snug font-semibold">{t.title}</span>
                  <span className="flex flex-wrap items-center gap-1.5">
                    <OwnerChip owner={t.owner} />
                    <DueChip task={t} today={today} />
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Tile>
  );
}

const overdue = (t: Task, today: string) => t.due != null && t.due < today;

/** "! Overdue", "Today" or the date: words, not colour alone. */
function DueChip({ task, today }: { task: Task; today: string }) {
  if (!task.due) return null;
  if (task.due < today) return <Chip tone="danger">! Overdue</Chip>;
  if (task.due === today) return <Chip tone="warn">Today</Chip>;
  return <Chip>{shortDate(task.due)}</Chip>;
}
