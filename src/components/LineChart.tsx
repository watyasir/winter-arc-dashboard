"use client";

import { useState, type KeyboardEvent, type PointerEvent } from "react";
import type { Point } from "@/modules/types";
import { shortDate } from "@/lib/trackers";

/**
 * One small line chart, no library: accent line, soft area fill, 3 faint grid lines, min and max
 * on one scale, and a one-line summary for screen readers. Points need not be every day: x is by
 * date. Hover, drag or arrow keys scrub it: a vertical line, the point and "58.2 kg · 12 Nov".
 * It rests on the last point.
 */
export function LineChart({
  points,
  unit,
  summary,
  height = 96,
  digits = 1,
}: {
  points: Point[];
  unit: string;
  /** Said by screen readers instead of the drawing, e.g. "Weight up 0.6 kg in 14 days". */
  summary: string;
  height?: number;
  digits?: number;
}) {
  const [active, setActive] = useState<number | null>(null);
  const W = 300;
  const H = height;
  const pad = { top: 10, bottom: 8, left: 4, right: 6 };
  const values = points.map((p) => p.value);
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  // A flat line sits in the middle.
  const span = hi - lo || Math.max(1, Math.abs(hi) * 0.05);
  const base = hi === lo ? lo - span / 2 : lo;
  const t0 = Date.parse(points[0].date);
  const t1 = Date.parse(points.at(-1)!.date);
  const x = (d: string) => pad.left + (t1 === t0 ? (W - pad.left - pad.right) / 2 : ((Date.parse(d) - t0) / (t1 - t0)) * (W - pad.left - pad.right));
  const y = (v: number) => pad.top + (1 - (v - base) / span) * (H - pad.top - pad.bottom);
  const line = points.map((p) => `${x(p.date).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const area = `${x(points[0].date).toFixed(1)},${H - pad.bottom} ${line} ${x(points.at(-1)!.date).toFixed(1)},${H - pad.bottom}`;
  const fmt = (v: number) => `${v.toLocaleString("en-IN", { maximumFractionDigits: digits })}${unit ? ` ${unit}` : ""}`;

  const at = active ?? points.length - 1;
  const point = points[at];
  const left = (x(point.date) / W) * 100;

  const scrub = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    let best = 0;
    points.forEach((p, i) => {
      if (Math.abs(x(p.date) - px) < Math.abs(x(points[best].date) - px)) best = i;
    });
    setActive(best);
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowRight: 1, ArrowLeft: -1, Home: -points.length, End: points.length }[e.key];
    if (step === undefined) return;
    e.preventDefault();
    setActive(Math.min(points.length - 1, Math.max(0, at + step)));
  };

  return (
    <figure className="m-0 flex min-w-0 flex-1 flex-col gap-1">
      <div
        tabIndex={0}
        role="group"
        aria-label={`${summary}. Arrow keys read each day.`}
        onPointerMove={scrub}
        onPointerDown={scrub}
        onPointerLeave={() => setActive(null)}
        onKeyDown={onKey}
        onBlur={() => setActive(null)}
        className="relative min-h-0 flex-1 touch-pan-y rounded-item"
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true" className="block h-full w-full" style={{ minHeight: 48 }}>
          {[0, 0.5, 1].map((f) => (
            <line
              key={f}
              x1={0}
              x2={W}
              y1={pad.top + f * (H - pad.top - pad.bottom)}
              y2={pad.top + f * (H - pad.top - pad.bottom)}
              className="stroke-ink/10"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {points.length > 1 && <polygon points={area} className="fill-accent/15" />}
          {points.length > 1 && (
            <polyline points={line} fill="none" className="stroke-accent" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          )}
        </svg>
        {/* The scrub line, point and readout as HTML, so they stay crisp when the chart stretches. */}
        <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 w-px bg-accent/40" style={{ left: `${left}%` }} />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-accent shadow-tile"
          style={{ left: `${left}%`, top: `${(y(point.value) / H) * 100}%` }}
        />
        <span
          aria-live="polite"
          className="pointer-events-none absolute top-0 rounded-full bg-hero px-2.5 py-1 font-mono text-[11px] font-bold whitespace-nowrap text-white"
          style={left > 60 ? { right: `${100 - left}%`, marginRight: 8 } : { left: `${left}%`, marginLeft: 8 }}
        >
          {fmt(point.value)} · {shortDate(point.date)}
        </span>
      </div>
      <figcaption aria-hidden="true" className="flex justify-between gap-2 font-mono text-[11px] font-bold text-soft">
        <span>
          {shortDate(points[0].date)} · min {fmt(lo)}
        </span>
        <span>max {fmt(hi)}</span>
      </figcaption>
    </figure>
  );
}

/** "up 0.6 kg", "down 1,200 steps", "no change" between the first and last point. */
export function changeWords(points: Point[], unit: string, digits = 1): string {
  if (points.length < 2) return "no change";
  const d = Math.round((points.at(-1)!.value - points[0].value) * 10 ** digits) / 10 ** digits;
  if (d === 0) return "no change";
  return `${d > 0 ? "up" : "down"} ${Math.abs(d).toLocaleString("en-IN")}${unit ? ` ${unit}` : ""}`;
}
