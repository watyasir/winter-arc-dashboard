import { toneBg, type Tone } from "@/lib/tones";

export function ProgressBar({ pct, tone, label }: { pct: number; tone: Tone; label: string }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-1.5 overflow-hidden rounded-full bg-fill"
    >
      <div className={`h-full rounded-full ${toneBg[tone]}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
