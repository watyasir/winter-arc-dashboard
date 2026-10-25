"use client";

import { SeasonTile } from "@/modules/season/SeasonTile";
import { ArcStreaksTile, ArcTargetsTile, ArcWeeksTile } from "./ArcTiles";

/** The Winter Arc page (v6.1): dark teal hero with the 90-day strip, targets this week, streaks, week by week. */
export function WinterArcView() {
  return (
    <div className="flex flex-col gap-4">
      <SeasonTile />
      <div className="flex flex-wrap items-stretch gap-2.5">
        <ArcTargetsTile />
        <ArcStreaksTile />
      </div>
      <ArcWeeksTile />
    </div>
  );
}
