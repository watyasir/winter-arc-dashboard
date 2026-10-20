"use client";

import { BoardView } from "@/modules/board/BoardView";
import { InboxView } from "@/modules/inbox/InboxView";
import { InstinctView } from "@/modules/instinct/InstinctView";
import type { DashboardData, TaskActions, ToggleTodayAction } from "@/modules/types";
import { DashboardProvider, useDashboard } from "./DashboardContext";
import { Header } from "./Header";
import { OverviewView } from "./OverviewView";
import { PhoneHome } from "./PhoneHome";
import { Sidebar } from "./Sidebar";

/** The whole app frame: the phone home screen under 640px, sidebar + header + the selected view from 640px up. */
export function Dashboard({
  data,
  onToggleToday,
  taskActions,
}: {
  data: DashboardData;
  onToggleToday?: ToggleTodayAction;
  taskActions?: TaskActions;
}) {
  return (
    <DashboardProvider data={data} onToggleToday={onToggleToday} taskActions={taskActions}>
      <div className="sm:hidden">
        <PhoneHome />
      </div>
      <div className="hidden flex-wrap items-start gap-[18px] p-4 sm:flex min-[980px]:flex-nowrap">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col gap-4 pb-8 min-[980px]:px-1 min-[980px]:pt-1">
          <Header />
          <CurrentView />
          <p className="mx-0.5 mt-1 mb-0 text-xs text-sub">{data.footnote}</p>
        </main>
      </div>
    </DashboardProvider>
  );
}

function CurrentView() {
  const { view } = useDashboard();
  switch (view) {
    case "inbox":
      return <InboxView />;
    case "board":
      return <BoardView />;
    case "instinct":
      return <InstinctView />;
    default:
      return <OverviewView />;
  }
}
