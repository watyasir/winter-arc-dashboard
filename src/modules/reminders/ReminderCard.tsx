"use client";

import { useEffect, useRef, useState } from "react";
import { Chip } from "@/components/Chip";
import { canSnooze, gateChip, gateDetails, type GateChoice } from "@/lib/gate";
import type { Task } from "@/lib/tasks";

const chipTone = { red: "danger", amber: "warn", teal: "blue" } as const;

const secondary =
  "min-h-11 cursor-pointer rounded-full border-0 bg-fill px-3 text-sm font-semibold text-ink hover:bg-fill-strong sm:min-h-10";

/**
 * One task due soon, opened from its reminder toast: what's next, open questions, the chat
 * to look in, and the answers (Done, Doing it now, Snooze to tomorrow, Move date).
 * Each answer is saved to the task and logged, and quiets it until midnight in India.
 */
export function ReminderCard({
  task,
  today,
  onAnswer,
  onClose,
}: {
  task: Task;
  today: string;
  onAnswer: (choice: GateChoice, due?: string) => void;
  onClose: () => void;
}) {
  const chip = gateChip(task.due!, today);
  const { nextSteps, chatName } = gateDetails(task);
  const [moving, setMoving] = useState(false);
  const [date, setDate] = useState(task.due! < today ? today : task.due!);
  const [copied, setCopied] = useState(false);
  const first = useRef<HTMLButtonElement>(null);
  const dateField = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (moving ? dateField.current : first.current)?.focus();
  }, [moving]);

  const copy = () => {
    navigator.clipboard?.writeText(chatName).then(
      () => setCopied(true),
      () => setCopied(false),
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Chip tone={chipTone[chip.tone]}>{chip.label}</Chip>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="ml-auto grid size-11 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-xl text-sub hover:bg-fill"
        >
          ✕
        </button>
      </div>
      <h2 id="reminder-title" className="m-0 truncate text-base leading-[1.3] font-extrabold" title={task.title}>
        {task.title}
      </h2>
      {nextSteps && (
        <p id="reminder-next" className="m-0 line-clamp-2 text-sm leading-[1.45]">
          <span className="font-semibold">Next: </span>
          {nextSteps}
        </p>
      )}
      {task.questions.length > 0 && (
        <div className="flex flex-col gap-1">
          <ul className="m-0 flex list-disc flex-col gap-1 pl-5 text-sm leading-[1.4] text-sub">
            {task.questions.slice(0, 2).map((q) => (
              <li key={q} className="truncate" title={q}>
                {q}
              </li>
            ))}
          </ul>
          {task.questions.length > 2 && <p className="m-0 text-xs text-sub">More questions in chat</p>}
        </div>
      )}
      {chatName && (
        <div className="flex items-center gap-2 border-t border-line pt-3">
          <p className="m-0 line-clamp-2 min-w-0 flex-1 text-xs leading-[1.4] text-sub" title={chatName}>
            For more info, go to the chat &ldquo;{chatName}&rdquo;
          </p>
          <button
            type="button"
            onClick={copy}
            className="min-h-11 shrink-0 cursor-pointer rounded-full border-0 bg-transparent px-2 text-xs font-semibold text-blue-text hover:bg-fill sm:min-h-8"
          >
            <span aria-live="polite">{copied ? "Copied" : "Copy name"}</span>
          </button>
        </div>
      )}

      {moving ? (
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (date >= today) onAnswer("move", date);
          }}
        >
          <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-semibold text-sub">
            New due date
            <input
              ref={dateField}
              type="date"
              required
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="min-h-11 w-full rounded-xl border border-line bg-card px-3 text-base text-ink sm:min-h-10 sm:text-sm"
            />
          </label>
          <div className="flex w-full gap-2">
            <button type="button" onClick={() => setMoving(false)} className={`${secondary} flex-1`}>
              Back
            </button>
            <button type="submit" className="min-h-11 flex-1 cursor-pointer rounded-full border-0 bg-peach px-4 text-sm font-semibold text-ink hover:bg-peach-strong sm:min-h-10">
              Save date
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <button
            ref={first}
            type="button"
            onClick={() => onAnswer("done")}
            className="min-h-11 cursor-pointer rounded-full border-0 bg-peach px-3 text-sm font-semibold text-ink hover:bg-peach-strong sm:min-h-10"
          >
            Done
          </button>
          <button type="button" onClick={() => onAnswer("doing")} className={secondary}>
            Doing it now
          </button>
          {canSnooze(task.due!, today) && (
            <button type="button" onClick={() => onAnswer("snooze")} className={secondary}>
              Snooze to tomorrow
            </button>
          )}
          <button type="button" onClick={() => setMoving(true)} className={secondary}>
            Move date
          </button>
        </div>
      )}
    </div>
  );
}
