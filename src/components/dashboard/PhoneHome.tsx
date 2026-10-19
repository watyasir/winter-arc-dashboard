"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { EmptyNote } from "@/components/EmptyNote";
import { Icon, type IconName } from "@/components/Icon";
import { formatRupees } from "@/lib/format";
import { toneBg } from "@/lib/tones";
import { BoardView } from "@/modules/board/BoardView";
import { HabitsTile } from "@/modules/habits/HabitsTile";
import { MoneyTile } from "@/modules/money/MoneyTile";
import { SeasonTile } from "@/modules/season/SeasonTile";
import { TodayRows } from "@/modules/today/TodayRows";
import { useDashboard } from "./DashboardContext";

/*
  The phone home screen (docs/design-reference/Phone.dc.html), shown under 640px.
  Large title, Winter Arc ring, 2x2 stats, Focus list, Money, and a floating tab bar
  with the round "Log today" button next to it.
*/

type Tab = "today" | "arc" | "board" | "money";

const tabs: { id: Tab; label: string; icon: IconName }[] = [
  { id: "today", label: "Today", icon: "sun" },
  { id: "arc", label: "Arc", icon: "snowflake" },
  { id: "board", label: "Board", icon: "board" },
  { id: "money", label: "Money", icon: "rupee" },
];

export function PhoneHome() {
  const { data } = useDashboard();
  const [tab, setTab] = useState<Tab>("today");

  return (
    <div className="pb-[calc(120px+env(safe-area-inset-bottom))]">
      <div className="flex flex-col gap-5 px-4 pt-[max(24px,env(safe-area-inset-top))]">
        {tab === "today" && <TodayTab />}
        {tab === "arc" && (
          <>
            <LargeTitle>{data.season?.name ?? "Winter Arc"}</LargeTitle>
            <SeasonTile />
            <HabitsTile />
          </>
        )}
        {tab === "board" && (
          <>
            <LargeTitle>Board</LargeTitle>
            <BoardView />
          </>
        )}
        {tab === "money" && (
          <>
            <LargeTitle>Money</LargeTitle>
            <MoneyTile />
          </>
        )}
        <p className="m-0 text-xs text-sub">{data.footnote}</p>
      </div>

      <nav aria-label="Tabs" className="fixed inset-x-4 bottom-[calc(20px+env(safe-area-inset-bottom))] z-10 flex items-center gap-2.5">
        <div className="flex h-[62px] flex-1 items-center justify-around rounded-full border border-glass-edge bg-glass shadow-float backdrop-blur-xl backdrop-saturate-[1.8]">
          {tabs.map((t) => {
            const current = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                aria-current={current ? "page" : undefined}
                onClick={() => {
                  setTab(t.id);
                  window.scrollTo({ top: 0 });
                }}
                className={`flex min-h-12 min-w-[60px] cursor-pointer flex-col items-center justify-center gap-0.5 rounded-full border-0 px-1 py-1.5 text-[11px] font-semibold ${
                  current ? "bg-brand/12 text-brand-text" : "bg-transparent text-ink"
                }`}
              >
                <Icon name={t.icon} size={22} strokeWidth={2} className="stroke-current" />
                {t.label}
              </button>
            );
          })}
        </div>
        <Link
          href={data.logHref}
          aria-label="Log today"
          className="flex size-[62px] shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-fab hover:bg-brand-hover hover:text-white"
        >
          <Icon name="plus" size={26} strokeWidth={2.6} className="stroke-white" />
        </Link>
      </nav>
    </div>
  );
}

function LargeTitle({ children }: { children: ReactNode }) {
  return <h1 className="m-0 text-[34px] leading-[1.1] font-bold tracking-[-0.02em]">{children}</h1>;
}

function TodayTab() {
  const { data, todayDone } = useDashboard();
  const { season, money } = data;
  const doneCount = todayDone.filter(Boolean).length;

  return (
    <>
      <header className="flex items-end justify-between">
        <div>
          <div className="text-[13px] font-semibold text-sub">{data.views.overview.title}</div>
          <h1 className="m-0 mt-0.5 text-[34px] leading-[1.1] font-bold tracking-[-0.02em]">Today</h1>
        </div>
        <div aria-hidden="true" className="flex size-9 items-center justify-center rounded-full bg-arc text-[15px] font-semibold text-white">
          {data.ownerInitial}
        </div>
      </header>

      <PhoneCard className="flex items-center gap-4 p-4">
        {season ? (
          <>
            <ArcRing day={season.day} length={season.length} />
            <div className="flex flex-col gap-[3px]">
              <span className="text-[13px] font-semibold text-arc-text">{season.name}</span>
              <span className="font-rounded text-[22px] font-bold">
                Day {season.day} of {season.length}
              </span>
              <span className="text-[13px] text-sub">
                {season.streak}-day streak · {season.targetsHitPct}% targets hit
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-1">
            <span className="text-[13px] font-semibold text-arc-text">Winter Arc</span>
            <EmptyNote>No season running yet. Keep logging; your days fill in once it has a start date.</EmptyNote>
          </div>
        )}
      </PhoneCard>

      <section aria-label="Key numbers" className="grid grid-cols-2 gap-2.5">
        {data.stats.slice(0, 4).map((s) => (
          <PhoneCard key={s.label} className="flex min-w-0 flex-col gap-1 p-3.5">
            <span className="flex items-center gap-1.5 text-[13px] font-semibold">
              <span aria-hidden="true" className={`size-2 rounded-full ${toneBg[s.tone]}`} />
              {s.label}
            </span>
            <span className="flex flex-wrap items-baseline gap-[3px]">
              <span className="font-rounded text-[28px] font-bold">{s.value}</span>
              {s.unit && <span className="text-[13px] font-semibold text-sub">{s.unit}</span>}
            </span>
            <span className="text-xs text-sub">{s.note}</span>
          </PhoneCard>
        ))}
      </section>

      <PhoneSection title={`Focus · ${doneCount} of ${data.today.length}`}>
        <PhoneCard className="px-4">
          <TodayRows size="phone" />
        </PhoneCard>
      </PhoneSection>

      {money ? (
        <PhoneSection title={`Money · ${money.month}`}>
          <PhoneCard className="flex flex-col gap-2.5 p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-[15px]">Saved</span>
              <span className="font-rounded text-[22px] font-bold text-sage-text">{formatRupees(money.income - money.spent)}</span>
            </div>
            <div
              role="img"
              aria-label={`Spending split: ${money.split.needs}% needs, ${money.split.wants}% wants, ${money.split.savings}% savings`}
              className="flex h-2 gap-0.5 overflow-hidden rounded-full"
            >
              <div className="bg-brand" style={{ width: `${money.split.needs}%` }} />
              <div className="bg-yellow" style={{ width: `${money.split.wants}%` }} />
              <div className="bg-sage" style={{ width: `${money.split.savings}%` }} />
            </div>
            <div aria-hidden="true" className="flex justify-between text-[13px] text-sub">
              <span>Needs {money.split.needs}%</span>
              <span>Wants {money.split.wants}%</span>
              <span>Savings {money.split.savings}%</span>
            </div>
          </PhoneCard>
        </PhoneSection>
      ) : (
        <PhoneSection title="Money">
          <PhoneCard className="p-4">
            <EmptyNote>Your monthly savings show here once the Personal Finance sheet is connected.</EmptyNote>
          </PhoneCard>
        </PhoneSection>
      )}
    </>
  );
}

function PhoneCard({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`rounded-[18px] border border-sep bg-card ${className}`}>{children}</div>;
}

function PhoneSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5">
      <h2 className="m-0 ml-4 text-[13px] font-semibold text-sub">{title}</h2>
      {children}
    </section>
  );
}

/** Winter Arc progress ring: how far through the season today is. */
function ArcRing({ day, length }: { day: number; length: number }) {
  const r = 34;
  const circumference = 2 * Math.PI * r;
  const filled = (Math.min(day, length) / length) * circumference;
  return (
    <svg width="84" height="84" viewBox="0 0 84 84" role="img" aria-label={`Winter Arc day ${day} of ${length}`} className="shrink-0">
      <circle cx="42" cy="42" r={r} fill="none" strokeWidth="11" className="stroke-arc/16" />
      <circle
        cx="42"
        cy="42"
        r={r}
        fill="none"
        strokeWidth="11"
        strokeLinecap="round"
        strokeDasharray={`${filled.toFixed(1)} ${circumference.toFixed(1)}`}
        transform="rotate(-90 42 42)"
        className="stroke-arc"
      />
      <text x="42" y="49" textAnchor="middle" className="fill-ink font-rounded text-[22px] font-bold">
        {day}
      </text>
    </svg>
  );
}
