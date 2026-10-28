import { createHash } from "node:crypto";
import { weekStart } from "@/lib/dashboard/dates";
import { dayKeyOf, DAY_KEYS, phasesFor, type DayPlan } from "@/lib/day-plan";
import { addDays } from "@/lib/trackers";

/* Building blocks of /api/calendar.ics: the plan's repeating events and iCalendar text helpers. */

const BYDAY = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];

/**
 * Weekly repeating events, one per phase, shared across the days where it's the same (same
 * time, length, title, detail). Dated phases (from/until) split the weeks into ranges: inside
 * each range the plan is the same every week, and each event repeats only until its range ends,
 * so a dated phase never doubles up with the one it replaces. A phase after midnight moves to
 * the next weekday. `cat` keeps one calendar's phases only.
 */
export function routineEvents(plan: DayPlan, today: string, cat?: string): string[] {
  // The feed starts this Monday, so a phase's first day is in this week.
  const monday = weekStart(today);
  const cuts = new Set<string>();
  for (const p of plan.phases) {
    if (p.from && p.from > monday) cuts.add(p.from);
    if (p.until && addDays(p.until, 1) > monday) cuts.add(addDays(p.until, 1));
  }
  const starts = [monday, ...[...cuts].sort()];

  type Group = { start: number; length: number; title: string; detail: string; days: Set<number>; from: string; until: string | null };
  const events: Group[] = [];
  const open = new Map<string, Group>();
  starts.forEach((rangeStart, r) => {
    const rangeEnd = starts[r + 1] ?? null; // exclusive
    const seen = new Map<string, Group>();
    for (let i = 0; i < 7; i++) {
      const date = addDays(rangeStart, i);
      if (rangeEnd && date >= rangeEnd) break;
      for (const p of phasesFor(plan, date)) {
        if (cat && p.cal !== cat) continue;
        const day = (DAY_KEYS.indexOf(dayKeyOf(date)) + Math.floor(p.start / 1440)) % 7;
        const id = [p.start % 1440, p.end - p.start, p.title, p.detail].join("|");
        const g = seen.get(id) ?? { start: p.start % 1440, length: p.end - p.start, title: p.title, detail: p.detail, days: new Set<number>(), from: rangeStart, until: rangeEnd };
        g.days.add(day);
        seen.set(id, g);
      }
    }
    // The same event with the same days in the next range just runs on.
    for (const [id, g] of seen) {
      const key = `${id}|${[...g.days].sort().join(",")}`;
      const prev = open.get(key);
      if (prev && prev.until === rangeStart) prev.until = rangeEnd;
      else {
        events.push(g);
        open.set(key, g);
      }
    }
  });

  return events.flatMap((g) => {
    const days = [...g.days].sort((a, b) => a - b);
    // First matching weekday on or after the range start.
    let first = g.from;
    while (!days.includes(DAY_KEYS.indexOf(dayKeyOf(first)))) first = addDays(first, 1);
    const hh = String(Math.floor(g.start / 60)).padStart(2, "0");
    const mm = String(g.start % 60).padStart(2, "0");
    // UNTIL is in UTC: the range's last day at 23:59:59 India time.
    const until = g.until ? `;UNTIL=${compact(addDays(g.until, -1))}T182959Z` : "";
    const id = [g.start, g.length, g.title, g.detail, days.join(","), g.from].join("|");
    return event([
      `UID:plan-${createHash("sha1").update(id).digest("hex").slice(0, 16)}@yasiros`,
      `DTSTART;TZID=Asia/Kolkata:${compact(first)}T${hh}${mm}00`,
      `DURATION:PT${g.length}M`,
      `RRULE:FREQ=WEEKLY;BYDAY=${days.map((d) => BYDAY[d]).join(",")}${until}`,
      `SUMMARY:${escape(g.title)}`,
      ...description(g.detail),
    ]);
  });
}

export function event(body: string[]): string[] {
  return ["BEGIN:VEVENT", `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`, ...body, "END:VEVENT"];
}

export const description = (text: string) => (text ? [`DESCRIPTION:${escape(text)}`] : []);
export const compact = (iso: string) => iso.replaceAll("-", "");
export const escape = (text: string) => text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** Calendar lines are at most 75 bytes; longer ones continue on the next line after a space. */
export function fold(line: string): string {
  const out: string[] = [];
  let current = "";
  let bytes = 0;
  for (const ch of line) {
    const size = Buffer.byteLength(ch);
    if (bytes + size > (out.length ? 74 : 75)) {
      out.push(current);
      current = "";
      bytes = 0;
    }
    current += ch;
    bytes += size;
  }
  out.push(current);
  return out.join("\r\n ");
}
