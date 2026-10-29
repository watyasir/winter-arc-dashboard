"use client";

import Link from "next/link";
import { Icon, type IconName } from "@/components/Icon";
import type { ViewId } from "@/modules/types";
import { useDashboard } from "./DashboardContext";

const NAV: { id: ViewId; label: string; short: string; path: string; icon: IconName }[] = [
  { id: "overview", label: "Overview", short: "Home", path: "", icon: "grid" },
  { id: "arc", label: "Winter Arc", short: "Arc", path: "/winter-arc", icon: "snowflake" },
  { id: "board", label: "Board", short: "Board", path: "/board", icon: "board" },
  { id: "money", label: "Money", short: "Money", path: "/money", icon: "rupee" },
  { id: "health", label: "Health", short: "Health", path: "/health", icon: "heart" },
  { id: "gallery", label: "Gallery", short: "Gallery", path: "/gallery", icon: "image" },
];

/** A view's address: "/board", "/demo/board", "/" or "/demo". */
export const viewHref = (base: string, id: ViewId) => `${base}${NAV.find((n) => n.id === id)!.path}` || "/";

/** Brand, the page links and Check-in, from 561px up. On the phone only the brand shows; the tab bar has the links. */
export function TopBar() {
  const { data, view } = useDashboard();
  return (
    <header className="flex flex-wrap items-center gap-x-5 gap-y-3">
      <Link href={viewHref(data.basePath, "overview")} prefetch className="flex min-h-11 items-center gap-2.5 text-xl font-extrabold tracking-[-0.01em] text-ink no-underline">
        <span aria-hidden="true" className="grid size-8 place-items-center rounded-item bg-peach font-mono text-sm font-bold shadow-tile">
          Y
        </span>
        Yasir OS
      </Link>
      <nav aria-label="Pages" className="hidden flex-1 flex-wrap gap-1 min-[561px]:flex">
        {NAV.map((n) => (
          <Link
            key={n.id}
            href={viewHref(data.basePath, n.id)}
            prefetch
            aria-current={view === n.id ? "page" : undefined}
            className={`flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold no-underline ${
              view === n.id ? "border border-line bg-card text-ink shadow-tile" : "text-sub hover:text-ink"
            }`}
          >
            {n.label}
            {n.id === "board" && data.navBadges.board && <span className="font-mono text-xs text-sub">{data.navBadges.board}</span>}
          </Link>
        ))}
      </nav>
      <Link
        href={data.logHref}
        prefetch
        className="ml-auto hidden min-h-11 items-center rounded-full bg-blue px-4 text-sm font-semibold text-ink no-underline hover:brightness-95 min-[561px]:flex press"
      >
        Check-in
      </Link>
    </header>
  );
}

/** Phone (560px and under): the page links as a tab bar at the bottom of the screen. */
export function TabBar() {
  const { data, view } = useDashboard();
  return (
    <nav aria-label="Pages" className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-card pb-[env(safe-area-inset-bottom)] min-[561px]:hidden">
      <ul className="m-0 grid list-none grid-cols-6 p-0">
        {NAV.map((n) => (
          <li key={n.id}>
            <Link
              href={viewHref(data.basePath, n.id)}
              prefetch
              aria-current={view === n.id ? "page" : undefined}
              className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-semibold no-underline ${view === n.id ? "text-ink" : "text-sub"}`}
            >
              <span className={`grid h-7 w-11 place-items-center rounded-full ${view === n.id ? "bg-peach" : ""}`}>
                <Icon name={n.icon} size={18} strokeWidth={2} />
              </span>
              {n.short}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
