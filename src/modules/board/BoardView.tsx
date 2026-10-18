"use client";

import { useDashboard } from "@/components/dashboard/DashboardContext";
import { Chip } from "@/components/Chip";
import { toneBg } from "@/lib/tones";
import type { BoardCard } from "@/modules/types";
import { OwnerChip } from "./OwnerChip";

const dueColor = { soon: "text-peach-text", overdue: "text-red-text" };

/** Four columns on mantle. Demo only; real tasks arrive in Phase 5. */
export function BoardView() {
  const { board } = useDashboard().data;
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-3.5">
      {board.map((col) => (
        <section key={col.name} aria-label={col.name} className="flex min-w-0 flex-col gap-2 rounded-2xl bg-mantle p-3">
          <div className="flex items-center justify-between px-1.5 py-1">
            <h2 className="m-0 flex items-center gap-2 text-sm font-bold">
              <span aria-hidden="true" className={`size-[9px] rounded-full ${toneBg[col.tone]}`} />
              {col.name}
            </h2>
            <Chip>{col.count}</Chip>
          </div>
          {col.cards.map((k) => (
            <TaskCard key={k.title} card={k} />
          ))}
          <button
            type="button"
            className="min-h-11 cursor-pointer rounded-xl border border-dashed border-overlay0 bg-transparent text-xs font-semibold text-subtext1 hover:bg-fill sm:min-h-[38px]"
          >
            Add task
          </button>
        </section>
      ))}
    </div>
  );
}

function TaskCard({ card }: { card: BoardCard }) {
  return (
    <div className="flex flex-col gap-2 rounded-[10px] border border-surface0 bg-base px-3 py-[11px]">
      <span className={`text-[13px] leading-[1.35] font-medium ${card.done ? "text-subtext1" : ""}`}>
        {card.done && <span className="sr-only">Done: </span>}
        {card.title}
      </span>
      <div className="flex flex-wrap items-center gap-1.5">
        <OwnerChip owner={card.owner} />
        <span className="text-xs text-subtext1">{card.area}</span>
        {card.due && (
          <span className={`ml-auto text-[11px] font-semibold ${card.dueState ? dueColor[card.dueState] : "text-subtext1"}`}>
            {card.dueState === "overdue" ? "Overdue · " : "Due "}
            {card.due}
          </span>
        )}
      </div>
    </div>
  );
}
