"use client";

import { EmptyNote } from "@/components/EmptyNote";
import { LineChart } from "@/components/LineChart";
import { Tile } from "@/components/Tile";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { GoalsTile } from "@/modules/goals/GoalsTile";
import { HeroTile } from "@/modules/overview/HeroTile";
import { ArcStreaksTile, ArcTargetsTile, ArcWeeksTile } from "./ArcTiles";

/** The Winter Arc page: the hero, daily consistency, targets, streaks, week by week, goals. */
export function WinterArcView() {
  return (
    <div className="grid items-start gap-4 min-[861px]:grid-cols-2">
      <HeroTile onPage />
      <ConsistencyTile />
      <ArcTargetsTile />
      <ArcStreaksTile />
      <div className="min-w-0 min-[861px]:col-span-2">
        <ArcWeeksTile />
      </div>
      <GoalsTile />
      <ShareTile />
    </div>
  );
}

/** Daily score 0-100: how much of the check-in was filled, plus meals as planned. */
function ConsistencyTile() {
  const points = useDashboard().data.consistency;
  if (points.length < 2) {
    return (
      <Tile title="Consistency">
        <EmptyNote>Log 2 days to see your daily score here.</EmptyNote>
      </Tile>
    );
  }
  const avg = Math.round(points.reduce((n, p) => n + p.value, 0) / points.length);
  const today = points.at(-1)!.value;
  return (
    <Tile title="Consistency" aside={<span className="text-xs text-soft">score out of 100</span>}>
      <p className="m-0 text-sm font-semibold">
        Today <span className="font-mono">{today}</span> · average <span className="font-mono">{avg}</span> over {points.length} days
      </p>
      <LineChart points={points} unit="" digits={0} summary={`Daily consistency: today ${today}, average ${avg} over ${points.length} days`} height={140} />
    </Tile>
  );
}

function ShareTile() {
  const { shareHref } = useDashboard().data;
  return (
    <Tile title="Share card" href={shareHref}>
      <p className="m-0 text-sm text-soft">Day, streaks, targets and workouts as one card you can send.</p>
    </Tile>
  );
}
