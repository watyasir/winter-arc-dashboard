import type { ComponentType } from "react";
import { InProgressTile } from "./board/InProgressTile";
import { GoalsTile } from "./goals/GoalsTile";
import { HabitsTile } from "./habits/HabitsTile";
import { InboxPreviewTile } from "./inbox/InboxPreviewTile";
import { MoneyTile } from "./money/MoneyTile";
import { SeasonTile } from "./season/SeasonTile";
import { StatsTile } from "./stats/StatsTile";
import { TodayTile } from "./today/TodayTile";
import { WeightTile } from "./weight/WeightTile";

/*
  Every Overview tile is registered here. Adding a module = adding one entry.
  Tiles in the same row sit side by side and wrap (each tile sets its own flex width).
*/
export interface TileDef {
  id: string;
  row: number;
  Component: ComponentType;
}

export const overviewTiles: TileDef[] = [
  { id: "season", row: 1, Component: SeasonTile },
  { id: "stats", row: 2, Component: StatsTile },
  { id: "today", row: 3, Component: TodayTile },
  { id: "inbox-preview", row: 3, Component: InboxPreviewTile },
  { id: "money", row: 3, Component: MoneyTile },
  { id: "weight", row: 4, Component: WeightTile },
  { id: "goals", row: 4, Component: GoalsTile },
  { id: "habits", row: 5, Component: HabitsTile },
  { id: "in-progress", row: 5, Component: InProgressTile },
];
