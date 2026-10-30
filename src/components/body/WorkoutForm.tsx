"use client";

import Link from "next/link";
import { useId, useState, useTransition, type ReactNode } from "react";
import { Button } from "@/components/Button";
import { groupSets, kg, parseNumber, workoutProblem, workoutSummary, type SaveResult, type Workout, type WorkoutInput } from "@/lib/body";
import { formatDayLabel } from "@/lib/trackers";
import { RecentWorkouts } from "./RecentWorkouts";
import { SheetHeader, StatusMessages, fieldClass, type Status } from "./Sheet";

/*
  Log a workout: a name, then exercises with sets of reps × kg.
  "Repeat last workout" copies the latest session in one tap, so a normal gym day is
  that tap, a few weight changes and Save.
*/

interface SetDraft {
  key: number;
  reps: string;
  weight: string;
}

interface ExerciseDraft {
  key: number;
  name: string;
  sets: SetDraft[];
}

let nextKey = 1;
const newSet = (reps = "", weight = ""): SetDraft => ({ key: nextKey++, reps, weight });
const blankExercise = (): ExerciseDraft => ({ key: nextKey++, name: "", sets: [newSet()] });

function fromWorkout(w: Workout): ExerciseDraft[] {
  return groupSets(w.sets).map((g) => ({
    key: nextKey++,
    name: g.exercise,
    sets: g.sets.map((s) => newSet(String(s.reps), s.weight == null ? "" : kg(s.weight))),
  }));
}

export function WorkoutForm({
  today,
  recent,
  exerciseNames,
  workoutNames,
  startWithRepeat,
  cancelHref,
  onSave,
  onDelete,
  footer,
}: {
  /** YYYY-MM-DD in India. */
  today: string;
  /** Latest first. The first one is what "Repeat last workout" copies. */
  recent: Workout[];
  /** Past exercise and workout names, offered as suggestions while typing. */
  exerciseNames: string[];
  workoutNames: string[];
  /** Opened from the dashboard's "Repeat last workout": start with it filled in. */
  startWithRepeat?: boolean;
  cancelHref: string;
  onSave: (w: WorkoutInput) => Promise<SaveResult>;
  /** Real log only. The demo has nothing to delete. */
  onDelete?: (id: string) => Promise<SaveResult>;
  footer?: ReactNode;
}) {
  const last = recent[0];
  const [date, setDate] = useState(today);
  const [name, setName] = useState(startWithRepeat && last ? last.name : "");
  const [exercises, setExercises] = useState<ExerciseDraft[]>(() => (startWithRepeat && last ? fromWorkout(last) : [blankExercise()]));
  const [status, setStatus] = useState<Status>("editing");
  const [saving, startSaving] = useTransition();
  const [deleting, startDeleting] = useTransition();
  const ids = useId();

  const edit = (fn: (list: ExerciseDraft[]) => ExerciseDraft[]) => {
    setExercises(fn);
    setStatus("editing");
  };
  const editExercise = (key: number, fn: (e: ExerciseDraft) => ExerciseDraft) => edit((list) => list.map((e) => (e.key === key ? fn(e) : e)));

  const repeatLast = () => {
    if (!last) return;
    setName(last.name);
    edit(() => fromWorkout(last));
  };

  const save = () => {
    // Rows left completely empty are skipped, so a spare blank set never blocks saving.
    const sets = exercises.flatMap((e) =>
      e.sets
        .filter((s) => s.reps.trim() || s.weight.trim())
        .map((s) => ({ exercise: e.name, reps: Number(s.reps.trim() || NaN), weight: parseNumber(s.weight) })),
    );
    const input = { date, name, sets };
    const problem = workoutProblem(input, today);
    if (problem) return setStatus({ error: problem });
    startSaving(async () => {
      const result = await onSave(input);
      if (!result.ok) return setStatus({ error: result.message });
      setStatus("saved");
      // Start clean so tapping Save again can't log the same session twice.
      setName("");
      setExercises([blankExercise()]);
    });
  };

  const remove = (w: Workout) => {
    if (!onDelete || !window.confirm(`Delete ${w.name} from ${formatDayLabel(w.date)}?`)) return;
    startDeleting(async () => {
      const result = await onDelete(w.id);
      setStatus(result.ok ? "editing" : { error: result.message });
    });
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col gap-[18px] px-4 pt-2 pb-8">
      <SheetHeader title="Workout" subtitle={formatDayLabel(date)} cancelHref={cancelHref} onSave={save} saving={saving} saved={status === "saved"} />
      <StatusMessages status={status} savedText="Workout saved. It's on your dashboard." />

      {last && (
        <section aria-label="Last workout" className="flex items-center justify-between gap-3 rounded-[14px] border border-line bg-card px-4 py-3">
          <div className="min-w-0">
            <div className="text-[13px] text-soft">Last workout · {formatDayLabel(last.date)}</div>
            <div className="truncate text-[17px] font-semibold">{last.name}</div>
            <div className="text-[13px] text-soft">{workoutSummary(last.sets)}</div>
          </div>
          <Button onClick={repeatLast} className="shrink-0">
            Repeat last workout
          </Button>
        </section>
      )}

      <section aria-label="Workout details" className="flex flex-col gap-3 rounded-[14px] border border-line bg-card p-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-[15px] font-semibold">Name</span>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setStatus("editing");
            }}
            list={`${ids}-names`}
            placeholder="Push day"
            maxLength={60}
            autoComplete="off"
            className={fieldClass}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[15px] font-semibold">Date</span>
          <input type="date" value={date} max={today} onChange={(e) => e.target.value && setDate(e.target.value)} className={fieldClass} />
        </label>
      </section>

      {exercises.map((ex, i) => (
        <section key={ex.key} aria-label={ex.name || `Exercise ${i + 1}`} className="flex flex-col gap-2 rounded-[14px] border border-line bg-card p-4">
          <div className="flex items-end gap-2">
            <label className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="text-[15px] font-semibold">Exercise {i + 1}</span>
              <input
                value={ex.name}
                onChange={(e) => editExercise(ex.key, (x) => ({ ...x, name: e.target.value }))}
                list={`${ids}-exercises`}
                placeholder="Bench press"
                maxLength={60}
                autoComplete="off"
                className={fieldClass}
              />
            </label>
            {exercises.length > 1 && (
              <button
                type="button"
                onClick={() => edit((list) => list.filter((x) => x.key !== ex.key))}
                className="min-h-11 shrink-0 cursor-pointer rounded-full border-0 bg-transparent px-3 text-[15px] text-danger hover:bg-fill"
              >
                Remove
              </button>
            )}
          </div>

          {ex.sets.map((s, si) => (
            <div key={s.key} role="group" aria-label={`Set ${si + 1}`} className="flex items-center gap-2">
              <span className="w-12 shrink-0 text-[13px] text-soft">Set {si + 1}</span>
              <input
                aria-label={`Set ${si + 1} reps`}
                inputMode="numeric"
                value={s.reps}
                placeholder="Reps"
                onChange={(e) =>
                  editExercise(ex.key, (x) => ({ ...x, sets: x.sets.map((y) => (y.key === s.key ? { ...y, reps: e.target.value.replace(/\D/g, "") } : y)) }))
                }
                className={`${fieldClass} w-0 min-w-0 flex-1 text-right`}
              />
              <span aria-hidden="true" className="text-soft">
                ×
              </span>
              <input
                aria-label={`Set ${si + 1} weight in kg, empty for bodyweight`}
                inputMode="decimal"
                value={s.weight}
                placeholder="kg"
                onChange={(e) =>
                  editExercise(ex.key, (x) => ({
                    ...x,
                    sets: x.sets.map((y) => (y.key === s.key ? { ...y, weight: e.target.value.replace(/[^\d.,]/g, "") } : y)),
                  }))
                }
                className={`${fieldClass} w-0 min-w-0 flex-1 text-right`}
              />
              <span aria-hidden="true" className="w-5 text-[13px] text-soft">
                kg
              </span>
              <button
                type="button"
                aria-label={`Remove set ${si + 1}`}
                disabled={ex.sets.length === 1}
                onClick={() => editExercise(ex.key, (x) => ({ ...x, sets: x.sets.filter((y) => y.key !== s.key) }))}
                className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-xl text-soft hover:bg-fill disabled:cursor-default disabled:text-disabled disabled:hover:bg-transparent"
              >
                −
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              editExercise(ex.key, (x) => {
                // A new set starts as a copy of the one before: usually the same reps and weight.
                const prev = x.sets.at(-1);
                return { ...x, sets: [...x.sets, newSet(prev?.reps, prev?.weight)] };
              })
            }
            className="min-h-11 cursor-pointer self-start rounded-full border-0 bg-transparent px-3 text-[15px] font-semibold text-accent hover:bg-fill"
          >
            + Add set
          </button>
        </section>
      ))}

      <Button onClick={() => edit((list) => [...list, blankExercise()])} className="text-[15px]">
        + Add exercise
      </Button>

      <datalist id={`${ids}-exercises`}>
        {exerciseNames.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>
      <datalist id={`${ids}-names`}>
        {workoutNames.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>

      <RecentWorkouts recent={recent} deleting={deleting} onDelete={onDelete ? remove : undefined} />

      <Link href={cancelHref} className="flex min-h-11 items-center self-center text-[15px]">
        Back to dashboard
      </Link>
      {footer}
    </div>
  );
}
