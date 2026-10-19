import type { ReactNode } from "react";

/** What a tile says when there's nothing to show yet. Always names the next step (DESIGN.md §7). */
export function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="m-0 text-[13px] leading-[1.45] text-sub">{children}</p>;
}
