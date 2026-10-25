"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckBox } from "@/components/Checkbox";
import { Icon, type IconName } from "@/components/Icon";
import type { ViewId } from "@/modules/types";
import { useDashboard } from "./DashboardContext";

// Icon tiles use the teal ramp, darkest first (DESIGN.md §2b).
// Inbox and Instinct are hidden while Phases 8b and 8c are parked (26 Oct); their views stay in src/modules.
const nav: { id: ViewId; label: string; icon: IconName; tile: string }[] = [
  { id: "overview", label: "Overview", icon: "grid", tile: "bg-brand" },
  { id: "board", label: "Board", icon: "board", tile: "bg-ramp2" },
];

const rowBase =
  "flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-full border-0 px-3 text-left text-[13px] text-ink hover:bg-fill sm:min-h-[38px]";

export function Sidebar() {
  const { data, view, setView } = useDashboard();
  const [treeOpen, setTreeOpen] = useState(true);

  return (
    <nav
      aria-label="Sections"
      className="flex w-full flex-col gap-0.5 rounded-[26px] border border-sep bg-base px-2.5 pt-3.5 pb-4 min-[980px]:sticky min-[980px]:top-4 min-[980px]:w-[236px] min-[980px]:shrink-0"
    >
      <div className="flex items-center gap-2.5 px-2.5 pt-1.5 pb-4">
        <div className="flex size-[34px] items-center justify-center rounded-[11px] bg-arc">
          <Icon name="snowflake" size={18} strokeWidth={2.2} className="stroke-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-[15px] font-bold">Yarizz&apos;s Dashboard</span>
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

      <button
        type="button"
        aria-expanded={treeOpen}
        aria-controls="trackers-tree"
        onClick={() => setTreeOpen((o) => !o)}
        className="mt-3 flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-0 bg-transparent px-2.5 text-left text-xs font-semibold text-sub hover:bg-fill sm:min-h-[30px]"
      >
        <span className={`transition-transform motion-reduce:transition-none ${treeOpen ? "" : "-rotate-90"}`}>
          <Icon name="chevronDown" size={12} strokeWidth={2.6} className="stroke-pine" />
        </span>
        Trackers today
      </button>
      {treeOpen && (
        <ul id="trackers-tree" className="m-0 ml-[21px] list-none border-l-2 border-pine py-0 pr-0 pl-1.5">
          {data.trackers.map((t) => (
            <li key={t.label} className="flex min-h-[30px] items-center gap-2.5 px-2.5 text-[13px]">
              <CheckBox checked={t.done} size={18} />
              <span className="flex-1">
                {t.label}
                <span className="sr-only">{t.done ? ", done" : ", not done"}</span>
              </span>
              <span className="text-xs text-sub">{t.value}</span>
            </li>
          ))}
        </ul>
      )}
      {data.settingsHref && (
        <Link href={`${data.settingsHref}#new-tracker`} className={`${rowBase} mt-1 bg-transparent font-medium text-brand-text no-underline hover:text-brand-text`}>
          + New tracker
        </Link>
      )}
    </nav>
  );
}
