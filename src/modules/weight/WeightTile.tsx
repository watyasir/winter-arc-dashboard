"use client";

import { Card } from "@/components/Card";
import { CardHeader, SectionHeading } from "@/components/SectionHeading";
import { useDashboard } from "@/components/dashboard/DashboardContext";

// Chart geometry (viewBox 560 x 180). Plot runs x 10..510, y 20 (top of axis) .. 150 (bottom).
const X0 = 10;
const X1 = 510;
const Y_TOP = 20;
const Y_BOTTOM = 150;

/** Weight line chart: summary line above, Y labels on the right, dashed goal line. */
export function WeightTile() {
  const { weight } = useDashboard().data;
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

  return (
    <Card aria-label="Weight" className="flex flex-[2_1_480px] flex-col gap-1">
      <CardHeader aside={<span className="text-xs text-subtext1">{weight.rangeLabel} · goal {weight.goal} {unit}</span>}>
        <SectionHeading tone="sky">Weight</SectionHeading>
      </CardHeader>
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="font-rounded text-[26px] font-bold">
          {last.toFixed(1)} {unit}
        </span>
        <span className="text-[13px] font-semibold text-green-text">
          {change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(1)} {unit} since {weight.startLabel}
        </span>
      </div>
      <svg
        viewBox="0 0 560 180"
        className="h-auto w-full text-[18px] sm:text-[11px]"
        role="img"
        aria-label={`Weight went from ${first.toFixed(1)} ${unit} to ${last.toFixed(1)} ${unit} over ${weight.rangeLabel}. Goal is ${weight.goal} ${unit}.`}
      >
        {[hi, mid, lo].map((v) => (
          <g key={v}>
            <line x1={X0} x2={X1} y1={y(v)} y2={y(v)} className="stroke-surface0" />
            <text x={518} y={y(v) + 4} className="fill-subtext1">
              {v}
            </text>
          </g>
        ))}
        <line
          x1={X0}
          x2={X1}
          y1={y(weight.goal)}
          y2={y(weight.goal)}
          strokeWidth={1.5}
          strokeDasharray="4 4"
          className="stroke-green"
        />
        <text x={14} y={y(weight.goal) - 5} className="fill-green-text font-semibold">
          Goal {weight.goal} {unit}
        </text>
        <polygon points={`${line} ${X1},${Y_BOTTOM} ${X0},${Y_BOTTOM}`} className="fill-blue/10" />
        <polyline points={line} fill="none" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" className="stroke-blue" />
        {pts.map(([px, py], i) => (
          <circle key={i} cx={px} cy={py} r={3.5} strokeWidth={2} className="fill-white stroke-blue" />
        ))}
        <text x={X0} y={172} className="fill-subtext1">
          {weight.startLabel}
        </text>
        <text x={X1} y={172} textAnchor="end" className="fill-subtext1">
          This week
        </text>
      </svg>
    </Card>
  );
}
