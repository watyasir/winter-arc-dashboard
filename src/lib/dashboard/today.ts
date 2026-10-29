import { formatAmount, formatValue, type Tracker } from "@/lib/trackers";
import type { TodayItem } from "@/modules/types";

/*
  Today's trackers as a list (Health page): yes/no rows toggle, the rest open the check-in.
  Pure, like build.ts.
*/

/** A tracker's daily target, or null when it has none. */
export function dailyTarget(t: Tracker): number | null {
  if (t.target_period !== "daily" || t.target == null) return null;
  return Number(t.target);
}

/** One Today row per tracker, except a group (Meals, Blood pressure), which gets one row for all of it. Plus how many rows have a value. */
export function todayRows(
  trackers: Tracker[],
  valueOf: (t: Tracker) => number | undefined,
  hit: (t: Tracker) => boolean,
): { rows: TodayItem[]; logged: number } {
  const rows: TodayItem[] = [];
  let loggedRows = 0;
  const seen = new Set<string>();
  for (const t of trackers) {
    if (!t.group_name) {
      rows.push(todayItem(t, valueOf(t), hit(t)));
      if (valueOf(t) !== undefined) loggedRows++;
      continue;
    }
    if (seen.has(t.group_name)) continue;
    seen.add(t.group_name);
    const members = trackers.filter((m) => m.group_name === t.group_name);
    const logged = members.filter((m) => valueOf(m) !== undefined);
    // Choices count their first option ("6 of 7 planned"); anything else counts what's logged.
    const first = members.every((m) => m.type === "choice") ? members[0].scale_labels?.[0] : undefined;
    const note =
      logged.length === 0
        ? "Not logged"
        : first
          ? `${logged.filter((m) => valueOf(m) === 1).length} of ${members.length} ${first.toLowerCase()}`
          : `${logged.length} of ${members.length} logged`;
    rows.push({ label: t.group_name, area: note, done: logged.length === members.length, href: "/log" });
    if (logged.length > 0) loggedRows++;
  }
  return { rows, logged: loggedRows };
}

function todayItem(t: Tracker, value: number | undefined, hit: boolean): TodayItem {
  if (t.type === "checkbox") return { label: t.name, area: t.area, done: value !== undefined && hit, trackerId: t.id };
  const target = dailyTarget(t);
  let note = "Not logged";
  if (value !== undefined) {
    note = formatValue(t, value);
    if (target != null && t.type === "number") note = `${formatAmount(value)} of ${formatAmount(target)}${t.unit ? ` ${t.unit}` : ""}`;
    if (target != null && t.type === "duration_minutes") note = `${formatValue(t, value)} of ${formatValue(t, target)}`;
  }
  return { label: t.name, area: note, done: value !== undefined && hit, href: "/log" };
}
