"use client";

import { WinterArcView } from "@/modules/arc/WinterArcView";
import { BoardView } from "@/modules/board/BoardView";
import { GalleryView } from "@/modules/gallery/GalleryView";
import { HealthView } from "@/modules/health/HealthView";
import { MoneyView } from "@/modules/money/MoneyView";
import { Reminders } from "@/modules/reminders/Reminders";
import { OverviewView } from "@/modules/overview/OverviewView";
import type { DashboardData, GalleryActions, TaskActions, ToggleTodayAction, ViewId } from "@/modules/types";
import { DashboardProvider } from "./DashboardContext";
import { TabBar, TopBar } from "./Nav";

const VIEWS: Record<ViewId, () => React.JSX.Element> = {
  overview: OverviewView,
  arc: WinterArcView,
  board: BoardView,
  money: MoneyView,
  health: HealthView,
  gallery: GalleryView,
};

/**
 * The app frame for every page: top bar, the page's title, the view, and the phone tab bar.
 * One fluid layout for phone and laptop. Tasks due soon show as reminder toasts (nothing is blocked).
 */
export function Dashboard({
  data,
  view,
  onToggleToday,
  taskActions,
  galleryActions,
}: {
  data: DashboardData;
  view: ViewId;
  onToggleToday?: ToggleTodayAction;
  taskActions?: TaskActions;
  galleryActions?: GalleryActions;
}) {
  const View = VIEWS[view];
  const { title, subtitle } = data.views[view];
  return (
    <DashboardProvider data={data} view={view} onToggleToday={onToggleToday} taskActions={taskActions} galleryActions={galleryActions}>
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-5 px-4 pt-4 pb-28 sm:px-6 min-[561px]:pb-12">
        <TopBar />
        <div className="flex flex-col gap-1">
          <h1 className="m-0 text-2xl display tracking-[-0.02em] text-balance sm:text-[32px]">{title}</h1>
          <p className="m-0 text-sm text-soft">{subtitle}</p>
        </div>
        <main className="min-w-0">
          <View />
        </main>
      </div>
      <TabBar />
      <Reminders />
    </DashboardProvider>
  );
}
