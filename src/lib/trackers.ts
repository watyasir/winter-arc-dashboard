/*
  Tracker and entry shapes, shared by /log (real data) and /demo (fake data).
  Matches supabase/migrations/20261020000001_trackers_entries_seasons.sql.
*/

export type TrackerArea = "Health" | "Body" | "Mind" | "Skills" | "Money" | "Custom";
export type TrackerType = "checkbox" | "number" | "scale_1_5" | "duration_minutes" | "time_of_day" | "choice";

export interface Tracker {
  id: string;
  slug: string;
  name: string;
  area: TrackerArea;
  type: TrackerType;
  unit: string | null;
  step: number | null;
  /** Words for a 1-5 scale, or the options of a choice tracker (2 to 5, the first is the default). */
  scale_labels: string[] | null;
  target: number | null;
  target_period: "daily" | "weekly" | null;
  sort_order: number;
  /** Trackers with the same group share one card on the check-in and one row on Today (Meals, Blood pressure). */
  group_name: string | null;
}

export type NewTracker = Omit<Tracker, "id" | "unit" | "step" | "scale_labels" | "target" | "target_period" | "group_name"> &
  Partial<Pick<Tracker, "unit" | "step" | "scale_labels" | "target" | "target_period" | "group_name">>;

/** Tracker id -> value for one day. No value = not logged, so it isn't saved. */
export type CheckInValues = Record<string, number | undefined>;

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

// Written out because some browsers say "Sept"; the app always uses three letters.
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-09-26" -> "26 Sep" */
export function shortDate(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]}`;
}

/** "2026-10-20" -> "Tuesday, 20 Oct 2026". */
export function formatDayLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12));
  const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "long", timeZone: "UTC" }).format(date);
  return `${weekday}, ${shortDate(iso)} ${y}`;
}

/** Number with up to 2 decimals and Indian grouping: 8000 -> "8,000", 2.5 -> "2.5". */
export function formatAmount(value: number): string {
  return value.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

/** Minutes after midnight -> "12:30 AM". */
export function clockLabel(minutes: number): string {
  const m = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  return `${h % 12 || 12}:${String(m % 60).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

export function formatValue(t: Pick<Tracker, "type" | "unit" | "scale_labels">, value: number): string {
  switch (t.type) {
    case "checkbox":
      return value ? "Done" : "Not done";
    case "time_of_day":
      return clockLabel(value);
    case "choice":
      return t.scale_labels?.[value - 1] ?? `Option ${value}`;
    case "scale_1_5":
      return t.scale_labels?.[value - 1] ?? `${value} of 5`;
    case "duration_minutes":
      return value >= 60 ? `${formatAmount(value / 60)} hr` : `${value} min`;
    default:
      return t.unit ? `${formatAmount(value)} ${t.unit}` : formatAmount(value);
  }
}

/** Yes/no, number and minute trackers add up over days, so goals can count them. */
export function canSum(t: Pick<Tracker, "type">): boolean {
  return t.type === "checkbox" || t.type === "number" || t.type === "duration_minutes";
}

/**
 * The value the check-in starts on when nothing is logged today: the last value, else the target.
 * A choice starts on its first option (meals: "Planned"). A typed-in number without a daily
 * target (blood pressure, reading page) starts blank, so an old reading is never saved as today's.
 */
export function startingValue(t: Tracker, lastValue: number | undefined): number | undefined {
  if (t.type === "checkbox") return 0;
  if (t.type === "choice") return 1;
  if (t.type === "number" && !t.step && !(t.target_period === "daily" && t.target != null)) return undefined;
  if (lastValue !== undefined) return lastValue;
  if (t.type === "scale_1_5") return 3;
  if (t.type === "duration_minutes") return 0;
  if (t.type === "time_of_day") return undefined;
  return t.target_period === "daily" && t.target != null ? t.target : 0;
}

/** Throws if a value doesn't fit its tracker. Used on the server before saving. */
export function assertValidValue(t: Pick<Tracker, "type" | "name">, value: number) {
  const ok =
    Number.isFinite(value) &&
    (t.type === "checkbox"
      ? value === 0 || value === 1
      : t.type === "scale_1_5" || t.type === "choice"
        ? Number.isInteger(value) && value >= 1 && value <= 5
        : t.type === "time_of_day"
        ? Number.isInteger(value) && value >= 0 && value < 24 * 60
        : t.type === "duration_minutes"
          ? value >= 0 && value <= 24 * 60
          : value >= 0 && value < 10_000_000);
  if (!ok) throw new Error(`${t.name}: that value doesn't fit`);
}
