"use client";

import { HeroTile } from "./HeroTile";
import { CheckInTile, PlanTile } from "./DayTiles";
import { ClaudeTile, DietTile, FundTile, StudyTile } from "./LifeTiles";
import { MoneyGlance } from "./MoneyGlance";
import { NextUpTile } from "./NextUpTile";
import { WeightTile } from "./WeightTile";

/** Overview: the bento of glances (globals.css `bento`). Each tile's heading opens its full page. */
export function OverviewView() {
  return (
    <div className="bento">
      <HeroTile />
      <NextUpTile />
      <MoneyGlance />
      <CheckInTile />
      <PlanTile />
      <WeightTile />
      <FundTile />
      <DietTile />
      <StudyTile />
      <ClaudeTile />
    </div>
  );
}
