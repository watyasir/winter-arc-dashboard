"use client";

import { Card } from "@/components/Card";
import { CardHeader, SectionHeading } from "@/components/SectionHeading";
import { Chip } from "@/components/Chip";
import { EmptyNote } from "@/components/EmptyNote";
import { PillLink } from "@/components/PillLink";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { kg } from "@/lib/body";

// Chart geometry (viewBox 560 x 180). Plot runs x 10..510, y 20 (top of axis) .. 150 (bottom).
const X0 = 10;
const X1 = 510;
const Y_TOP = 20;
const Y_BOTTOM = 150;

/** Weight line chart vs the goal (summary line above, Y labels on the right), latest measurements, weekly check link. */
export function WeightTile() {
  const { weight, bodyCheck } = useDashboard().data;
  if (!weight || weight.values.length < 2) {
    return (
      <Card aria-label="Weight" className="flex flex-[2_1_480px] flex-col gap-3">
        <SectionHeading tone="mist">Weight</SectionHeading>
        <EmptyNote>
          {bodyCheck.lastLabel
            ? "One weigh-in so far. The chart starts after your next weekly body check."
            : "No weigh-ins yet. Do a body check once a week; the chart starts after the second one."}
        </EmptyNote>
        <Measures />
        <CheckFooter />
      </Card>
    );
  }
  const [lo, hi] = weight.axis;
  const y = (v: number) => Y_BOTTOM - ((v - lo) / (hi - lo)) * (Y_BOTTOM - Y_TOP);
  const x = (i: number) => X0 + (i * (X1 - X0)) / (weight.values.length - 1);
  const pts = weight.values.map((v, i) => [x(i), y(v)] as const);
  const line = pts.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(" ");
  const first = weight.values[0];
  const last = weight.values[weight.values.length - 1];
  const change = last - first;
  const mid = (lo + hi) / 2;
  const unit = weight.unit;
  const goal = weight.goal;
  // Sage when the change heads toward the goal; plain grey otherwise (or with no goal).
  const towardGoal = goal != null && change !== 0 && Math.sign(change) === Math.sign(goal - first);

  return (
    <Card aria-label="Weight" className="flex flex-[2_1_480px] flex-col gap-1">
      <CardHeader aside={<span className="text-xs text-sub">
            {weight.rangeLabel}
            {goal != null && ` · goal ${kg(goal)} ${unit}`}
          </span>}>
        <SectionHeading tone="mist">Weight</SectionHeading>
      </CardHeader>
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="font-rounded text-[26px] font-bold">
          {last.toFixed(1)} {unit}
        </span>
        <span className={`text-[13px] font-semibold ${towardGoal ? "text-sage-text" : "text-sub"}`}>
          {change === 0 ? "No change" : `${change > 0 ? "▲" : "▼"} ${Math.abs(change).toFixed(1)} ${unit}`} since {weight.startLabel}
        </span>
      </div>
      <svg
        viewBox="0 0 560 180"
        className="h-auto w-full text-[18px] sm:text-[11px]"
        role="img"
        aria-label={`Weight went from ${first.toFixed(1)} ${unit} to ${last.toFixed(1)} ${unit} over ${weight.rangeLabel}.${goal != null ? ` Goal is ${kg(goal)} ${unit}.` : ""}`}
      >
        {[hi, mid, lo].map((v) => (
          <g key={v}>
            <line x1={X0} x2={X1} y1={y(v)} y2={y(v)} className="stroke-sep" />
            <text x={518} y={y(v) + 4} className="fill-sub">
              {v}
            </text>
          </g>
        ))}
        {goal != null && (
          <>
            <line x1={X0} x2={X1} y1={y(goal)} y2={y(goal)} strokeWidth={1.5} strokeDasharray="4 4" className="stroke-sage" />
            <text x={14} y={y(goal) - 5} className="fill-sage-text font-semibold">
              Goal {kg(goal)} {unit}
            </text>
          </>
        )}
        <polygon points={`${line} ${X1},${Y_BOTTOM} ${X0},${Y_BOTTOM}`} className="fill-brand/10" />
        <polyline points={line} fill="none" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" className="stroke-brand" />
        {pts.map(([px, py], i) => (
          <circle key={i} cx={px} cy={py} r={3.5} strokeWidth={2} className="fill-white stroke-brand" />
        ))}
        <text x={X0} y={172} className="fill-sub">
          {weight.startLabel}
        </text>
        <text x={X1} y={172} textAnchor="end" className="fill-sub">
          {weight.endLabel}
        </text>
      </svg>
      <Measures />
      <CheckFooter />
    </Card>
  );
}

/** Latest waist, chest and arms, with the change since the check before. */
function Measures() {
  const { measures } = useDashboard().data.bodyCheck;
  if (measures.length === 0) return null;
  return (
    <dl className="m-0 flex flex-wrap gap-x-6 gap-y-1 border-t border-solid border-sep pt-2.5">
      {measures.map((m) => (
        <div key={m.label} className="flex items-baseline gap-1.5">
          <dt className="text-xs text-sub">{m.label}</dt>
          <dd className="m-0 text-[13px] font-semibold">
            {m.value}
            {m.change ? (
              <span className="ml-1 text-xs font-normal text-sub">
                {m.change > 0 ? "▲" : "▼"} {kg(Math.abs(m.change))}
              </span>
            ) : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** When the last weekly check was, a "Due" chip once a week has passed, and the link to do it. */
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
