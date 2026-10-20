"use client";

import { useState, type FormEvent } from "react";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { Chip } from "@/components/Chip";
import { Icon } from "@/components/Icon";
import { toneBg, type Tone } from "@/lib/tones";
import { TASK_COLUMNS, taskProblem, type Task, type TaskStatus } from "@/lib/tasks";
import { DueLabel } from "./DueLabel";
import { OwnerChip } from "./OwnerChip";

const columnTone: Record<TaskStatus, Tone> = { todo: "neutral", doing: "brand", waiting: "yellow", done: "sage" };

/** Four columns on mantle. Each card has a column picker to move it; "Add task" adds to that column. */
export function BoardView() {
  const { tasks, taskError } = useDashboard();
  return (
    <div className="flex flex-col gap-3">
      {taskError && (
        <p role="alert" className="m-0 rounded-2xl bg-coral/12 px-4 py-3 text-[13px] text-coral-text">
          {taskError}
        </p>
      )}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-3.5">
        {TASK_COLUMNS.map((col) => {
          const cards = tasks.filter((t) => t.status === col.status);
          return (
            <section key={col.status} aria-label={col.name} className="flex min-w-0 flex-col gap-2 rounded-[20px] border border-sep bg-column p-3">
              <div className="flex items-center justify-between px-1.5 py-1">
                <h2 className="m-0 flex items-center gap-2 text-sm font-bold">
                  <span aria-hidden="true" className={`size-[9px] rounded-full ${toneBg[columnTone[col.status]]}`} />
                  {col.name}
                </h2>
                <Chip>{cards.length}</Chip>
              </div>
              {cards.map((k) => (
                <TaskCard key={k.id} task={k} />
              ))}
              {col.status !== "done" && <AddTask status={col.status} column={col.name} />}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  const { data, moveTask, deleteTask } = useDashboard();
  const done = task.status === "done";
  return (
    <div className="flex flex-col gap-2 rounded-[10px] border border-sep bg-base px-3 py-[11px]">
      <span className={`text-[13px] leading-[1.35] font-medium ${done ? "text-sub line-through" : ""}`}>
        {done && <span className="sr-only">Done: </span>}
        {task.title}
      </span>
      <div className="flex flex-wrap items-center gap-1.5">
        <OwnerChip owner={task.owner} />
        {task.area && <span className="text-xs text-sub">{task.area}</span>}
        <DueLabel task={task} today={data.todayISO} className="ml-auto" />
      </div>
      <div className="flex items-center gap-1.5">
        <select
          aria-label={`Column for ${task.title}`}
          value={task.status}
          onChange={(e) => moveTask(task.id, e.target.value as TaskStatus)}
          className="min-h-11 flex-1 cursor-pointer rounded-full border border-sep bg-fill px-3 text-xs font-semibold text-ink sm:min-h-8"
        >
          {TASK_COLUMNS.map((c) => (
            <option key={c.status} value={c.status}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          aria-label={`Delete ${task.title}`}
          onClick={() => window.confirm(`Delete "${task.title}"?`) && deleteTask(task.id)}
          className="flex size-11 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-sub hover:bg-fill sm:size-8"
        >
          <Icon name="x" size={14} strokeWidth={2.4} className="stroke-current" />
        </button>
      </div>
    </div>
  );
}

const inputClass = "min-h-11 w-full rounded-full border border-sep bg-base px-3 text-[13px] text-ink placeholder:text-sub sm:min-h-9";

/** "Add task" opens a small form at the bottom of the column: title, then optional area and due date. */
function AddTask({ status, column }: { status: TaskStatus; column: string }) {
  const { addTask } = useDashboard();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [area, setArea] = useState("");
  const [due, setDue] = useState("");
  const [problem, setProblem] = useState<string | null>(null);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="min-h-11 cursor-pointer rounded-xl border border-dashed border-overlay bg-transparent text-xs font-semibold text-sub hover:bg-fill sm:min-h-[38px]"
      >
        Add task
      </button>
    );
  }

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const task = { title, area, due: due || null, status };
    const p = taskProblem(task);
    if (p) return setProblem(p);
    addTask(task);
    setTitle("");
    setArea("");
    setDue("");
    setProblem(null);
  };

  return (
    <form onSubmit={submit} aria-label={`Add a task to ${column}`} className="flex flex-col gap-2 rounded-[10px] border border-sep bg-base p-2.5">
      <input autoFocus aria-label="Task title" placeholder="What needs doing?" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} className={inputClass} />
      <div className="flex gap-2">
        <input aria-label="Area" placeholder="Area" value={area} onChange={(e) => setArea(e.target.value)} maxLength={40} className={`${inputClass} min-w-0 flex-1`} />
        <input aria-label="Due date" type="date" value={due} onChange={(e) => setDue(e.target.value)} className={`${inputClass} w-auto flex-1`} />
      </div>
      {problem && (
        <p role="alert" className="m-0 text-xs text-coral-text">
          {problem}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => setOpen(false)} className="min-h-11 cursor-pointer rounded-full border-0 bg-transparent px-3 text-xs font-semibold text-brand-text sm:min-h-8">
          Close
        </button>
        <button type="submit" className="min-h-11 cursor-pointer rounded-full border border-sep bg-base px-4 text-xs font-semibold text-ink hover:bg-fill-strong sm:min-h-8">
          Add
        </button>
      </div>
    </form>
  );
}
