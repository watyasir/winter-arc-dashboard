"use client";

import { Card } from "@/components/Card";
import { Chip } from "@/components/Chip";
import { CardHeader, SectionHeading } from "@/components/SectionHeading";
import { EmptyNote } from "@/components/EmptyNote";
import { PillLink } from "@/components/PillLink";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { kg } from "@/lib/body";

/** Life Overview's Body tile (v6.1): latest weight, change, a small trend line against the goal, the weekly check. */
export function BodyTile({ className = "flex-[1_1_280px]" }: { className?: string }) {
  const { weight, bodyCheck } = useDashboard().data;
  const values = weight?.values ?? [];
  const goal = weight?.goal ?? null;

  if (!weight || values.length < 2) {
    return (
      <Card aria-label="Body" className={`flex flex-col gap-3 ${className}`}>
        <SectionHeading tone="mist">Body</SectionHeading>
        <EmptyNote>
          {bodyCheck.lastLabel
            ? "One weigh-in so far. The trend starts after your next weekly body check."
            : "No weigh-ins yet. Do a body check once a week and your weight shows here."}
        </EmptyNote>
        <CheckFooter />
      </Card>
    );
  }

  const first = values[0];
  const last = values[values.length - 1];
  const change = last - first;
  const towardGoal = goal != null && change !== 0 && Math.sign(change) === Math.sign(goal - first);
  const [lo, hi] = weight.axis;
  const y = (v: number) => 64 - ((v - lo) / (hi - lo)) * 58;
  const line = values.map((v, i) => `${((i * 300) / (values.length - 1)).toFixed(1)},${y(v).toFixed(1)}`).join(" ");

  return (
    <Card aria-label="Body" className={`flex flex-col gap-1.5 ${className}`}>
      <CardHeader aside={goal != null && <span className="text-xs text-sub">goal {kg(goal)} {weight.unit}</span>}>
        <SectionHeading tone="mist">Body</SectionHeading>
      </CardHeader>
      <span className="font-rounded text-[28px] font-bold">
        {last.toFixed(1)} {weight.unit}
      </span>
      <span className={`text-xs font-semibold ${towardGoal ? "text-sage-text" : "text-sub"}`}>
        {change === 0 ? "No change" : `${change > 0 ? "▲" : "▼"} ${Math.abs(change).toFixed(1)} ${weight.unit}`} since {weight.startLabel}
      </span>
      <svg
        viewBox="0 0 300 70"
        className="mt-1 h-auto w-full"
        role="img"
        aria-label={`Weight went from ${first.toFixed(1)} to ${last.toFixed(1)} ${weight.unit} since ${weight.startLabel}.${goal != null ? ` Goal ${kg(goal)} ${weight.unit}.` : ""}`}
      >
        {goal != null && <line x1={0} x2={300} y1={y(goal)} y2={y(goal)} strokeDasharray="4 4" className="stroke-sage" />}
        <polyline points={line} fill="none" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" className="stroke-brand" />
      </svg>
      <CheckFooter />
    </Card>
  );
}

/** Last check date (with a "Due" chip after 7 days) and the link to the weekly body check. */
function CheckFooter() {
  const { bodyCheck, bodyHref } = useDashboard().data;
  return (
    <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1">
      <span className="flex items-center gap-2 text-xs text-sub">
        {bodyCheck.lastLabel ? `Last body check · ${bodyCheck.lastLabel}` : "No body check yet"}
        {bodyCheck.due && bodyCheck.lastLabel && <Chip tone="yellow">Due</Chip>}
      </span>
      <PillLink href={bodyHref}>Weekly body check</PillLink>
    </div>
  );
}
