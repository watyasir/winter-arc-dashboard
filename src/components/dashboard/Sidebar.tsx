"use client";

import Link from "next/link";
import { Icon, type IconName } from "@/components/Icon";
import type { ViewId } from "@/modules/types";
import { useDashboard } from "./DashboardContext";

// Icon tiles use the teal ramp, darkest first (DESIGN.md §2b, v6.1).
const nav: { id: ViewId; label: string; icon: IconName; tile: string }[] = [
  { id: "overview", label: "Overview", icon: "grid", tile: "bg-brand" },
  { id: "arc", label: "Winter Arc", icon: "snowflake", tile: "bg-arc" },
  { id: "board", label: "Board", icon: "board", tile: "bg-ramp3" },
  { id: "gallery", label: "Gallery", icon: "image", tile: "bg-pine" },
];

const rowBase =
  "flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-full border-0 px-3 text-left text-[13px] text-ink hover:bg-fill sm:min-h-[38px]";

export function Sidebar() {
  const { data, view, setView } = useDashboard();

  return (
    <nav
      aria-label="Sections"
      className="flex w-full flex-col gap-0.5 rounded-[26px] border border-sep bg-base px-2.5 pt-3.5 pb-4 min-[980px]:sticky min-[980px]:top-4 min-[980px]:w-[236px] min-[980px]:shrink-0"
    >
      <div className="flex items-center gap-2.5 px-2.5 pt-1.5 pb-4">
        <div className="flex size-[34px] items-center justify-center rounded-[11px] bg-brand">
          <Icon name="snowflake" size={18} strokeWidth={2.2} className="stroke-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-[15px] font-bold">Yasir OS</span>
          <span className="text-xs text-sub">{data.ownerLine}</span>
        </div>
      </div>

      {nav.map((n) => {
        const current = view === n.id;
        return (
          <button
            key={n.id}
            type="button"
            aria-current={current ? "page" : undefined}
            onClick={() => setView(n.id)}
            className={`${rowBase} ${current ? "bg-brand font-semibold text-white hover:bg-brand" : "bg-transparent font-medium"}`}
          >
            <span className={`flex size-6 shrink-0 items-center justify-center rounded-lg ${current ? "bg-on-dark" : n.tile}`}>
              <Icon name={n.icon} className="stroke-white" />
            </span>
            <span className="flex-1">{n.label}</span>
            {data.navBadges[n.id] && (
              <span className={`text-xs font-semibold ${current ? "text-white/80" : "text-sub"}`}>
                {data.navBadges[n.id]}
                <span className="sr-only"> open</span>
              </span>
            )}
          </button>
        );
      })}

      {/* The daily check-in is its own page; it opens only from here (and the phone's round button). */}
      <Link href={data.logHref} prefetch className={`${rowBase} bg-transparent font-medium no-underline hover:text-ink`}>
        <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-sage">
          <Icon name="check" className="stroke-white" />
        </span>
        <span className="flex-1">Check-in</span>
      </Link>
    </nav>
  );
}
