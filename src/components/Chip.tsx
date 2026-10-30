import type { ReactNode } from "react";

const tones = {
  neutral: "bg-fill-strong text-ink",
  yasir: "bg-yasir text-white",
  claude: "bg-claude text-ink",
  ok: "bg-ok-soft text-ok",
  warn: "bg-warn-soft text-warn",
  danger: "bg-danger-soft text-danger",
  accent: "bg-accent-faint text-accent",
};

export type ChipTone = keyof typeof tones;

export function Chip({ tone = "neutral", children }: { tone?: ChipTone; children: ReactNode }) {
  return (
    <span className={`whitespace-nowrap rounded-full px-2.5 py-[3px] text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}
