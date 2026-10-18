"use client";

import { BoardView } from "@/modules/board/BoardView";
import { InboxView } from "@/modules/inbox/InboxView";
import { InstinctView } from "@/modules/instinct/InstinctView";
import type { DashboardData } from "@/modules/types";
import { DashboardProvider, useDashboard } from "./DashboardContext";
import { Header } from "./Header";
import { OverviewView } from "./OverviewView";
import { Sidebar } from "./Sidebar";

/** The whole app frame: sidebar + header + the selected view. */
export function Dashboard({ data }: { data: DashboardData }) {
  return (
    <DashboardProvider data={data}>
      <div className="flex flex-wrap items-start gap-[18px] p-4 min-[980px]:flex-nowrap">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col gap-4 pb-8 min-[980px]:px-1 min-[980px]:pt-1">
          <Header />
          <CurrentView />
          <p className="mx-0.5 mt-1 mb-0 text-xs text-subtext1">{data.footnote}</p>
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
