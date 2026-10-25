import type { ComponentType } from "react";
import { InProgressTile } from "./board/InProgressTile";
import { BodyTile } from "./body/BodyTile";
import { GoalsTile } from "./goals/GoalsTile";
import { HabitsTile } from "./habits/HabitsTile";
import { MoneyTile } from "./money/MoneyTile";
import { TasksTile } from "./tasks/TasksTile";
import { TodayTile } from "./today/TodayTile";
import { WorkoutsTile } from "./workouts/WorkoutsTile";

/*
  Every Overview tile is registered here. Adding a module = adding one entry.
  Tiles in the same row sit side by side and wrap (each tile sets its own flex width).
  v6.1: the Overview is the whole life; Winter Arc has its own page (src/modules/arc).
  Not on the Overview now, code kept: season, stats, weight chart, lifts (and the parked Inbox preview).
*/
export interface TileDef {
  id: string;
  row: number;
  Component: ComponentType;
}

export const overviewTiles: TileDef[] = [
  { id: "today", row: 1, Component: TodayTile },
  { id: "tasks", row: 1, Component: TasksTile },
  { id: "money", row: 1, Component: MoneyTile },
  { id: "body", row: 2, Component: BodyTile },
  { id: "workouts", row: 2, Component: WorkoutsTile },
  { id: "goals", row: 2, Component: GoalsTile },
  { id: "habits", row: 3, Component: HabitsTile },
  { id: "in-progress", row: 3, Component: InProgressTile },
];
