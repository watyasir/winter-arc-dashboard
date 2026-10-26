"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Chip } from "@/components/Chip";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { canSnooze, gateChip, gateDetails, gateQueue, type GateChoice } from "@/lib/gate";
import type { Task } from "@/lib/tasks";

const chipTone = { red: "coral", amber: "yellow", teal: "brand" } as const;

const secondary =
  "min-h-11 cursor-pointer rounded-full border-0 bg-fill px-3 text-[13px] font-semibold text-ink hover:bg-fill-strong sm:min-h-10";

/**
 * The action gate (src/lib/gate.ts). Before anything else, up to 3 tasks due within 3 days
 * get a card each, one at a time. The dashboard behind is blurred and can't be used until
 * every card is answered: no close button, Esc and clicks outside do nothing.
 * The queue is fixed when the page opens, so answering one doesn't pull in a 4th.
 */
export function ActionGate({ children }: { children: ReactNode }) {
  const { data, tasks, answerGate } = useDashboard();
  const [queue] = useState(() => gateQueue(tasks, data.todayISO).map((t) => t.id));
  const [answered, setAnswered] = useState<string[]>([]);
  // A task deleted elsewhere meanwhile is skipped.
  const task = queue.filter((id) => !answered.includes(id)).map((id) => tasks.find((t) => t.id === id)).find(Boolean);
  const locked = task !== undefined;

  useEffect(() => {
    if (!locked) return;
    const root = document.documentElement;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = "";
    };
  }, [locked]);

  const answer = (choice: GateChoice, due?: string) => {
    if (!task) return;
    answerGate(task.id, choice, due);
    setAnswered((a) => [...a, task.id]);
  };

  return (
    <>
      <div inert={locked} aria-hidden={locked || undefined} className={locked ? "pointer-events-none blur-[6px] select-none" : undefined}>
        {children}
      </div>
      {task && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4">
          <GateCard key={task.id} task={task} today={data.todayISO} position={`${answered.length + 1} of ${queue.length}`} onAnswer={answer} />
        </div>
      )}
    </>
  );
}

function GateCard({
  task,
  today,
  position,
  onAnswer,
}: {
  task: Task;
  today: string;
  position: string;
  onAnswer: (choice: GateChoice, due?: string) => void;
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
    <section
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="gate-title"
      aria-describedby={nextSteps ? "gate-next" : undefined}
      className="flex w-full max-w-[440px] flex-col gap-3 rounded-[20px] bg-base p-5 text-ink"
    >
      <div className="flex items-center gap-2">
        <Chip tone={chipTone[chip.tone]}>{chip.label}</Chip>
        <span className="ml-auto text-xs text-sub">{position}</span>
      </div>
      <h2 id="gate-title" className="m-0 truncate text-[17px] leading-[1.3] font-bold" title={task.title}>
        {task.title}
      </h2>
      {nextSteps && (
        <p id="gate-next" className="m-0 line-clamp-2 text-[13px] leading-[1.45]">
          <span className="font-semibold">Next: </span>
          {nextSteps}
        </p>
      )}
      {task.questions.length > 0 && (
        <div className="flex flex-col gap-1">
          <ul className="m-0 flex list-disc flex-col gap-1 pl-5 text-[13px] leading-[1.4] text-sub">
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
        <div className="flex items-center gap-2 border-t border-sep pt-3">
          <p className="m-0 line-clamp-2 min-w-0 flex-1 text-xs leading-[1.4] text-sub" title={chatName}>
            For more info, go to the chat &ldquo;{chatName}&rdquo;
          </p>
          <button
            type="button"
            onClick={copy}
            className="min-h-11 shrink-0 cursor-pointer rounded-full border-0 bg-transparent px-2 text-xs font-semibold text-brand-text hover:bg-fill sm:min-h-8"
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
              className="min-h-11 w-full rounded-xl border border-sep bg-base px-3 text-[15px] text-ink sm:min-h-10 sm:text-[13px]"
            />
          </label>
          <div className="flex w-full gap-2">
            <button type="button" onClick={() => setMoving(false)} className={`${secondary} flex-1`}>
              Back
            </button>
            <button type="submit" className="min-h-11 flex-1 cursor-pointer rounded-full border-0 bg-brand px-4 text-[13px] font-semibold text-white hover:bg-brand-hover sm:min-h-10">
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
            className="min-h-11 cursor-pointer rounded-full border-0 bg-brand px-3 text-[13px] font-semibold text-white hover:bg-brand-hover sm:min-h-10"
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
    </section>
  );
}
