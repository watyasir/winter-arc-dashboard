import type { NewTracker } from "./trackers";

/*
  The trackers a new account starts with. Added the first time /log opens with no trackers.
  More can be added later from /settings (Phase 7) without touching code.
*/
export const defaultTrackers: NewTracker[] = [
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
].map((t, i) => ({ ...t, sort_order: (i + 1) * 10 }) as NewTracker);
