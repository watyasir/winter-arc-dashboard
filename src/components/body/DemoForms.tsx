"use client";

import { DEMO_TODAY, DEMO_WEIGHT_GOAL, demoBodyChecks, demoWorkouts } from "@/data/demo/body";
import { BodyCheckForm } from "./BodyCheckForm";
import { WorkoutForm } from "./WorkoutForm";

/* /demo versions of the workout log and body check: same screens, nothing is saved. */

const pretendSave = () => new Promise<{ ok: true }>((resolve) => setTimeout(() => resolve({ ok: true }), 400));
const note = <p className="m-0 mx-4 text-[13px] text-soft">Demo: nothing is saved. The real log stores each set in the database.</p>;

export function DemoWorkoutForm({ repeat }: { repeat: boolean }) {
  return (
    <WorkoutForm
      today={DEMO_TODAY}
      recent={demoWorkouts.slice(0, 5)}
      exerciseNames={[...new Set(demoWorkouts.flatMap((w) => w.sets.map((s) => s.exercise)))]}
      workoutNames={[...new Set(demoWorkouts.map((w) => w.name))]}
      startWithRepeat={repeat}
      cancelHref="/demo"
      onSave={pretendSave}
      footer={note}
    />
  );
}

export function DemoBodyCheckForm() {
  return (
    <BodyCheckForm
      today={DEMO_TODAY}
      existing={null}
      previous={demoBodyChecks[0]}
      goal={DEMO_WEIGHT_GOAL}
      cancelHref="/demo"
      onSave={pretendSave}
      footer={note}
    />
  );
}
