import { createHash } from "node:crypto";
import { weekStart } from "@/lib/dashboard/dates";
import { DAY_KEYS, parseDayPlan, phasesFor, type DayPlan } from "@/lib/day-plan";
import { ownerClient } from "@/lib/owner";
import { isShareToken } from "@/lib/share-store";
import { addDays, todayISO } from "@/lib/trackers";

/*
  /api/calendar.ics?token=<SHARE_TOKEN>: a calendar feed for Apple Calendar (subscribe with
  webcal://). The day plan's phases repeat weekly on their days; tasks with a due date are
  all-day events. Read-only; the calendar app fetches it again about every hour.
*/

const BYDAY = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];

export async function GET(request: Request) {
  if (!isShareToken(new URL(request.url).searchParams.get("token") ?? undefined)) {
    return new Response("Not found", { status: 404 });
  }
  const owner = await ownerClient();
  if (!owner) return new Response("Calendar isn't set up", { status: 503 });
  const { supabase, ownerId } = owner;

  const [plan, tasks] = await Promise.all([
    supabase.from("day_plans").select("plan").eq("user_id", ownerId).maybeSingle(),
    supabase.from("tasks").select("id, title, status, due_date, note, next_steps").eq("user_id", ownerId).not("due_date", "is", null),
  ]);
  if (plan.error || tasks.error) {
    console.error(`GET /api/calendar.ics failed: ${(plan.error ?? tasks.error)!.message}`);
    return new Response("Couldn't read the calendar. Try again.", { status: 500 });
  }

  const today = todayISO();
  const parsed = plan.data ? parseDayPlan(plan.data.plan) : null;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Yasir OS//Calendar//EN",
    "CALSCALE:GREGORIAN",
    "X-WR-CALNAME:Yasir OS",
    "X-WR-TIMEZONE:Asia/Kolkata",
    "REFRESH-INTERVAL;VALUE=DURATION:PT1H",
    "X-PUBLISHED-TTL:PT1H",
    // India has one offset all year, so the time zone is a single rule.
    "BEGIN:VTIMEZONE",
    "TZID:Asia/Kolkata",
    "BEGIN:STANDARD",
    "DTSTART:19700101T000000",
    "TZOFFSETFROM:+0530",
    "TZOFFSETTO:+0530",
    "TZNAME:IST",
    "END:STANDARD",
    "END:VTIMEZONE",
    ...(parsed?.ok ? routineEvents(parsed.plan, today) : []),
    ...tasks.data.map((t) => {
      const due = t.due_date as string;
      return event([
        `UID:task-${t.id}@yasiros`,
        `DTSTART;VALUE=DATE:${compact(due)}`,
        `DTEND;VALUE=DATE:${compact(addDays(due, 1))}`,
        `SUMMARY:${escape(`${t.status === "done" ? "✓ " : ""}${t.title}`)}`,
        ...description([t.next_steps && `Next: ${t.next_steps}`, t.note].filter(Boolean).join("\n")),
        "TRANSP:TRANSPARENT",
      ]);
    }).flat(),
    "END:VCALENDAR",
  ];

  return new Response(lines.map(fold).join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="yasiros.ics"',
      "Cache-Control": "private, no-store",
    },
  });
}

/**
 * One weekly event per phase, sharing it across the days where it's the same (same time,
 * length, title and detail). A phase after midnight moves to the next weekday.
 */
function routineEvents(plan: DayPlan, today: string): string[] {
  const groups = new Map<string, { start: number; length: number; title: string; detail: string; days: number[] }>();
  DAY_KEYS.forEach((key, i) => {
    for (const p of phasesFor(plan, key)) {
      const day = (i + Math.floor(p.start / 1440)) % 7;
      const start = p.start % 1440;
      const id = [start, p.end - p.start, p.title, p.detail].join("|");
      const group = groups.get(id) ?? { start, length: p.end - p.start, title: p.title, detail: p.detail, days: [] };
      group.days.push(day);
      groups.set(id, group);
    }
  });

  // The feed starts this Monday, so a phase's first day is in this week.
  const monday = weekStart(today);
  return [...groups.entries()].flatMap(([id, g]) => {
    const days = [...new Set(g.days)].sort((a, b) => a - b);
    const hh = String(Math.floor(g.start / 60)).padStart(2, "0");
    const mm = String(g.start % 60).padStart(2, "0");
    return event([
      `UID:plan-${createHash("sha1").update(id).digest("hex").slice(0, 16)}@yasiros`,
      `DTSTART;TZID=Asia/Kolkata:${compact(addDays(monday, days[0]))}T${hh}${mm}00`,
      `DURATION:PT${g.length}M`,
      `RRULE:FREQ=WEEKLY;BYDAY=${days.map((d) => BYDAY[d]).join(",")}`,
      `SUMMARY:${escape(g.title)}`,
      ...description(g.detail),
    ]);
  });
}

function event(body: string[]): string[] {
  return ["BEGIN:VEVENT", `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`, ...body, "END:VEVENT"];
}

const description = (text: string) => (text ? [`DESCRIPTION:${escape(text)}`] : []);
const compact = (iso: string) => iso.replaceAll("-", "");
const escape = (text: string) => text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** Calendar lines are at most 75 bytes; longer ones continue on the next line after a space. */
function fold(line: string): string {
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
