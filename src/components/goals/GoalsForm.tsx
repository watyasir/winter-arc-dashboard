"use client";

import Link from "next/link";
import { useState, useTransition, type ReactNode } from "react";
import { Button } from "@/components/Button";
import { fieldClass, StatusMessages, type Status } from "@/components/body/Sheet";
import { Field, Group } from "@/components/FormGroup";
import { parseNumber, type SaveResult } from "@/lib/body";
import { goalProblem, type Goal, type NewGoal } from "@/lib/tasks";
import { AREA_ORDER, type Tracker } from "@/lib/trackers";

/*
  Goals: add one (target, deadline, progress typed in or taken from a tracker),
  update hand-typed progress, delete. The one primary button is "Add goal".
*/

export interface GoalRow {
  goal: Goal;
  /** "2.1 of 5 kg", worked out on the server. */
  progress: string;
  /** Name of the linked tracker, if any. */
  trackerName: string | null;
}

interface GoalActions {
  add: (g: NewGoal) => Promise<SaveResult>;
  update: (id: string, current: number) => Promise<SaveResult>;
  remove: (id: string) => Promise<SaveResult>;
}

/** Trackers whose totals make sense as goal progress (not 1–5 scales). */
type LinkableTracker = Pick<Tracker, "id" | "name" | "type" | "unit">;

const unitFor = (t: LinkableTracker) => (t.type === "duration_minutes" ? "hr" : t.type === "checkbox" ? "days" : (t.unit ?? ""));

export function GoalsForm({
  rows,
  trackers,
  backHref,
  actions,
  footer,
}: {
  rows: GoalRow[];
  trackers: LinkableTracker[];
  backHref: string;
  actions: GoalActions;
  footer?: ReactNode;
}) {
  const [title, setTitle] = useState("");
  const [area, setArea] = useState<string>(AREA_ORDER[0]);
  const [trackerId, setTrackerId] = useState("");
  const [target, setTarget] = useState("");
  const [unit, setUnit] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState<Status>("editing");
  const [saving, startSaving] = useTransition();
  const linked = trackers.find((t) => t.id === trackerId);

  const add = () => {
    const goal: NewGoal = { title, area, target: parseNumber(target), unit: linked ? "" : unit, deadline: deadline || null, trackerId: trackerId || null };
    const problem = goalProblem(goal);
    if (problem) return setStatus({ error: problem });
    startSaving(async () => {
      const result = await actions.add(goal);
      if (!result.ok) return setStatus({ error: result.message });
      setStatus("saved");
      setTitle("");
      setTarget("");
      setUnit("");
      setDeadline("");
      setTrackerId("");
    });
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col gap-[18px] px-4 pt-6 pb-8">
      <header className="flex items-center justify-between">
        <h1 className="m-0 text-[34px] leading-[1.1] font-extrabold tracking-[-0.02em]">Goals</h1>
        <Link href={backHref} prefetch className="flex min-h-11 items-center text-[17px] text-blue-text no-underline hover:text-blue-hover">
          Done
        </Link>
      </header>

      <Group title="Your goals">
        {rows.length === 0 && <p className="m-0 py-3.5 text-[15px] text-sub">No goals yet. Add your first one below.</p>}
        {rows.map((r) => (
          <GoalItem key={r.goal.id} row={r} actions={actions} />
        ))}
      </Group>

      <Group title="New goal">
        <Field label="Name">
          <input value={title} maxLength={60} placeholder="e.g. Run 100 km" onChange={(e) => setTitle(e.target.value)} className={`${fieldClass} w-44`} />
        </Field>
        <Field label="Area">
          <select value={area} onChange={(e) => setArea(e.target.value)} className={`${fieldClass} w-44 cursor-pointer`}>
            {AREA_ORDER.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </Field>
        <Field label="Progress from">
          <select value={trackerId} onChange={(e) => setTrackerId(e.target.value)} className={`${fieldClass} w-44 cursor-pointer`}>
            <option value="">I&apos;ll type it in</option>
            {trackers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Target">
          <span className="flex items-center gap-2">
            <input inputMode="decimal" value={target} placeholder="–" onChange={(e) => setTarget(e.target.value.replace(/[^\d.,]/g, ""))} className={`${fieldClass} w-24 text-right`} />
            {linked ? (
              <span className="w-[72px] text-[15px] text-sub">{unitFor(linked)}</span>
            ) : (
              <input aria-label="Unit" value={unit} maxLength={12} placeholder="unit" onChange={(e) => setUnit(e.target.value)} className={`${fieldClass} w-[72px] px-3`} />
            )}
          </span>
        </Field>
        <Field label="Deadline">
          <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={fieldClass} />
        </Field>
      </Group>
      {linked && (
        <p className="m-0 mx-4 -mt-3 text-[13px] text-sub">
          Counts your {linked.name.toLowerCase()} {linked.type === "checkbox" ? "days" : "total"} from today on.
        </p>
      )}

      <StatusMessages status={status} savedText="Goal added." />
      <Button variant="primary" onClick={add} disabled={saving} className="min-h-[50px] text-[17px] sm:min-h-[50px]">
        {saving ? "Adding…" : "Add goal"}
      </Button>
      {footer}
    </div>
  );
}

function GoalItem({ row, actions }: { row: GoalRow; actions: GoalActions }) {
  const { goal } = row;
  const [now, setNow] = useState(String(goal.current));
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, startBusy] = useTransition();

  const run = (fn: () => Promise<SaveResult>, okText: string) =>
    startBusy(async () => {
      const r = await fn();
      setMsg(r.ok ? { ok: true, text: okText } : { ok: false, text: r.message });
    });

  const save = () => {
    const n = parseNumber(now);
    if (n == null || n < 0) return setMsg({ ok: false, text: "Type a number, 0 or more." });
    run(() => actions.update(goal.id, n), "Saved ✓");
  };

  return (
    <div className="flex flex-col gap-1.5 py-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[17px] font-semibold">{goal.title}</span>
        <span className="text-right text-[13px] text-sub">{row.progress}</span>
      </div>
      <div className="flex items-center gap-2">
        {row.trackerName ? (
          <span className="flex-1 text-[13px] text-sub">From {row.trackerName}, updates itself</span>
        ) : (
          <>
            <input
              inputMode="decimal"
              aria-label={`Progress so far on ${goal.title}`}
              value={now}
              onChange={(e) => setNow(e.target.value.replace(/[^\d.,]/g, ""))}
              className={`${fieldClass} w-24 text-right`}
            />
            <span className="text-[15px] text-sub">{goal.unit}</span>
            <Button onClick={save} disabled={busy} className="ml-auto">
              Update
            </Button>
          </>
        )}
        <button
          type="button"
          aria-label={`Delete ${goal.title}`}
          onClick={() => window.confirm(`Delete the goal "${goal.title}"?`) && run(() => actions.remove(goal.id), "Deleted")}
          disabled={busy}
          className="min-h-11 cursor-pointer rounded-full border-0 bg-transparent px-2 text-[13px] font-semibold text-danger hover:bg-danger-soft"
        >
          Delete
        </button>
      </div>
      {msg && (
        <p role={msg.ok ? "status" : "alert"} className={`m-0 text-[13px] ${msg.ok ? "text-ok" : "text-danger"}`}>
          {msg.text}
        </p>
      )}
    </div>
  );
}
