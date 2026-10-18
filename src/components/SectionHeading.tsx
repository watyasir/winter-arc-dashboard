import type { ReactNode } from "react";
import { toneBg, type Tone } from "@/lib/tones";

/** Card title with the small 4px rainbow-folder bar in front. */
export function SectionHeading({ tone = "blue", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <h2 className="m-0 flex items-center gap-2 text-[15px] font-bold tracking-[-0.01em]">
      <span aria-hidden="true" className={`h-[15px] w-1 rounded-sm ${toneBg[tone]}`} />
      {children}
    </h2>
  );
}

/** The heading row most cards use: title on the left, a note or link on the right. */
export function CardHeader({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      {children}
      {aside}
    </div>
  );
}
