"use client";

import Link from "next/link";
import { useEffect } from "react";
import { EmptyNote } from "@/components/EmptyNote";
import { Tile } from "@/components/Tile";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { useToast } from "@/components/Toast";
import { useConfetti } from "@/components/useConfetti";
import { scoreMessage } from "@/lib/score";
import { useLiveScore, useLiveWater } from "./live";

const CELEBRATED = "yasiros-day-logged";

/**
 * Check-in: water cups bound to the Water tracker (6 cups of 0.5 L = the 3 L target). Tap cup N
 * to set N cups; tap the last full cup to take one away. Each tap saves. "Finish check-in" opens
 * /log, and reads "✓ Logged today" once anything is saved today. The first save of the day
 * (here or in /log) gets a big confetti burst and a toast, once per day on this device.
 */
export function CheckInTile() {
  const { data, checkedIn, setEntry } = useDashboard();
  const water = useLiveWater();
  const toast = useToast();
  const confetti = useConfetti();
  const hero = data.hero;
  const day = hero && hero.day >= 1 ? hero.day : null;
  const streak = hero ? hero.streak + (hero.days[hero.todayIndex] === "today" ? 1 : 0) : 0;

  useEffect(() => {
    if (!checkedIn || data.basePath === "/demo") return;
    try {
      if (localStorage.getItem(CELEBRATED) === data.todayISO) return;
      localStorage.setItem(CELEBRATED, data.todayISO);
    } catch {
      return;
    }
    confetti({ count: 120 });
    toast({ text: day ? `Day ${day} logged. Streak ${streak}.` : "Today logged." });
  }, [checkedIn, data.basePath, data.todayISO, day, streak, confetti, toast]);

  const cups = water ? Math.round(water.target / water.step) : 0;
  const filled = water ? Math.round(water.litres / water.step) : 0;
  const tap = (n: number) => {
    if (!water) return;
    const next = n === filled ? n - 1 : n;
    setEntry("water", water.trackerId, next === 0 ? null : next * water.step, "water");
  };
  const litres = (n: number) => (n * (water?.step ?? 0.5)).toLocaleString("en-IN", { maximumFractionDigits: 1 });

  return (
    <Tile
      title="Check-in"
      tone="check"
      area="check"
      tilt
      className="gap-1.5 sm:p-3!"
      aside={water && <span className="label">{litres(filled)} / {litres(cups)} L</span>}
    >
      {water ? (
        <ul aria-label="Water" className="m-0 grid list-none grid-cols-6 p-0 max-[560px]:grid-cols-3">
          {Array.from({ length: cups }, (_, i) => {
            const n = i + 1;
            const full = n <= filled;
            return (
              <li key={n}>
                <button
                  type="button"
                  onClick={() => tap(n)}
                  aria-pressed={full}
                  aria-label={n === filled ? `Water: ${litres(n)} litres. Tap to take one cup away` : `Set water to ${litres(n)} litres`}
                  className="press grid h-11 w-full cursor-pointer place-items-center rounded-full border-0 bg-transparent p-0"
                >
                  <Cup full={full} />
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyNote>Add a Water tracker to fill cups here.</EmptyNote>
      )}
      <Link
        href={data.logHref}
        prefetch
        className="press mt-auto flex min-h-11 items-center justify-center rounded-full bg-ink px-3 text-sm font-bold text-white no-underline"
      >
        {checkedIn ? "✓ Logged today" : "Finish check-in"}
      </Link>
    </Tile>
  );
}

function Cup({ full }: { full: boolean }) {
  return (
    <svg viewBox="0 0 24 28" aria-hidden="true" className="h-7 w-6">
      <path d="M3 2h18l-2.2 22.4a2 2 0 0 1-2 1.6H7.2a2 2 0 0 1-2-1.6Z" className={`stroke-ink ${full ? "fill-ink" : "fill-white/50"}`} strokeWidth={2} strokeLinejoin="round" />
      {full && <path d="M6.5 9h11" className="stroke-white/60" strokeWidth={1.5} strokeLinecap="round" />}
    </svg>
  );
}

/**
 * Today's score: a ring (the stroke draws in) with the % in the middle and a word for it, from
 * saved data only (src/lib/score.ts). Under it the shift from the day plan and what's on now.
 */
export function TodayTile() {
  const { plan } = useDashboard().data;
  const score = useLiveScore();
  const r = 26;
  const length = 2 * Math.PI * r;
  return (
    <Tile title="Today" tone="today" area="today" tilt className="gap-2 sm:p-4!">
      <div className="flex min-h-0 flex-1 items-center gap-3 max-[560px]:flex-col max-[560px]:items-start max-[560px]:gap-2">
        <div className="relative size-[72px] shrink-0">
          <svg viewBox="0 0 64 64" className="size-full -rotate-90" role="img" aria-label={`Today's score ${score} out of 100: ${scoreMessage(score)}`}>
            <circle cx="32" cy="32" r={r} fill="none" strokeWidth={7} className="stroke-white/70" />
            <circle
              cx="32"
              cy="32"
              r={r}
              fill="none"
              strokeWidth={7}
              strokeLinecap="round"
              strokeDasharray={length}
              strokeDashoffset={length * (1 - score / 100)}
              className="stroke-accent transition-[stroke-dashoffset] duration-700 ease-out starting:[stroke-dashoffset:var(--ring-full)]"
              style={{ ["--ring-full" as string]: String(length) }}
            />
          </svg>
          <span aria-hidden="true" className="display absolute inset-0 grid place-items-center text-lg">
            {score}%
          </span>
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="display text-lg leading-tight">{scoreMessage(score)}</span>
          {plan && <span className="text-xs font-semibold text-soft">{/\d/.test(plan.shift) ? `Shift ${plan.shift}` : plan.shift}</span>}
        </div>
      </div>
      <p className="m-0 truncate text-xs font-semibold text-soft">{plan ? `Now: ${plan.now ?? "nothing planned"}` : "No day plan yet."}</p>
    </Tile>
  );
}
