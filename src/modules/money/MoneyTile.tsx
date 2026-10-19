"use client";

import { Card } from "@/components/Card";
import { ProgressBar } from "@/components/ProgressBar";
import { CardHeader, SectionHeading } from "@/components/SectionHeading";
import { EmptyNote } from "@/components/EmptyNote";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { formatRupees } from "@/lib/format";
import { WalletStack } from "./WalletStack";

export function MoneyTile() {
  const { money } = useDashboard().data;
  if (!money) {
    return (
      <Card aria-label="Money" className="flex flex-[1_1_280px] flex-col gap-3">
        <SectionHeading tone="sage">Money</SectionHeading>
        <EmptyNote>Your accounts and monthly split show here once the Personal Finance sheet is connected.</EmptyNote>
      </Card>
    );
  }
  const { needs, wants, savings } = money.split;
  return (
    <Card aria-label="Money" className="flex flex-[1_1_280px] flex-col gap-3">
      <CardHeader aside={<span className="text-xs text-sub">Updated {money.updated}</span>}>
        <SectionHeading tone="sage">Money · {money.month}</SectionHeading>
      </CardHeader>
      <WalletStack accounts={money.accounts} savedThisMonth={money.income - money.spent} />
      <div
        role="img"
        aria-label={`Spending split: ${needs}% needs, ${wants}% wants, ${savings}% savings`}
        className="flex h-2.5 gap-0.5 overflow-hidden rounded-full"
      >
        <div className="bg-brand" style={{ width: `${needs}%` }} />
        <div className="bg-yellow" style={{ width: `${wants}%` }} />
        <div className="bg-sage" style={{ width: `${savings}%` }} />
      </div>
      <div className="grid grid-cols-3 gap-1.5 text-xs text-sub" aria-hidden="true">
        <span><strong className="text-ink">{needs}%</strong> needs</span>
        <span><strong className="text-ink">{wants}%</strong> wants</span>
        <span><strong className="text-ink">{savings}%</strong> savings</span>
      </div>
      <div className="flex flex-col gap-1.5 border-t border-sep pt-2.5">
        <div className="flex justify-between text-[13px]">
          <span className="font-semibold">{money.fund.name}</span>
          <span className="text-xs text-sub">
            {money.fund.pct}% · {formatRupees(money.fund.target)}
          </span>
        </div>
        <ProgressBar pct={money.fund.pct} tone="pine" label={`${money.fund.name}: ${money.fund.pct}%`} />
      </div>
    </Card>
  );
}
