import { toneBg, type Tone } from "@/lib/tones";

/** A thin bar that grows in from 0 when it first shows (CSS only; instant with reduced motion). */
export function ProgressBar({ pct, tone, label, thick = false }: { pct: number; tone: Tone; label: string; thick?: boolean }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`shrink-0 overflow-hidden rounded-full bg-ink/10 ${thick ? "h-3" : "h-1.5"}`}
    >
      <div
        className={`h-full w-(--pct) rounded-full transition-[width] duration-700 ease-out starting:w-0 ${toneBg[tone]}`}
        style={{ ["--pct" as string]: `${pct}%` }}
      />
    </div>
  );
}
