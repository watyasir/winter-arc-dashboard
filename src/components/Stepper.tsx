/** − / + pill stepper. 44px tall so it's easy to hit on a phone. */
export function Stepper({
  label,
  value,
  step,
  min = 0,
  max = Infinity,
  onChange,
}: {
  label: string;
  value: number;
  step: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}) {
  // Round to the step so 0.1 + 0.2 style float noise never shows up.
  const snap = (v: number) => Math.round(v / step) * step;
  const btn =
    "flex h-11 w-12 cursor-pointer items-center justify-center border-0 bg-transparent text-xl text-ink disabled:cursor-default disabled:text-disabled";
  return (
    <div role="group" aria-label={label} className="flex shrink-0 items-center rounded-full bg-fill-strong">
      <button type="button" aria-label={`Less ${label.toLowerCase()}`} className={btn} disabled={value <= min} onClick={() => onChange(Math.max(min, snap(value - step)))}>
        −
      </button>
      <span aria-hidden="true" className="h-[18px] w-px bg-line-strong" />
      <button type="button" aria-label={`More ${label.toLowerCase()}`} className={btn} disabled={value >= max} onClick={() => onChange(Math.min(max, snap(value + step)))}>
        +
      </button>
    </div>
  );
}
