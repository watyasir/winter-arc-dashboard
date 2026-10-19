import { Icon } from "./Icon";

/** Rounded-square checkbox look (not an input: the whole row is the control). */
export function CheckBox({ checked, size = 22 }: { checked: boolean; size?: 18 | 22 }) {
  const box = size === 18 ? "size-[18px] rounded-[5px]" : "size-[22px] rounded-md";
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center transition-colors motion-reduce:transition-none ${box} ${
        checked ? "bg-sage" : "border-[1.5px] border-overlay bg-transparent"
      }`}
    >
      {checked && <Icon name="check" size={size === 18 ? 10 : 12} strokeWidth={3.6} className="stroke-white" />}
    </span>
  );
}
