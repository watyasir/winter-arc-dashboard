import { defaultTrackers } from "@/lib/default-trackers";
import type { CheckInValues, Tracker } from "@/lib/trackers";

/** The default trackers with made-up ids and values, for /demo/log. */
export const demoTrackers: Tracker[] = defaultTrackers.map((t) => ({
  unit: null,
  step: null,
  scale_labels: null,
  target: null,
  target_period: null,
  ...t,
  id: `demo-${t.slug}`,
}));

const sample: Record<string, number> = {
  sleep: 7,
  water: 2,
  workout: 1,
  steps: 6400,
  skincare: 1,
  hair: 0,
  study: 90,
  mood: 4,
};

export const demoCheckInValues: CheckInValues = Object.fromEntries(demoTrackers.map((t) => [t.id, sample[t.slug] ?? 0]));
