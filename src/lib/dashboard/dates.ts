import { addDays, shortDate } from "@/lib/trackers";

export { shortDate };

/* Date helpers for YYYY-MM-DD strings (India dates, already worked out by todayISO). */

function utc(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
}

export function daysBetween(from: string, to: string): number {
  return Math.round((utc(to).getTime() - utc(from).getTime()) / 86_400_000);
}

/** Monday of the week the date is in. */
export function weekStart(iso: string): string {
  const weekday = (utc(iso).getUTCDay() + 6) % 7; // Monday = 0
  return addDays(iso, -weekday);
}

/** "2026-10-19" -> "Mon" */
export function weekdayShort(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "UTC" }).format(utc(iso));
}

/** "2026-10-20" -> "Tuesday, 20 October" */
export function headerDate(iso: string): string {
  const part = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { ...o, timeZone: "UTC" }).format(utc(iso));
  return `${part({ weekday: "long" })}, ${part({ day: "numeric", month: "long" })}`;
}

/** "Today", "Yesterday", "3 days ago", or "18 Oct" once it's over a week. */
export function relativeDay(iso: string, today: string): string {
  const days = daysBetween(iso, today);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return shortDate(iso);
}
