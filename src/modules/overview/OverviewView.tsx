"use client";

import { HeroTile } from "./HeroTile";
import { CheckInTile, TodayTile } from "./DayTiles";
import { ClaudeTile, FundTile, MealsTile, StudyTile } from "./LifeTiles";
import { MoneyTile } from "./MoneyTile";
import { NextUpTile } from "./NextUpTile";
import { WeightTile } from "./WeightTile";

/** Overview: the colour-blocked bento (globals.css `bento`), tiles in priority order. Each heading opens its full page. */
export function OverviewView() {
  return (
    <div className="bento">
      <HeroTile />
      <CheckInTile />
      <TodayTile />
      <NextUpTile />
      <MoneyTile />
      <WeightTile />
      <FundTile />
      <MealsTile />
      <StudyTile />
      <ClaudeTile />
    </div>
  );
}
