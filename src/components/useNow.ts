"use client";

import { useSyncExternalStore } from "react";

/*
  The current time, read in the browser only: pages are pre-rendered without a clock, so
  anything time-based fills in once the page is open. null until then. `step` is how often it
  moves on (1 s for the header clock, a minute for "2h ago").
*/
type Subscribe = (onChange: () => void) => () => void;
// One subscribe function per step, so React keeps the same subscription between renders.
const subscribers = new Map<number, Subscribe>();
const subscribe = (step: number): Subscribe => {
  let sub = subscribers.get(step);
  if (!sub) {
    sub = (onChange) => {
      const id = setInterval(onChange, Math.min(step, 1000));
      return () => clearInterval(id);
    };
    subscribers.set(step, sub);
  }
  return sub;
};

export function useNow(step = 60_000): number | null {
  return useSyncExternalStore(subscribe(step), () => Math.floor(Date.now() / step) * step, () => null);
}

/** "just now", "12 min ago", "2h ago", "3 days ago"; "in 2h" for the future. */
export function timeAgo(iso: string | null, now: number): string {
  if (!iso) return "never";
  const mins = Math.round((now - Date.parse(iso)) / 60_000);
  const future = mins < 0;
  const m = Math.abs(mins);
  const text = m < 1 ? "just now" : m < 60 ? `${m} min` : m < 48 * 60 ? `${Math.round(m / 60)}h` : `${Math.round(m / 1440)} days`;
  if (text === "just now") return text;
  return future ? `in ${text}` : `${text} ago`;
}

/** Hours and minutes in India for a time: { minutes: 0-1439, iso: "2026-10-30" }. */
export function istParts(now: number) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date(now));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return { minutes: Number(get("hour")) * 60 + Number(get("minute")), iso: `${get("year")}-${get("month")}-${get("day")}` };
}
