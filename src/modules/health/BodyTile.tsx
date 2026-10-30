"use client";

import { Chip } from "@/components/Chip";
import { EmptyNote } from "@/components/EmptyNote";
import { PillLink } from "@/components/PillLink";
import { Tile } from "@/components/Tile";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { kg } from "@/lib/body";

/** The weekly body check: latest measurements with the change since the one before, and when it's due. */
export function BodyTile() {
  const { bodyCheck, bodyHref, weight } = useDashboard().data;
  return (
    <Tile title="Body check" tone="fund" aside={bodyCheck.due && bodyCheck.lastLabel ? <Chip tone="warn">Due</Chip> : undefined}>
      {bodyCheck.measures.length === 0 ? (
        <EmptyNote>No measurements yet. Do the weekly body check and waist, chest and arms show here.</EmptyNote>
      ) : (
        <dl className="m-0 grid grid-cols-3 gap-2">
          {bodyCheck.measures.map((m) => (
            <div key={m.label} className="flex min-w-0 flex-col rounded-item border border-line bg-fill p-3">
              <dt className="text-xs text-soft">{m.label}</dt>
              <dd className="m-0 font-mono text-base font-bold">{m.value}</dd>
              {m.change != null && m.change !== 0 && (
                <dd className="m-0 text-xs text-soft">
                  {m.change > 0 ? "▲" : "▼"} {Math.abs(m.change)} cm
                </dd>
              )}
            </div>
          ))}
        </dl>
      )}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-soft">
          {bodyCheck.lastLabel ? `Last check · ${bodyCheck.lastLabel}` : "No body check yet"}
          {weight.goal != null && ` · goal ${kg(weight.goal)} kg`}
        </span>
        <PillLink href={bodyHref}>Weekly body check</PillLink>
      </div>
    </Tile>
  );
}
