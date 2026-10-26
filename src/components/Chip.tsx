import type { ReactNode } from "react";

const tones = {
  neutral: "bg-fill text-sub",
  me: "bg-yasir/16 text-brand-text",
  claude: "bg-claude/14 text-claude-text",
  sage: "bg-sage/14 text-sage-text",
  yellow: "bg-yellow/16 text-yellow-text",
  coral: "bg-coral/12 text-coral-text",
  brand: "bg-brand/12 text-brand-text",
};

export type ChipTone = keyof typeof tones;

export function Chip({ tone = "neutral", children }: { tone?: ChipTone; children: ReactNode }) {
  return (
    <span className={`whitespace-nowrap rounded-full px-2.5 py-[3px] text-[11px] font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}
