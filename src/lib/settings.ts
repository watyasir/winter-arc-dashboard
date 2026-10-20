import { AREA_ORDER, type TrackerArea, type TrackerType } from "./trackers";

/* Shapes and checks for /settings: the season and new trackers. */

export const SEASON_NAME = "Winter Arc";
export const SEASON_DAYS = 90;

export interface SeasonInput {
  /** YYYY-MM-DD, day 1. */
  start: string;
  /** { "<tracker slug>": <daily target> } for the trackers that count. */
  targets: Record<string, number>;
}

export interface TrackerInput {
  name: string;
  area: TrackerArea;
  type: TrackerType;
  unit: string;
  target: number | null;
  period: "daily" | "weekly";
}

export const TRACKER_TYPES: { value: TrackerType; label: string }[] = [
  { value: "checkbox", label: "Yes / no" },
  { value: "number", label: "Number" },
  { value: "duration_minutes", label: "Minutes" },
  { value: "scale_1_5", label: "1 to 5" },
];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function seasonProblem(s: SeasonInput): string | null {
  if (!ISO_DATE.test(s.start)) return "Pick a start date.";
  const values = Object.values(s.targets);
  if (values.length === 0) return "Switch on at least one tracker to count.";
  if (values.some((v) => !(v > 0) || v >= 1e9)) return "Each target needs a number above 0.";
  return null;
}

export function trackerProblem(t: TrackerInput): string | null {
  if (!t.name.trim()) return "Give the tracker a name.";
  if (t.name.trim().length > 40) return "Keep the name under 40 characters.";
  if (!AREA_ORDER.includes(t.area)) return "Pick an area.";
  if (!TRACKER_TYPES.some((x) => x.value === t.type)) return "Pick a type.";
  if (t.unit.trim().length > 12) return "Keep the unit short, like km or pages.";
  if (t.target != null && !(t.target > 0 && t.target < 1e9)) return "Set the target above 0, or leave it empty.";
  if (t.type === "scale_1_5" && t.target != null && t.target > 5) return "A 1 to 5 target can't be above 5.";
  return null;
}

/** "Read 20 pages!" -> "read-20-pages" */
export function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "tracker"
  );
}
