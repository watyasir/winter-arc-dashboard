"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import type { ShareCard } from "@/lib/share";

/*
  The shareable Winter Arc card: portrait, sized to fill a phone screenshot.
  One dark teal hero card with the numbers, then "Copy link" underneath (outside the card,
  so a cropped screenshot stays clean).
*/
export function ProgressCard({
  card,
  sharePath,
  calendarHref = null,
  backHref,
  demo = false,
}: {
  card: ShareCard | null;
  /** Path the link points to (the origin is added in the browser). Null = sharing isn't set up. */
  sharePath: string | null;
  /** Owner only: where the calendar feeds are listed (/settings). */
  calendarHref?: string | null;
  /** Owner and demo only: back to the dashboard. */
  backHref?: string;
  demo?: boolean;
}) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col justify-center gap-4 px-4 pt-[max(20px,env(safe-area-inset-top))] pb-[max(24px,env(safe-area-inset-bottom))]">
      {card ? <Card card={card} demo={demo} /> : <NoSeason />}
      <ShareActions sharePath={card ? sharePath : null} calendarHref={calendarHref} backHref={backHref} />
    </main>
  );
}

function Card({ card, demo }: { card: ShareCard; demo: boolean }) {
  const waiting = card.startsIn > 0;
  const pct = waiting ? 0 : Math.round((card.day / card.length) * 100);
  const { targets, workouts, weight } = card;

  return (
    <section aria-label={`${card.name} progress`} className="flex flex-col gap-6 rounded-[28px] bg-hero p-6 text-white">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-[34px] items-center justify-center rounded-[11px] bg-on-dark">
            <Icon name="snowflake" size={18} strokeWidth={2.2} className="stroke-white" />
          </span>
          <span className="text-[15px] font-semibold text-hero-label">
            {card.name} · {card.length} days
          </span>
        </div>
        {demo && <span className="rounded-full bg-on-dark px-2.5 py-1 text-xs font-semibold">Sample data</span>}
      </header>

      <div className="flex flex-col gap-3">
        <div className="flex items-baseline gap-2">
          {!waiting && <span className="text-[22px] font-semibold text-hero-sub">Day</span>}
          <span className="font-rounded text-[88px] leading-[0.9] font-bold tracking-[-0.04em]">{waiting ? card.startsIn : card.day}</span>
          <span className="text-[22px] font-semibold text-hero-sub">
            {waiting ? (card.startsIn === 1 ? "day to go" : "days to go") : `of ${card.length}`}
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Season progress"
          aria-valuemin={0}
          aria-valuemax={card.length}
          aria-valuenow={waiting ? 0 : card.day}
          aria-valuetext={waiting ? `Starts on ${card.startLabel}` : `Day ${card.day} of ${card.length}`}
          className="h-2.5 overflow-hidden rounded-full bg-hero-upcoming"
        >
          <div className="h-full rounded-full bg-hero-sage" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between text-[13px] text-hero-sub">
          <span>{waiting ? `Starts ${card.startLabel}` : card.startLabel}</span>
          <span>{card.endLabel}</span>
        </div>
      </div>

      <dl className="m-0 grid grid-cols-2 gap-2.5">
        <Stat label="Current streak" value={String(card.streak)} unit={card.streak === 1 ? "day" : "days"} />
        <Stat label="Best streak" value={String(card.bestStreak)} unit={card.bestStreak === 1 ? "day" : "days"} />
        <Stat
          label="Targets hit"
          value={targets.pct == null ? "–" : `${targets.pct}%`}
          note={targets.pct == null ? "Counts after day 1" : targets.label}
          valueClass={targets.pct == null ? "" : "text-hero-sage"}
        />
        <Stat
          label="Workouts"
          value={String(workouts.count)}
          unit={workouts.target != null ? `of ${workouts.target}` : undefined}
          note="This week"
        />
        <Stat
          wide
          label="Weight change"
          value={weight ? signedKg(weight.change) : "–"}
          unit={weight ? "kg" : undefined}
          note={weight ? `Since ${weight.sinceLabel}` : "Shows after two weekly weigh-ins"}
        />
      </dl>

      <footer className="flex items-center justify-between border-t border-on-dark pt-4 text-[13px] text-hero-sub">
        <span className="font-semibold text-white">Yasir OS</span>
        <span>As of {card.asOf}</span>
      </footer>
    </section>
  );
}

/** +1.2 / −0.8 / 0 (a real minus sign, like the money amounts). */
function signedKg(n: number): string {
  if (n === 0) return "0";
  return `${n > 0 ? "+" : "−"}${Math.abs(n)}`;
}

function Stat({
  label,
  value,
  unit,
  note,
  wide = false,
  valueClass = "",
}: {
  label: string;
  value: string;
  unit?: string;
  note?: string;
  wide?: boolean;
  valueClass?: string;
}) {
  return (
    <div className={`flex min-w-0 flex-col gap-1 rounded-[18px] bg-on-dark px-4 py-3.5 ${wide ? "col-span-2" : ""}`}>
      <dt className="text-[13px] font-semibold text-hero-label">{label}</dt>
      <dd className="m-0 flex flex-wrap items-baseline gap-1">
        <span className={`font-rounded text-[30px] leading-tight font-bold ${valueClass}`}>{value}</span>
        {unit && <span className="text-[15px] font-semibold text-hero-sub">{unit}</span>}
        {note && <span className="w-full text-xs text-hero-sub">{note}</span>}
      </dd>
    </div>
  );
}

function NoSeason() {
  return (
    <section aria-label="Winter Arc progress" className="flex flex-col gap-1.5 rounded-[28px] bg-hero p-6 text-white">
      <span className="text-[13px] font-semibold text-hero-label">Winter Arc · 90 days</span>
      <span className="text-[22px] font-bold">No season running yet</span>
      <span className="text-[15px] text-hero-sub">The progress card fills in once Winter Arc has a start date.</span>
    </section>
  );
}

function ShareActions({ sharePath, calendarHref, backHref }: { sharePath: string | null; calendarHref: string | null; backHref?: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const link = sharePath && typeof window !== "undefined" ? `${window.location.origin}${sharePath}` : null;

  async function copy() {
    if (!sharePath) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${sharePath}`);
      setStatus("copied");
    } catch {
      // Clipboard can be blocked (old browsers, some in-app browsers): show the link to copy by hand.
      setStatus("failed");
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {sharePath ? (
        <Button variant="primary" onClick={copy} className="w-full sm:min-h-11">
          {status === "copied" ? "Link copied" : "Copy link"}
        </Button>
      ) : (
        <Note>Sharing is off. Add SHARE_TOKEN to the site&apos;s settings to get a link.</Note>
      )}
      {calendarHref && (
        <Link
          href={calendarHref}
          className="flex min-h-11 w-full items-center justify-center rounded-full border border-solid border-sep bg-base px-4 text-[13px] font-semibold text-ink no-underline hover:bg-fill-strong hover:text-ink"
        >
          Subscribe in Calendar
        </Link>
      )}
      <p role="status" className="m-0 text-center text-[13px] text-sub">
        {status === "copied" && "Anyone with the link sees only this card."}
        {status === "failed" && link && (
          <>
            Couldn&apos;t copy. Press and hold to copy: <span className="break-all text-ink select-all">{link}</span>
          </>
        )}
      </p>
      {backHref && (
        <Link href={backHref} className="flex min-h-11 items-center text-[15px] font-semibold text-brand-text hover:text-brand-hover">
          Back to dashboard
        </Link>
      )}
    </div>
  );
}

function Note({ children }: { children: ReactNode }) {
  return <p className="m-0 text-center text-[13px] text-sub">{children}</p>;
}
