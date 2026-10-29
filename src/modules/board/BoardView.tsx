"use client";

import { useState, type DragEvent } from "react";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { Chip } from "@/components/Chip";
import { toneBg, type Tone } from "@/lib/tones";
import { boardOrder, TASK_COLUMNS, type Task, type TaskStatus } from "@/lib/tasks";
import { ClaudeJobsPanel } from "./ClaudeJobsPanel";
import { DueLabel } from "./DueLabel";
import { OwnerChip } from "./OwnerChip";
import { TaskSheet, type SheetTarget } from "./TaskSheet";

const columnTone: Record<TaskStatus, Tone> = { todo: "neutral", doing: "blue", waiting: "warn", done: "ok" };

/** How many done tasks show before "Show all". */
const DONE_SHOWN = 20;

/**
 * Four columns. Drag a card to another column (laptop); tap a card to edit it, including its
 * column (phone and keyboard). "Add task" opens the same sheet for that column.
 */
export function BoardView() {
  const { tasks, taskError, moveTask } = useDashboard();
  const [sheet, setSheet] = useState<SheetTarget | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<TaskStatus | null>(null);
  const [allDone, setAllDone] = useState(false);

  const drop = (e: DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    const task = tasks.find((t) => t.id === id);
    if (task && task.status !== status) moveTask(id, status);
    setOver(null);
    setDragging(null);
  };

  return (
    <div className="flex flex-col gap-3">
      {taskError && (
        <p role="alert" className="m-0 rounded-2xl bg-danger-soft px-4 py-3 text-[13px] text-danger">
          {taskError}
        </p>
      )}
      <div className="grid gap-3.5 min-[1200px]:grid-cols-[minmax(0,1fr)_300px]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5">
          {TASK_COLUMNS.map((col) => {
            const all = tasks.filter((t) => t.status === col.status).sort(boardOrder);
            const cards = col.status === "done" && !allDone ? all.slice(0, DONE_SHOWN) : all;
            return (
              <section
                key={col.status}
                aria-label={col.name}
                onDragOver={(e) => {
                  if (!dragging) return;
                  e.preventDefault();
                  setOver(col.status);
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(null);
                }}
                onDrop={(e) => drop(e, col.status)}
                className={`flex min-w-0 flex-col gap-2 rounded-[20px] border bg-fill p-3 ${over === col.status ? "border-blue-text" : "border-line"}`}
              >
                <div className="flex items-center justify-between px-1.5 py-1">
                  <h2 className="m-0 flex items-center gap-2 text-sm font-extrabold">
                    <span aria-hidden="true" className={`size-[9px] rounded-full ${toneBg[columnTone[col.status]]}`} />
                    {col.name}
                  </h2>
                  <Chip>{all.length}</Chip>
                </div>
                {cards.map((k) => (
                  <TaskCard
                    key={k.id}
                    task={k}
                    dragging={dragging === k.id}
                    onOpen={() => setSheet({ task: k, status: k.status })}
                    onDragStart={() => setDragging(k.id)}
                    onDragEnd={() => {
                      setDragging(null);
                      setOver(null);
                    }}
                  />
                ))}
                {col.status === "done" && all.length > DONE_SHOWN && (
                  <button
                    type="button"
                    onClick={() => setAllDone((a) => !a)}
                    className="min-h-11 cursor-pointer rounded-xl border-0 bg-transparent text-xs font-semibold text-blue-text hover:bg-fill sm:min-h-[38px]"
                  >
                    {allDone ? `Show the latest ${DONE_SHOWN}` : `Show all ${all.length}`}
                  </button>
                )}
                {col.status !== "done" && (
                  <button
                    type="button"
                    onClick={() => setSheet({ status: col.status })}
                    className="min-h-11 cursor-pointer rounded-xl border border-dashed border-line-strong bg-transparent text-xs font-semibold text-sub hover:bg-fill sm:min-h-[38px]"
                  >
                    Add task
                  </button>
                )}
              </section>
            );
          })}
        </div>
        <ClaudeJobsPanel />
      </div>
      {sheet && <TaskSheet target={sheet} onClose={() => setSheet(null)} />}
    </div>
  );
}

function TaskCard({
  task,
  dragging,
  onOpen,
  onDragStart,
  onDragEnd,
}: {
  task: Task;
  dragging: boolean;
  onOpen: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const { data } = useDashboard();
  const done = task.status === "done";
  return (
    <button
      type="button"
      draggable
      onClick={onOpen}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", task.id);
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      aria-label={`${done ? "Done: " : ""}${task.title}. Edit`}
      className={`flex w-full cursor-pointer flex-col gap-1.5 rounded-[10px] border border-line bg-card px-3 py-[11px] text-left text-ink hover:border-line-strong ${dragging ? "opacity-50" : ""}`}
    >
      <span className={`text-[13px] leading-[1.35] font-medium ${done ? "text-sub line-through" : ""}`}>{task.title}</span>
      {task.note && <span className="line-clamp-2 text-xs leading-[1.4] text-sub">{task.note}</span>}
      <span className="mt-0.5 flex w-full flex-wrap items-center gap-1.5">
        <OwnerChip owner={task.owner} />
        {task.area && <span className="text-xs text-sub">{task.area}</span>}
        <DueLabel task={task} today={data.todayISO} className="ml-auto" />
      </span>
    </button>
  );
}
