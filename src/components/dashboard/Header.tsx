"use client";

import Link from "next/link";
import { Icon } from "@/components/Icon";
import { useDashboard } from "./DashboardContext";

/** Page header card with the dashed bottom rule. */
export function Header() {
  const { data, view } = useDashboard();
  const { title, subtitle } = data.views[view];

  return (
    <header className="flex flex-wrap items-center justify-between gap-3.5 rounded-t-2xl rounded-b-md border border-b-2 border-sep border-b-rule [border-bottom-style:dashed] bg-base px-5 py-4">
      <div className="flex flex-col gap-0.5">
        <h1 className="m-0 text-[32px] leading-[1.1] font-bold tracking-[-0.02em]">{title}</h1>
        <span className="text-[13px] text-sub">{subtitle}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <label className="flex min-h-11 items-center gap-1.5 rounded-full border border-sep bg-base px-3.5 text-sub sm:min-h-9">
          <Icon name="search" size={14} />
          <input
            type="search"
            placeholder="Search tasks and notes"
            aria-label="Search"
            className="w-[170px] border-0 bg-transparent text-[13px] text-ink outline-none placeholder:text-sub"
          />
        </label>
        <Link
          href={data.logHref}
          className="flex min-h-11 items-center rounded-full bg-brand px-4 text-[13px] font-semibold text-white no-underline hover:bg-brand-hover hover:text-white sm:min-h-9"
        >
          Log Today
        </Link>
      </div>
    </header>
  );
}
