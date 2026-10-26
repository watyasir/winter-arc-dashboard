"use client";

import { useSyncExternalStore } from "react";
import { WinterArcView } from "@/modules/arc/WinterArcView";
import { BoardView } from "@/modules/board/BoardView";
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
  const layout = useLayout();
  return (
    <DashboardProvider data={data} onToggleToday={onToggleToday} taskActions={taskActions}>
      {layout !== "desktop" && (
        <div className="sm:hidden">
          <PhoneHome />
        </div>
      )}
      {layout !== "phone" && (
        <div className="hidden flex-wrap items-start gap-[18px] p-4 sm:flex min-[980px]:flex-nowrap">
          <Sidebar />
          <main className="flex min-w-0 flex-1 flex-col gap-4 pb-8 min-[980px]:px-1 min-[980px]:pt-1">
            <Header />
            <CurrentView />
            <p className="mx-0.5 mt-1 mb-0 text-xs text-sub">{data.footnote}</p>
          </main>
        </div>
      )}
    </DashboardProvider>
  );
}

/*
  Which layout is on screen. The server can't know, so the first render has both (CSS shows the right one).
  After that only the visible one is rendered, which halves the work on every tap and view switch.
*/
const PHONE_QUERY = "(max-width: 639.98px)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(PHONE_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function useLayout(): "phone" | "desktop" | "both" {
  return useSyncExternalStore(
    subscribe,
    () => (window.matchMedia(PHONE_QUERY).matches ? "phone" : "desktop"),
    () => "both",
  );
}

function CurrentView() {
  const { view } = useDashboard();
  if (view === "arc") return <WinterArcView />;
  return view === "board" ? <BoardView /> : <OverviewView />;
}
