"use client";

import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { useDashboard } from "./DashboardContext";
import { InstinctPill } from "./InstinctPill";

/** Page header card with the dashed bottom rule. */
export function Header() {
  const { data, view, setView } = useDashboard();
  const { title, subtitle } = data.views[view];

  // Demo: "Log Today" jumps to the Today checklist. The real check-in (/log) arrives in Phase 2.
  const logToday = () => {
    setView("overview");
    requestAnimationFrame(() => {
      const el = document.getElementById("today");
      el?.scrollIntoView({ block: "center" });
      el?.focus({ preventScroll: true });
    });
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-3.5 rounded-t-2xl rounded-b-md border-b-2 border-dashed border-surface1 bg-base px-5 py-4">
      <div className="flex flex-col gap-0.5">
        <h1 className="m-0 text-[32px] leading-[1.1] font-bold tracking-[-0.02em]">{title}</h1>
        <span className="text-[13px] text-subtext1">{subtitle}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <InstinctPill />
        <label className="flex min-h-11 items-center gap-1.5 rounded-full border border-surface0 bg-base px-3.5 text-subtext1 sm:min-h-9">
          <Icon name="search" size={14} />
          <input
            type="search"
            placeholder="Search tasks, mail, notes"
            aria-label="Search"
            className="w-[170px] border-0 bg-transparent text-[13px] text-text outline-none placeholder:text-subtext1"
          />
        </label>
        <Button variant="primary" onClick={logToday}>
          Log Today
        </Button>
      </div>
    </header>
  );
}
