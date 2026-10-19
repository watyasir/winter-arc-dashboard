/** iOS-style switch row: the whole row toggles. Green when on. */
export function SwitchRow({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className="flex min-h-11 w-full cursor-pointer items-center justify-between border-0 border-t border-solid border-sep bg-transparent p-0 text-left text-sm text-ink"
    >
      <span>{label}</span>
      <span
        aria-hidden="true"
        className={`flex h-7 w-[46px] items-center rounded-full p-0.5 transition-colors motion-reduce:transition-none ${
          on ? "justify-end bg-sage" : "justify-start bg-fill-strong"
        }`}
      >
        <span className="size-6 rounded-full bg-white" />
      </span>
    </button>
  );
}
