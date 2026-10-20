import type { ComponentType } from "react";
import { InProgressTile } from "./board/InProgressTile";
import { GoalsTile } from "./goals/GoalsTile";
import { HabitsTile } from "./habits/HabitsTile";
import { InboxPreviewTile } from "./inbox/InboxPreviewTile";
import { MoneyTile } from "./money/MoneyTile";
import { SeasonTile } from "./season/SeasonTile";
import { StatsTile } from "./stats/StatsTile";
import { DueTodayTile } from "./tasks/DueTodayTile";
import { OverdueTile } from "./tasks/OverdueTile";
import { TodayTile } from "./today/TodayTile";
import { WeightTile } from "./weight/WeightTile";
import { LiftsTile } from "./workouts/LiftsTile";
import { WorkoutsTile } from "./workouts/WorkoutsTile";

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
  { id: "due-today", row: 4, Component: DueTodayTile },
  { id: "overdue", row: 4, Component: OverdueTile },
  { id: "goals", row: 4, Component: GoalsTile },
  { id: "weight", row: 5, Component: WeightTile },
  { id: "workouts", row: 5, Component: WorkoutsTile },
  { id: "lifts", row: 6, Component: LiftsTile },
  { id: "habits", row: 6, Component: HabitsTile },
  { id: "in-progress", row: 6, Component: InProgressTile },
];
