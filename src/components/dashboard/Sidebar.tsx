"use client";

import { useState } from "react";
import { CheckBox } from "@/components/Checkbox";
import { Icon, type IconName } from "@/components/Icon";
import { toneBg, type Tone } from "@/lib/tones";
import type { ViewId } from "@/modules/types";
import { useDashboard } from "./DashboardContext";

// Rainbow folder order: Overview red, Inbox peach, Board yellow, Instinct green.
const nav: { id: ViewId; label: string; icon: IconName; tone: Tone }[] = [
  { id: "overview", label: "Overview", icon: "grid", tone: "red" },
  { id: "inbox", label: "Inbox", icon: "mail", tone: "peach" },
  { id: "board", label: "Board", icon: "board", tone: "yellow" },
  { id: "instinct", label: "Instinct", icon: "spark", tone: "green" },
];

const rowBase =
  "flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-lg border-0 px-2.5 text-left text-[13px] text-text hover:bg-fill sm:min-h-[34px]";

export function Sidebar() {
  const { data, view, setView } = useDashboard();
  const [treeOpen, setTreeOpen] = useState(true);

  return (
    <nav
      aria-label="Sections"
      className="flex w-full flex-col gap-0.5 rounded-[26px] border border-surface0 bg-base px-2.5 pt-3.5 pb-4 min-[980px]:sticky min-[980px]:top-4 min-[980px]:w-[236px] min-[980px]:shrink-0"
    >
      <div className="flex items-center gap-2.5 px-2.5 pt-1.5 pb-4">
        <div className="flex size-[34px] items-center justify-center rounded-[11px] bg-mauve">
          <Icon name="snowflake" size={18} strokeWidth={2.2} className="stroke-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-[15px] font-bold">Winter Arc</span>
          <span className="text-xs text-subtext1">{data.ownerLine}</span>
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
            className={`${rowBase} ${current ? "bg-crust font-bold hover:bg-crust" : "bg-transparent font-medium"}`}
          >
            <span className={`flex size-6 shrink-0 items-center justify-center rounded-lg ${toneBg[n.tone]}`}>
              <Icon name={n.icon} className="stroke-white" />
            </span>
            <span className="flex-1">{n.label}</span>
            {data.navBadges[n.id] && (
              <span className="text-xs font-semibold text-subtext1">
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
        className="mt-3 flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border-0 bg-transparent px-2.5 text-left text-xs font-semibold text-subtext1 hover:bg-fill sm:min-h-[30px]"
      >
        <span className={`transition-transform motion-reduce:transition-none ${treeOpen ? "" : "-rotate-90"}`}>
          <Icon name="chevronDown" size={12} strokeWidth={2.6} className="stroke-teal" />
        </span>
        Trackers today
      </button>
      {treeOpen && (
        <ul id="trackers-tree" className="m-0 ml-[21px] list-none border-l-2 border-teal py-0 pr-0 pl-1.5">
          {data.trackers.map((t) => (
            <li key={t.label} className="flex min-h-[30px] items-center gap-2.5 px-2.5 text-[13px]">
              <CheckBox checked={t.done} size={18} />
              <span className="flex-1">
                {t.label}
                <span className="sr-only">{t.done ? ", done" : ", not done"}</span>
              </span>
              <span className="text-xs text-subtext1">{t.value}</span>
            </li>
          ))}
        </ul>
      )}
      <button type="button" className={`${rowBase} mt-1 bg-transparent font-medium text-blue-text`}>
        + New tracker
      </button>
    </nav>
  );
}
