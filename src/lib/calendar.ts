/*
  The 9 calendar feeds (/api/calendar.ics?token=…&cat=<key>). Each is its own subscribed
  calendar with its own colour, picked to read well in dark mode on iPhone and Mac.
  These colours belong to Apple Calendar, not the app's v6 palette: the app only shows them
  as the small dots next to each feed in /settings.
*/
export const CALENDARS = [
  { key: "sleep", name: "Sleep", color: "#7C8CE8" },
  { key: "shift", name: "Shift", color: "#2BB3A8" },
  { key: "breaks", name: "Breaks", color: "#F5C842" },
  { key: "meals", name: "Meals", color: "#FF9F45" },
  { key: "gym", name: "Gym & walk", color: "#4CD07D" },
  { key: "care", name: "Self-care", color: "#FF7EB6" },
  { key: "build", name: "Build & study", color: "#A78BFA" },
  { key: "commute", name: "Commute", color: "#A1A1AA" },
  { key: "tasks", name: "Tasks due", color: "#FF5C5C" },
] as const;

export type CalKey = (typeof CALENDARS)[number]["key"];
export const CAL_KEYS: readonly CalKey[] = CALENDARS.map((c) => c.key);
