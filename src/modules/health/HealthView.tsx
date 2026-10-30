"use client";

import { useState } from "react";
import { EmptyNote } from "@/components/EmptyNote";
import { changeWords, LineChart } from "@/components/LineChart";
import { Segmented } from "@/components/Segmented";
import { BigNumber, Tile, type TileTone } from "@/components/Tile";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { addDays } from "@/lib/trackers";
import type { Point } from "@/modules/types";
import { TodayRows } from "@/modules/today/TodayRows";
import { BodyTile } from "./BodyTile";
import { WorkoutsTile } from "./WorkoutsTile";

const RANGES = [14, 30, 90] as const;

/** Health: weight, steps and sleep over 14 / 30 / 90 days, blood pressure, today's trackers, workouts, the body check. */
export function HealthView() {
  const { data } = useDashboard();
  const [days, setDays] = useState<(typeof RANGES)[number]>(14);
  const within = (points: Point[]) => points.filter((p) => p.date > addDays(data.todayISO, -days));

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full max-w-xs">
        <Segmented label="Chart range" options={RANGES.map((d) => ({ value: d, label: `${d} days` }))} value={days} onChange={setDays} />
      </div>
      <div className="grid gap-4 min-[861px]:grid-cols-3">
        <TrendTile title="Weight" tone="weight" points={within(data.weight.points)} unit="kg" days={days} empty="Log your weight on 2 days to see the trend." />
        <TrendTile title="Steps" tone="today" points={within(data.steps)} unit="steps" digits={0} days={days} empty="Log steps on 2 days to see the trend." />
        <TrendTile title="Sleep" tone="study" points={within(data.sleep)} unit="hr" days={days} empty="Log lights out and wake time (or sleep hours) on 2 days." />
      </div>
      <div className="grid items-start gap-4 min-[861px]:grid-cols-2">
        <BpTile />
        <Tile title="Today's trackers" href={data.logHref}>
          <div className="flex flex-col">
            <TodayRows />
          </div>
        </Tile>
        <WorkoutsTile />
        <BodyTile />
      </div>
    </div>
  );
}

function TrendTile({
  title,
  tone,
  points,
  unit,
  days,
  empty,
  digits = 1,
}: {
  title: string;
  tone: TileTone;
  points: Point[];
  unit: string;
  days: number;
  empty: string;
  digits?: number;
}) {
  if (points.length < 2) {
    return (
      <Tile title={title} tone={tone}>
        <EmptyNote>{empty}</EmptyNote>
      </Tile>
    );
  }
  const latest = points.at(-1)!.value;
  const change = changeWords(points, unit, digits);
  return (
    <Tile title={title} tone={tone} aside={<span className="text-xs text-soft">{change}</span>}>
      <BigNumber value={latest.toLocaleString("en-IN", { maximumFractionDigits: digits })} unit={unit} size="md" />
      <LineChart points={points} unit={unit} digits={digits} height={110} summary={`${title} ${change} over ${days} days, latest ${latest} ${unit}`} />
    </Tile>
  );
}

function BpTile() {
  const { bp } = useDashboard().data;
  const any = bp.some((r) => r.value);
  return (
    <Tile title="Blood pressure" aside={<span className="text-xs text-soft">today · mmHg</span>}>
      {!any && <EmptyNote>Log morning and evening readings in the check-in.</EmptyNote>}
      {any && (
        <dl className="m-0 grid grid-cols-2 gap-2">
          {bp.map((r) => (
            <div key={r.label} className="flex flex-col rounded-item border border-line bg-fill p-3">
              <dt className="text-xs text-soft">{r.label}</dt>
              <dd className="m-0 font-mono text-xl font-bold">{r.value ?? "–"}</dd>
            </div>
          ))}
        </dl>
      )}
    </Tile>
  );
}
