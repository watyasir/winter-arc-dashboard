"use client";

import Link from "next/link";
import { PillLink } from "@/components/PillLink";
import { ArcChip } from "./ArcChip";
import { useDashboard } from "./DashboardContext";

/** Page header card with the dashed bottom rule. The Winter Arc chip on every page but Winter Arc itself. */
export function Header() {
  const { data, view, setView } = useDashboard();
  const { title, subtitle } = data.views[view];

  return (
    <header className="flex flex-wrap items-center justify-between gap-3.5 rounded-t-2xl rounded-b-md border border-b-2 border-sep border-b-rule [border-bottom-style:dashed] bg-base px-5 py-4">
      <div className="flex flex-col gap-0.5">
        <h1 className="m-0 text-[32px] leading-[1.1] font-bold tracking-[-0.02em]">{title}</h1>
        <span className="text-[13px] text-sub">{subtitle}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        {view === "arc" ? data.season && <PillLink href={data.shareHref}>Share card</PillLink> : <ArcChip onOpen={() => setView("arc")} />}
        <Link
          href={data.logHref}
          prefetch
          className="flex min-h-11 items-center rounded-full bg-brand px-4 text-[13px] font-semibold text-white no-underline hover:bg-brand-hover hover:text-white sm:min-h-9"
        >
          Log Today
        </Link>
      </div>
    </header>
  );
}
