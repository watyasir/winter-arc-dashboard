"use client";

import { Card } from "@/components/Card";
import { ProgressBar } from "@/components/ProgressBar";
import { CardHeader, SectionHeading } from "@/components/SectionHeading";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { formatRupees } from "@/lib/format";

export function MoneyTile() {
  const { money } = useDashboard().data;
  const { needs, wants, savings } = money.split;
  return (
    <Card aria-label="Money" className="flex flex-[1_1_280px] flex-col gap-3">
      <CardHeader aside={<span className="text-xs text-subtext1">Updated {money.updated}</span>}>
        <SectionHeading tone="green">Money · {money.month}</SectionHeading>
      </CardHeader>
      <div>
        <div className="text-xs text-subtext1">Saved so far</div>
        <div className="font-rounded text-[32px] font-bold text-green-text">{formatRupees(money.income - money.spent)}</div>
        <div className="text-xs text-subtext1">
          {formatRupees(money.income)} in · {formatRupees(money.spent)} out
        </div>
      </div>
      <div
        role="img"
        aria-label={`Spending split: ${needs}% needs, ${wants}% wants, ${savings}% savings`}
        className="flex h-2.5 gap-0.5 overflow-hidden rounded-full"
      >
        <div className="bg-blue" style={{ width: `${needs}%` }} />
        <div className="bg-peach" style={{ width: `${wants}%` }} />
        <div className="bg-green" style={{ width: `${savings}%` }} />
      </div>
      <div className="grid grid-cols-3 gap-1.5 text-xs text-subtext1" aria-hidden="true">
        <span><strong className="text-text">{needs}%</strong> needs</span>
        <span><strong className="text-text">{wants}%</strong> wants</span>
        <span><strong className="text-text">{savings}%</strong> savings</span>
      </div>
      <div className="flex flex-col gap-1.5 border-t border-surface0 pt-2.5">
        <div className="flex justify-between text-[13px]">
          <span className="font-semibold">{money.fund.name}</span>
          <span className="text-xs text-subtext1">
            {money.fund.pct}% · {formatRupees(money.fund.target)}
          </span>
        </div>
        <ProgressBar pct={money.fund.pct} tone="teal" label={`${money.fund.name}: ${money.fund.pct}%`} />
      </div>
    </Card>
  );
}
