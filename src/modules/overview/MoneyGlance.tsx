"use client";

import { EmptyNote } from "@/components/EmptyNote";
import { BigNumber, Tile } from "@/components/Tile";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { viewHref } from "@/components/dashboard/Nav";
import { formatRupees } from "@/lib/format";
import type { Account } from "@/modules/types";

const fills: Record<Account["kind"], string> = {
  savings: "bg-accent-soft",
  current: "bg-pop",
  card: "bg-card",
  other: "bg-fill-strong",
};

/** The wallet at a glance: each account as a stacked card, what's left to spend, when it was updated. */
export function MoneyGlance() {
  const { data } = useDashboard();
  const money = data.money;
  const href = viewHref(data.basePath, "money");
  if (!money) {
    return (
      <Tile title="Money" href={href} area="money">
        <EmptyNote>Shows once the finance task sends its first snapshot.</EmptyNote>
      </Tile>
    );
  }
  const banks = money.accounts.filter((a) => a.kind !== "card").slice(0, 3);
  return (
    <Tile title="Money" href={href} area="money">
      <ul className="m-0 flex list-none flex-col p-0">
        {banks.map((a, i) => (
          <li
            key={a.id}
            className={`flex items-baseline justify-between gap-2 rounded-item border border-line px-3 py-2.5 text-sm font-semibold ${fills[a.kind]} ${i ? "-mt-2" : ""}`}
          >
            <span className="min-w-0 truncate">{a.name}</span>
            <span className="font-mono">{formatRupees(a.balance)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto flex flex-col gap-1">
        <BigNumber value={formatRupees(money.spendable)} size="md" />
        <span className="text-sm text-soft">Left to spend · updated {money.updated}</span>
      </div>
    </Tile>
  );
}
