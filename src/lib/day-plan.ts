/*
  The day plan behind the calendar feeds. It's data, sent by Claude
  through POST /api/day-plan and kept in the day_plans table (never in this public repo).

  A plan is a list of phases. Each phase starts at a time and lasts until the next one
  starts. Times past midnight are written as 24:30 and belong to the day before, so a
  day runs from waking up to lights out. `days` limits a phase to some weekdays;
  `byDay` swaps in that day's detail (gym A or B, which face acid, which breakfast).
  `from` / `until` (YYYY-MM-DD) limit a phase to some dates (exam weeks); on those dates it
  replaces any undated phase that starts at the same time. `cal` picks its calendar feed
  (src/lib/calendar.ts); without it the feed is worked out from kind and title.
  Sections hold the rest: meals, gym, prep, stock list. Matches …_my_day_gate_jobs.sql.
*/

import { CAL_KEYS, type CalKey } from "./calendar";

export const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type DayKey = (typeof DAY_KEYS)[number];

const PHASE_KINDS = ["sleep", "care", "food", "move", "work", "mind"] as const;
type PhaseKind = (typeof PHASE_KINDS)[number];

interface PlanPhase {
  /** "07:30"; up to "29:59" for after midnight. */
  start: string;
  title: string;
  kind: PhaseKind;
  detail?: string;
  /** Omitted = every day. */
  days?: DayKey[];
  byDay?: Partial<Record<DayKey, string>>;
  /** Calendar feed; omitted = worked out from kind and title. */
  cal?: CalKey;
  /** First and last date (YYYY-MM-DD) this phase runs; omitted = always. */
  from?: string;
  until?: string;
}

interface PlanSection {
  title: string;
  items: { label: string; text: string }[];
}

export interface DayPlan {
  phases: PlanPhase[];
  sections: PlanSection[];
}

/** One phase as it happens on a given day, in minutes from that day's midnight. */
export interface DayPhase {
  start: number;
  end: number;
  title: string;
  kind: PhaseKind;
  detail: string;
  cal: CalKey;
}

const TIME = /^([01]\d|2[0-9]):([0-5]\d)$/;
const minutesOf = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));

/** "07:30" -> "7:30 AM", "24:30" -> "12:30 AM". */
export function clockLabel(minutes: number): string {
  const m = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  return `${h % 12 || 12}:${String(m % 60).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

/** Monday = "mon" for a YYYY-MM-DD date. */
export function dayKeyOf(iso: string): DayKey {
  const [y, m, d] = iso.split("-").map(Number);
  return DAY_KEYS[(new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7];
}

const nextDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
};

/**
 * The plan's phases on one date, in order. A dated phase (from/until) that runs that day
 * replaces undated phases with the same start time. The last one (lights out) runs until
 * the next day's first phase.
 */
export function phasesFor(plan: DayPlan, date: string): DayPhase[] {
  const pick = (iso: string) => {
    const key = dayKeyOf(iso);
    const live = plan.phases.filter(
      (p) => (!p.days || p.days.includes(key)) && (!p.from || p.from <= iso) && (!p.until || iso <= p.until),
    );
    const datedStarts = new Set(live.filter((p) => p.from || p.until).map((p) => p.start));
    return live
      .filter((p) => p.from || p.until || !datedStarts.has(p.start))
      .sort((a, b) => minutesOf(a.start) - minutesOf(b.start));
  };
  const list = pick(date);
  const wakeTomorrow = pick(nextDate(date))[0];
  const key = dayKeyOf(date);
  return list.map((p, i) => ({
    start: minutesOf(p.start),
    end: list[i + 1] ? minutesOf(list[i + 1].start) : 1440 + (wakeTomorrow ? minutesOf(wakeTomorrow.start) : minutesOf(list[0].start)),
    title: p.title,
    kind: p.kind,
    detail: p.byDay?.[key] ?? p.detail ?? "",
    cal: p.cal ?? calFallback(p),
  }));
}

/** The calendar feed for a phase without `cal`: rules fitted to the live plan (DESIGN.md M11). */
function calFallback(p: PlanPhase): CalKey {
  if (p.kind === "sleep") return "sleep";
  // "Break · 15 min", not "Breakfast".
  if (/^break\b/i.test(p.title)) return "breaks";
  if (/\bride\b/i.test(p.title)) return "commute";
  const byKind: Record<Exclude<PhaseKind, "sleep">, CalKey> = { work: "shift", food: "meals", move: "gym", mind: "build", care: "care" };
  return byKind[p.kind];
}

/** Minutes since midnight in India. */
export function istMinutes(date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Asia/Kolkata" }).formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return get("hour") * 60 + get("minute");
}

// ---------------------------------------------------------------- checking POST /api/day-plan

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const isDate = (v: unknown): v is string => typeof v === "string" && DATE.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`));

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const text = (v: unknown, max: number) => typeof v === "string" && v.trim().length > 0 && v.trim().length <= max;

/** Checks a plan sent to the API. Errors name the field and its list position. */
export function parseDayPlan(body: unknown): { ok: true; plan: DayPlan } | { ok: false; error: string } {
  const fail = (error: string) => ({ ok: false as const, error });
  const raw = isObject(body) && isObject(body.plan) ? body.plan : body;
  if (!isObject(raw) || !Array.isArray(raw.phases)) return fail('Send { "phases": [...], "sections": [...] }.');
  if (raw.phases.length < 1 || raw.phases.length > 120) return fail("phases: send 1 to 120 phases.");

  const phases: PlanPhase[] = [];
  for (const [i, p] of raw.phases.entries()) {
    const at = `phases[${i}].`;
    if (!isObject(p)) return fail(`phases[${i}]: send an object.`);
    if (typeof p.start !== "string" || !TIME.test(p.start)) return fail(`${at}start: "HH:MM", 00:00 to 29:59 (past midnight = 24:30).`);
    if (!text(p.title, 80)) return fail(`${at}title: text, 1 to 80 characters.`);
    if (!PHASE_KINDS.includes(p.kind as PhaseKind)) return fail(`${at}kind: one of ${PHASE_KINDS.join(", ")}.`);
    if (p.detail !== undefined && p.detail !== null && (typeof p.detail !== "string" || p.detail.length > 400)) return fail(`${at}detail: text, up to 400 characters.`);
    if (p.days !== undefined && (!Array.isArray(p.days) || !p.days.length || p.days.some((d) => !DAY_KEYS.includes(d)))) {
      return fail(`${at}days: a list of ${DAY_KEYS.join(", ")}.`);
    }
    if (p.byDay !== undefined && (!isObject(p.byDay) || Object.entries(p.byDay).some(([k, v]) => !DAY_KEYS.includes(k as DayKey) || !text(v, 400)))) {
      return fail(`${at}byDay: { "mon": "text", ... }, up to 400 characters each.`);
    }
    if (p.cal !== undefined && !CAL_KEYS.includes(p.cal as CalKey)) return fail(`${at}cal: one of ${CAL_KEYS.join(", ")}.`);
    if (p.from !== undefined && !isDate(p.from)) return fail(`${at}from: a date, "YYYY-MM-DD".`);
    if (p.until !== undefined && !isDate(p.until)) return fail(`${at}until: a date, "YYYY-MM-DD".`);
    if (isDate(p.from) && isDate(p.until) && p.from > p.until) return fail(`${at}until: on or after from.`);
    phases.push({
      start: p.start,
      title: (p.title as string).trim(),
      kind: p.kind as PhaseKind,
      ...(typeof p.detail === "string" && p.detail.trim() ? { detail: p.detail.trim() } : {}),
      ...(p.days ? { days: p.days as DayKey[] } : {}),
      ...(p.byDay ? { byDay: p.byDay as PlanPhase["byDay"] } : {}),
      ...(p.cal ? { cal: p.cal as CalKey } : {}),
      ...(p.from ? { from: p.from as string } : {}),
      ...(p.until ? { until: p.until as string } : {}),
    });
  }

  const sections: PlanSection[] = [];
  const rawSections = raw.sections ?? [];
  if (!Array.isArray(rawSections) || rawSections.length > 12) return fail("sections: a list, up to 12.");
  for (const [i, s] of rawSections.entries()) {
    const at = `sections[${i}].`;
    if (!isObject(s) || !text(s.title, 60)) return fail(`${at}title: text, 1 to 60 characters.`);
    if (!Array.isArray(s.items) || s.items.length > 30) return fail(`${at}items: a list, up to 30.`);
    const items = [];
    for (const [j, it] of s.items.entries()) {
      if (!isObject(it) || !text(it.label, 60) || !text(it.text, 600)) return fail(`${at}items[${j}]: { "label": up to 60, "text": up to 600 characters }.`);
      items.push({ label: (it.label as string).trim(), text: (it.text as string).trim() });
    }
    sections.push({ title: (s.title as string).trim(), items });
  }
  return { ok: true, plan: { phases, sections } };
}
