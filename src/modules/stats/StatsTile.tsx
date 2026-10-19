"use client";

import { Sparkline } from "@/components/Sparkline";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { toneBg } from "@/lib/tones";

/** Row of key-number cards, each with a 7-day sparkline. */
export function StatsTile() {
  const { stats } = useDashboard().data;
  return (
    <section aria-label="Key numbers" className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
      {stats.map((s) => (
        <div key={s.label} className="flex min-w-0 flex-col gap-1.5 rounded-[20px] border border-sep bg-card p-4">
          <span className="flex items-center gap-1.5 text-xs font-semibold">
            <span aria-hidden="true" className={`size-2 rounded-full ${toneBg[s.tone]}`} />
            {s.label}
          </span>
          <span className="flex items-baseline gap-1">
            <span className="font-rounded text-[30px] font-bold">{s.value}</span>
            {s.unit && <span className="text-[13px] font-semibold text-sub">{s.unit}</span>}
          </span>
          <Sparkline values={s.trend} tone={s.tone} />
          <span className="text-xs text-sub">{s.note}</span>
        </div>
      ))}
    </section>
  );
}
