/** iOS-style switch row: the whole row toggles. Sage when on. */
export function SwitchRow({
  label,
  on,
  onToggle,
  large,
}: {
  label: string;
  on: boolean;
  onToggle: () => void;
  /** Phone check-in size: 52px row, 17px text. */
  large?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={`flex w-full cursor-pointer items-center justify-between border-0 border-t border-solid border-line bg-transparent p-0 text-left text-ink ${large ? "min-h-[52px] text-[17px]" : "min-h-11 text-sm"}`}
    >
      <span>{label}</span>
      <span
        aria-hidden="true"
        className={`flex h-7 w-[46px] items-center rounded-full p-0.5 transition-colors motion-reduce:transition-none ${
          on ? "justify-end bg-accent-soft" : "justify-start bg-fill-strong"
        }`}
      >
        <span className="size-6 rounded-full bg-white" />
      </span>
    </button>
  );
}
