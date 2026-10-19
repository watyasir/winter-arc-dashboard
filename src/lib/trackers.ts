/*
  Tracker and entry shapes, shared by /log (real data) and /demo (fake data).
  Matches supabase/migrations/20261020000001_trackers_entries_seasons.sql.
*/

export type TrackerArea = "Health" | "Body" | "Mind" | "Skills" | "Money" | "Custom";
export type TrackerType = "checkbox" | "number" | "scale_1_5" | "duration_minutes";

export interface Tracker {
  id: string;
  slug: string;
  name: string;
  area: TrackerArea;
  type: TrackerType;
  unit: string | null;
  step: number | null;
  scale_labels: string[] | null;
  target: number | null;
  target_period: "daily" | "weekly" | null;
  sort_order: number;
}

export type NewTracker = Omit<Tracker, "id" | "unit" | "step" | "scale_labels" | "target" | "target_period"> &
  Partial<Pick<Tracker, "unit" | "step" | "scale_labels" | "target" | "target_period">>;

/** Tracker id -> value for one day. */
export type CheckInValues = Record<string, number>;

export const AREA_ORDER: TrackerArea[] = ["Health", "Body", "Mind", "Skills", "Money", "Custom"];

/** Preset choices for duration trackers on the check-in (minutes). */
export const DURATION_PRESETS = [0, 30, 60, 90, 120] as const;

const TIME_ZONE = "Asia/Kolkata";

/** Today's date in India as YYYY-MM-DD (what entries.entry_date stores). */
export function todayISO(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(now);
}

/** "2026-10-20" plus -14 days -> "2026-10-06". */
export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** "2026-10-20" -> "Tuesday, 20 Oct 2026". */
export function formatDayLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12));
  const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "long", timeZone: "UTC" }).format(date);
  const rest = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(date);
  return `${weekday}, ${rest}`;
}

/** Number with up to 2 decimals and Indian grouping: 8000 -> "8,000", 2.5 -> "2.5". */
export function formatAmount(value: number): string {
  return value.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

export function formatValue(t: Tracker, value: number): string {
  switch (t.type) {
    case "checkbox":
      return value ? "Done" : "Not done";
    case "scale_1_5":
      return t.scale_labels?.[value - 1] ?? `${value} of 5`;
    case "duration_minutes":
      return value >= 60 ? `${formatAmount(value / 60)} hr` : `${value} min`;
    default:
      return t.unit ? `${formatAmount(value)} ${t.unit}` : formatAmount(value);
  }
}

/** The value the check-in starts on when nothing is logged today: the last value, else the target. */
export function startingValue(t: Tracker, lastValue: number | undefined): number {
  if (t.type === "checkbox") return 0;
  if (lastValue !== undefined) return lastValue;
  if (t.type === "scale_1_5") return 3;
  if (t.type === "duration_minutes") return 0;
  return t.target_period === "daily" && t.target != null ? t.target : 0;
}

/** Throws if a value doesn't fit its tracker. Used on the server before saving. */
export function assertValidValue(t: Pick<Tracker, "type" | "name">, value: number) {
  const ok =
    Number.isFinite(value) &&
    (t.type === "checkbox"
      ? value === 0 || value === 1
      : t.type === "scale_1_5"
        ? Number.isInteger(value) && value >= 1 && value <= 5
        : t.type === "duration_minutes"
          ? value >= 0 && value <= 24 * 60
          : value >= 0 && value < 10_000_000);
  if (!ok) throw new Error(`${t.name}: that value doesn't fit`);
}
