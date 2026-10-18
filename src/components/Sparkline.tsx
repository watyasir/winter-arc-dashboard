import { toneStroke, type Tone } from "@/lib/tones";

/** 24px trend line, scaled to its own min and max. Decorative: the card text says the number. */
export function Sparkline({ values, tone }: { values: number[]; tone: Tone }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const points = values
    .map((v, i) => {
      const x = (i * 100) / (values.length - 1);
      const y = 21 - ((v - min) / (max - min || 1)) * 18;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="h-6 w-full" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        className={toneStroke[tone]}
      />
    </svg>
  );
}
