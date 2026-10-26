"use client";

import { useSyncExternalStore } from "react";
import { Card } from "@/components/Card";
import { Chip } from "@/components/Chip";
import { EmptyNote } from "@/components/EmptyNote";
import { CardHeader, SectionHeading } from "@/components/SectionHeading";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { clockLabel, istMinutes, planNow, type DayPhase, type PhaseKind } from "@/lib/day-plan";
import { toneBg, type Tone } from "@/lib/tones";

/* Teal ramp only: the dot just tells phases apart; the words carry the meaning. */
const kindTone: Record<PhaseKind, Tone> = { sleep: "mist", care: "seafoam", food: "lagoon", move: "pine", work: "neutral", mind: "arc" };

const DAY_NAMES = { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" };

/**
 * The time in India, checked every 30 seconds so Now and Next move on by themselves.
 * Null on the server: the page is built ahead of time, so the clock is only read in the browser.
 */
function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 30_000);
  return () => clearInterval(id);
}

function useNowMinutes(): number | null {
  return useSyncExternalStore(subscribe, () => istMinutes(), () => null);
}

const range = (p: DayPhase) => `${clockLabel(p.start)} – ${clockLabel(p.end)}`;

/**
 * My Day: the day plan's Now and Next, the full day with the current phase marked, and the
 * plan's sections (meals, gym, skin, prep, stock list) folded away until opened.
 */
export function MyDayTile() {
  const { data } = useDashboard();
  const minutes = useNowMinutes();
  const plan = data.dayPlan;

  if (!plan) {
    return (
      <Card aria-label="My Day" className="flex flex-col gap-2.5">
        <SectionHeading tone="pine">My Day</SectionHeading>
        <EmptyNote>No day plan yet. Claude sends it through the API (POST /api/day-plan), then Now and Next show here.</EmptyNote>
      </Card>
    );
  }

  const { day, phases, now, current, upcoming } = planNow(plan, data.todayISO, minutes ?? 0);
  const ready = minutes != null;
  const weekend = day === "sat" || day === "sun";

  return (
    <Card aria-label="My Day" className="flex flex-col gap-3">
      <CardHeader aside={<Chip tone={weekend ? "sage" : "neutral"}>{`${DAY_NAMES[day]} · ${weekend ? "day off" : "shift day"}`}</Chip>}>
        <SectionHeading tone="pine">My Day</SectionHeading>
      </CardHeader>

      <div className="grid gap-2.5 sm:grid-cols-2">
        <PhasePanel label="Now" ready={ready} phase={current} time={current && range(current)} strong />
        <PhasePanel label="Next" ready={ready} phase={upcoming} time={upcoming && `at ${clockLabel(upcoming.start)}`} />
      </div>

      <details className="group rounded-xl border border-sep">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-3 text-[13px] font-semibold sm:min-h-9 [&::-webkit-details-marker]:hidden">
          Full day · {phases.length} phases
          <span aria-hidden="true" className="text-sub transition-transform group-open:rotate-90 motion-reduce:transition-none">›</span>
        </summary>
        <ol className="m-0 flex list-none flex-col p-0 pb-1.5">
          {phases.map((p, i) => (
            <li
              key={`${p.start}-${p.title}`}
              aria-current={ready && i === now ? "step" : undefined}
              className={`grid grid-cols-[72px_10px_1fr] items-start gap-2 border-t border-sep px-3 py-2 ${ready && i === now ? "bg-brand/8" : ""}`}
            >
              <span className={`text-xs tabular-nums ${ready && i === now ? "font-semibold text-brand-text" : "text-sub"}`}>{clockLabel(p.start)}</span>
              <span aria-hidden="true" className={`mt-[5px] size-2 rounded-full ${toneBg[kindTone[p.kind]]}`} />
              <span className="min-w-0">
                <span className="block text-[13px] font-semibold">
                  {p.title}
                  {ready && i === now && <span className="sr-only"> (now)</span>}
                </span>
                {p.detail && <span className="block text-xs leading-[1.4] text-sub">{p.detail}</span>}
              </span>
            </li>
          ))}
        </ol>
      </details>

      {plan.sections.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {plan.sections.map((s) => (
            <details key={s.title} className="group rounded-xl border border-sep">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-3 text-[13px] font-semibold sm:min-h-9 [&::-webkit-details-marker]:hidden">
                {s.title}
                <span aria-hidden="true" className="text-sub transition-transform group-open:rotate-90 motion-reduce:transition-none">›</span>
              </summary>
              <dl className="m-0 flex flex-col">
                {s.items.map((it) => (
                  <div key={it.label} className="grid gap-0.5 border-t border-sep px-3 py-2 sm:grid-cols-[120px_1fr] sm:gap-3">
                    <dt className="text-xs font-semibold">{it.label}</dt>
                    <dd className="m-0 text-xs leading-[1.45] text-sub">{it.text}</dd>
                  </div>
                ))}
              </dl>
            </details>
          ))}
        </div>
      )}
    </Card>
  );
}

function PhasePanel({ label, ready, phase, time, strong }: { label: string; ready: boolean; phase?: DayPhase; time?: string; strong?: boolean }) {
  return (
    <div className={`flex min-w-0 flex-col gap-1 rounded-xl p-3 ${strong ? "bg-brand/8" : "bg-column"}`}>
      <span className="flex items-center justify-between gap-2 text-[11px] font-semibold tracking-[0.04em] text-sub uppercase">
        {label}
        {ready && time && <span className="tracking-normal normal-case tabular-nums">{time}</span>}
      </span>
      {!ready ? (
        <span className="text-[13px] text-sub">Checking the time…</span>
      ) : phase ? (
        <>
          <span className="text-[15px] leading-[1.3] font-bold">{phase.title}</span>
          {phase.detail && <span className="line-clamp-3 text-xs leading-[1.45] text-sub">{phase.detail}</span>}
        </>
      ) : (
        <span className="text-[13px] text-sub">Nothing planned.</span>
      )}
    </div>
  );
}
