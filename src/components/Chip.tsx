import type { ReactNode } from "react";

const tones = {
  neutral: "bg-fill text-sub",
  me: "bg-brand/12 text-brand-text",
  claude: "bg-cyan/12 text-cyan-text",
  sage: "bg-sage/14 text-sage-text",
};

export type ChipTone = keyof typeof tones;

export function Chip({ tone = "neutral", children }: { tone?: ChipTone; children: ReactNode }) {
  return (
    <span className={`whitespace-nowrap rounded-full px-2.5 py-[3px] text-[11px] font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}
