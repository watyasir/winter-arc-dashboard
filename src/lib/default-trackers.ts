import type { NewTracker } from "./trackers";

/*
  The trackers a new account starts with. Added the first time /log opens with no trackers.
  More can be added later from /settings (Phase 7) without touching code.
*/
const base: Omit<NewTracker, "sort_order">[] = [
  { slug: "sleep", name: "Sleep", area: "Health", type: "number", unit: "hr", step: 0.5, target: 7, target_period: "daily" },
  { slug: "water", name: "Water", area: "Health", type: "number", unit: "L", step: 0.5, target: 3, target_period: "daily" },
  { slug: "workout", name: "Workout done", area: "Body", type: "checkbox", target: 5, target_period: "weekly" },
  { slug: "steps", name: "Steps", area: "Body", type: "number", unit: "steps", target: 8000, target_period: "daily" },
  { slug: "skincare", name: "Skincare", area: "Body", type: "checkbox", target: 1, target_period: "daily" },
  { slug: "hair", name: "Hair routine", area: "Body", type: "checkbox", target: 1, target_period: "daily" },
  { slug: "study", name: "Study", area: "Mind", type: "duration_minutes", unit: "min", target: 90, target_period: "daily" },
  {
    slug: "mood",
    name: "Mood",
    area: "Mind",
    type: "scale_1_5",
    scale_labels: ["Rough", "Low", "Okay", "Good", "Great"],
  },
];

const MEAL_OPTIONS = ["Planned", "Swapped", "Skipped"];

/*
  What the day plan says to log (M4). Each sits right after the tracker it belongs with.
  Lights out and wake are minutes after midnight; meals are 1 = planned, 2 = swapped, 3 = skipped.
  Same rows as supabase/migrations/20261030000001_day_plan_log.sql, which adds them to an existing account.
*/
const dayPlan: NewTracker[] = [
  { slug: "lights-out", name: "Lights out", area: "Health", type: "time_of_day", sort_order: 11 },
  { slug: "wake", name: "Woke up", area: "Health", type: "time_of_day", sort_order: 12 },
  ...["Pre-gym", "Breakfast", "Lunch", "Snack 1", "Dinner", "Snack 2", "Night"].map(
    (name, i): NewTracker => ({
      slug: `meal-${i + 1}`,
      name,
      area: "Health",
      type: "choice",
      scale_labels: MEAL_OPTIONS,
      group_name: "Meals",
      sort_order: 21 + i,
    }),
  ),
  ...[
    ["bp-am-sys", "Morning systolic"],
    ["bp-am-dia", "Morning diastolic"],
    ["bp-pm-sys", "Evening systolic"],
    ["bp-pm-dia", "Evening diastolic"],
  ].map(
    ([slug, name], i): NewTracker => ({ slug, name, area: "Health", type: "number", unit: "mmHg", group_name: "Blood pressure", sort_order: 31 + i }),
  ),
  { slug: "reading-page", name: "Reading page", area: "Mind", type: "number", unit: "page", sort_order: 75 },
];

export const defaultTrackers: NewTracker[] = [...base.map((t, i) => ({ ...t, sort_order: (i + 1) * 10 }) as NewTracker), ...dayPlan].sort(
  (a, b) => a.sort_order - b.sort_order,
);
