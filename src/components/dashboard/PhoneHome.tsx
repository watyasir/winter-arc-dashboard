"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { EmptyNote } from "@/components/EmptyNote";
import { Icon, type IconName } from "@/components/Icon";
import { PillLink } from "@/components/PillLink";
import { formatRupees } from "@/lib/format";
import { toneBg, type Tone } from "@/lib/tones";
import { ArcStreaksTile, ArcTargetsTile, ArcWeeksTile } from "@/modules/arc/ArcTiles";
import { BoardView } from "@/modules/board/BoardView";
import { InProgressTile } from "@/modules/board/InProgressTile";
import { HabitsTile } from "@/modules/habits/HabitsTile";
import { MoneyTile } from "@/modules/money/MoneyTile";
import { SeasonTile } from "@/modules/season/SeasonTile";
import { TaskRows, useTaskLists } from "@/modules/tasks/TaskRows";
import { TodayRows } from "@/modules/today/TodayRows";
import { ArcChip } from "./ArcChip";
import { useDashboard } from "./DashboardContext";

/*
  The phone home screen, shown under 640px (DESIGN.md v6.1 phone section).
  Today = the life Overview in one column; Arc = the Winter Arc page stacked; Board; Money.
  Floating tab bar with the round "Log today" button next to it.
  The tab follows the dashboard's view, so "Open Board" or the Winter Arc chip switch tabs too.
*/

type Tab = "today" | "arc" | "board" | "money";

const tabs: { id: Tab; label: string; icon: IconName }[] = [
  { id: "today", label: "Today", icon: "sun" },
  { id: "arc", label: "Arc", icon: "snowflake" },
  { id: "board", label: "Board", icon: "board" },
  { id: "money", label: "Money", icon: "rupee" },
];

export function PhoneHome() {
  const { data, view, setView } = useDashboard();
  // Money is phone-only, so it's kept here; the other tabs are the shared views.
  const [moneyOpen, setMoneyOpen] = useState(false);
  const tab: Tab = moneyOpen ? "money" : view === "arc" ? "arc" : view === "board" ? "board" : "today";

  function open(t: Tab) {
    setMoneyOpen(t === "money");
    setView(t === "arc" ? "arc" : t === "board" ? "board" : "overview");
    window.scrollTo({ top: 0 });
  }

  return (
    <div className="pb-[calc(120px+env(safe-area-inset-bottom))]">
      <div className="flex flex-col gap-5 px-4 pt-[max(24px,env(safe-area-inset-top))]">
        {tab === "today" && <TodayTab onMoney={() => open("money")} />}
        {tab === "arc" && <ArcTab />}
        {tab === "board" && (
          <>
            <LargeTitle>Board</LargeTitle>
            <BoardView />
          </>
        )}
        {tab === "money" && (
          <>
            <LargeTitle>Money</LargeTitle>
            <div>
              <MoneyTile />
            </div>
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
                onClick={() => open(t.id)}
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
          prefetch
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

/** The life Overview, one column: greeting + Winter Arc chip, Today, Tasks, a 2x2 summary, Habits, In progress. */
function TodayTab({ onMoney }: { onMoney: () => void }) {
  const { data, todayDone, setView } = useDashboard();
  const { weight, workouts, goals, money } = data;
  const doneCount = todayDone.filter(Boolean).length;
  const { dueToday, overdue } = useTaskLists();
  const taskRows = [...overdue, ...dueToday];

  const change = weight && weight.values.length >= 2 ? weight.values.at(-1)! - weight.values[0] : null;
  const topGoal = goals[0];

  return (
    <>
      <header className="flex flex-col gap-3">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[13px] font-semibold text-sub">{data.views.overview.title}</div>
            <h1 className="m-0 mt-0.5 text-[34px] leading-[1.1] font-bold tracking-[-0.02em]">Today</h1>
          </div>
          <div aria-hidden="true" className="flex size-9 items-center justify-center rounded-full bg-arc text-[15px] font-semibold text-white">
            {data.ownerInitial}
          </div>
        </div>
        <div>
          <ArcChip onOpen={() => setView("arc")} />
        </div>
      </header>

      <PhoneSection title={`Today · ${doneCount} of ${data.today.length} done`}>
        <PhoneCard className="px-4">
          <TodayRows size="phone" />
        </PhoneCard>
      </PhoneSection>

      <PhoneSection title={taskRows.length ? `Tasks · ${overdue.length ? `${overdue.length} overdue, ` : ""}${dueToday.length} due today` : "Tasks"}>
        <PhoneCard className="px-4">
          {taskRows.length > 0 ? (
            <TaskRows tasks={taskRows} size="phone" />
          ) : (
            <div className="py-3.5">
              <EmptyNote>Nothing due today. Tasks with a due date show here.</EmptyNote>
            </div>
          )}
        </PhoneCard>
      </PhoneSection>

      <section aria-label="Summary" className="grid grid-cols-2 gap-2.5">
        <SummaryCard
          href={data.bodyHref}
          tone="mist"
          label="Body"
          value={weight?.values.length ? weight.values.at(-1)!.toFixed(1) : "–"}
          unit={weight?.values.length ? weight.unit : ""}
          note={change == null ? "Weekly body check" : `${change === 0 ? "No change" : `${change > 0 ? "▲" : "▼"} ${Math.abs(change).toFixed(1)}`} since ${weight!.startLabel}`}
        />
        <SummaryCard
          href={data.workoutHref}
          tone="pine"
          label="Workouts"
          value={String(workouts.weekCount)}
          unit={workouts.weekTarget != null ? `of ${workouts.weekTarget}` : ""}
          note="This week"
        />
        <SummaryCard
          href={data.goalsHref}
          tone="seafoam"
          label="Goals"
          value={String(goals.length)}
          unit="active"
          note={topGoal ? `${topGoal.name} · ${topGoal.pct}%` : "Add a goal"}
        />
        <SummaryCard
          onClick={onMoney}
          tone="sage"
          label="Money"
          value={money ? formatRupees(money.income - money.spent) : "–"}
          unit=""
          note={money ? `Saved in ${money.month}` : "Connects with the money phase"}
        />
      </section>

      <HabitsTile weeks={2} className="" />
      <InProgressTile className="" />
    </>
  );
}

/** One of the Today tab's 2x2 cards. The whole card opens the matching page. */
function SummaryCard({
  label,
  value,
  unit,
  note,
  tone,
  href,
  onClick,
}: {
  label: string;
  value: string;
  unit: string;
  note: string;
  tone: Tone;
  href?: string;
  onClick?: () => void;
}) {
  const body = (
    <>
      <span className="flex items-center gap-1.5 text-[13px] font-semibold">
        <span aria-hidden="true" className={`size-2 rounded-full ${toneBg[tone]}`} />
        {label}
      </span>
      <span className="flex flex-wrap items-baseline gap-[3px]">
        <span className="font-rounded text-[26px] font-bold">{value}</span>
        {unit && <span className="text-[13px] font-semibold text-sub">{unit}</span>}
      </span>
      <span className="truncate text-xs text-sub">{note}</span>
    </>
  );
  const cls = "flex min-h-11 min-w-0 flex-col gap-1 rounded-[18px] border border-sep bg-card p-3.5 text-left text-ink no-underline hover:text-ink";
  return href ? (
    <Link href={href} className={cls}>
      {body}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={`${cls} w-full cursor-pointer font-[inherit]`}>
      {body}
    </button>
  );
}

/** The Winter Arc page stacked: hero, targets this week, streaks, week by week, share card. */
function ArcTab() {
  const { data } = useDashboard();
  return (
    <>
      <LargeTitle>{data.season?.name ?? "Winter Arc"}</LargeTitle>
      <SeasonTile />
      <ArcTargetsTile className="" />
      <ArcStreaksTile className="" />
      <ArcWeeksTile />
      {data.season && (
        <PillLink href={data.shareHref} className="justify-center">
          Share card
        </PillLink>
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
