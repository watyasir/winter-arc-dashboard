import type { Point } from "@/modules/types";
import { shortDate } from "@/lib/trackers";

/**
 * One small line chart, no library: 2px line, soft area fill, 3 faint grid lines, the last
 * point emphasised, min and max on one scale, and a one-line summary for screen readers.
 * Theme colours only (stroke-accent, fill-accent-soft). Points need not be every day: x is by date.
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
  const W = 300;
  const H = height;
  const pad = { top: 8, bottom: 8, left: 2, right: 6 };
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
  const last = points.at(-1)!;
  const fmt = (v: number) => `${v.toLocaleString("en-IN", { maximumFractionDigits: digits })}${unit ? ` ${unit}` : ""}`;

  return (
    <figure className="m-0 flex min-w-0 flex-1 flex-col gap-1">
      <div className="relative min-h-0 flex-1">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={summary} className="block h-full w-full" style={{ minHeight: 48 }}>
          {[0, 0.5, 1].map((f) => (
            <line
              key={f}
              x1={0}
              x2={W}
              y1={pad.top + f * (H - pad.top - pad.bottom)}
              y2={pad.top + f * (H - pad.top - pad.bottom)}
              className="stroke-line"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {points.length > 1 && <polygon points={area} className="fill-accent-soft/20" />}
          {points.length > 1 && (
            <polyline points={line} fill="none" className="stroke-accent" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          )}
        </svg>
        {/* The last point as an HTML dot, so it stays round when the chart stretches. */}
        <span
          aria-hidden="true"
          className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-accent"
          style={{ left: `${(x(last.date) / W) * 100}%`, top: `${(y(last.value) / H) * 100}%` }}
        />
      </div>
      <figcaption aria-hidden="true" className="flex justify-between gap-2 font-mono text-xs text-soft">
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
