"use client";

import { useEffect, useRef, useState } from "react";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { gateChip, gateQueue, type GateChoice } from "@/lib/gate";
import { ReminderCard } from "./ReminderCard";

const chipText = { red: "text-danger", amber: "text-warn", teal: "text-accent" } as const;

/**
 * Tasks due within 3 days (overdue first, at most 3) as toasts: stacked in the corner on a
 * laptop, one at a time above the tab bar on the phone. Nothing is blocked: the page works as normal. Tap a toast to open its
 * card and answer; ✕ hides the toast for this visit only. The list is fixed when the page
 * opens, so answering one doesn't pull in another.
 */
export function Reminders() {
  const { data, tasks, answerGate } = useDashboard();
  const [queue] = useState(() => gateQueue(tasks, data.todayISO).map((t) => t.id));
  const [gone, setGone] = useState<string[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  // A task deleted elsewhere meanwhile drops out.
  const shown = queue.filter((id) => !gone.includes(id)).flatMap((id) => tasks.filter((t) => t.id === id));
  const open = shown.find((t) => t.id === openId);

  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
    if (!open && dialog.current?.open) dialog.current.close();
  }, [open]);

  const answer = (choice: GateChoice, due?: string) => {
    if (!open) return;
    answerGate(open.id, choice, due);
    setGone((g) => [...g, open.id]);
    setOpenId(null);
  };

  return (
    <>
      {shown.length > 0 && (
        <ul
          aria-label="Reminders"
          className="fixed right-4 bottom-[calc(72px+env(safe-area-inset-bottom))] left-4 z-30 m-0 flex list-none flex-col gap-2 p-0 min-[561px]:bottom-6 min-[561px]:left-auto min-[561px]:w-[340px]"
        >
          {shown.map((t, i) => {
            const chip = gateChip(t.due!, data.todayISO);
            return (
              // Phone: one toast at a time (the next shows once it's answered or hidden), with the count.
              <li key={t.id} className={`flex items-center rounded-tile bg-card shadow-lift ${i > 0 ? "max-[560px]:hidden" : ""}`}>
                <button
                  type="button"
                  onClick={() => setOpenId(t.id)}
                  className="press flex min-h-14 min-w-0 flex-1 cursor-pointer flex-col items-start justify-center gap-1 rounded-tile border-0 bg-transparent px-4 py-2.5 text-left"
                >
                  <span className="label flex w-full justify-between gap-2">
                    <span className={chipText[chip.tone]}>{chip.label}</span>
                    {i === 0 && shown.length > 1 && <span className="text-soft min-[561px]:hidden">1 of {shown.length}</span>}
                  </span>
                  <span className="w-full truncate text-sm font-semibold text-ink">{t.title}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGone((g) => [...g, t.id])}
                  aria-label={`Hide reminder: ${t.title}`}
                  className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-base text-soft hover:bg-fill"
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <dialog
        ref={dialog}
        aria-labelledby="reminder-title"
        onClose={() => setOpenId(null)}
        onClick={(e) => e.target === e.currentTarget && setOpenId(null)}
        className="m-auto w-[calc(100%-32px)] max-w-[440px] rounded-tile border border-line bg-card p-5 text-ink shadow-tile backdrop:bg-ink/30"
      >
        {open && <ReminderCard key={open.id} task={open} today={data.todayISO} onAnswer={answer} onClose={() => setOpenId(null)} />}
      </dialog>
    </>
  );
}
