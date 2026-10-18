import type { ReactNode } from "react";

const tones = {
  neutral: "bg-fill text-subtext1",
  me: "bg-blue/12 text-blue-text",
  claude: "bg-pink/12 text-pink-text",
  green: "bg-green/14 text-green-text",
};

export type ChipTone = keyof typeof tones;

export function Chip({ tone = "neutral", children }: { tone?: ChipTone; children: ReactNode }) {
  return (
    <span className={`whitespace-nowrap rounded-md px-2 py-[3px] text-[11px] font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}
