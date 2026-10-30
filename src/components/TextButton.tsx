import type { ComponentPropsWithoutRef } from "react";

/** Blue text link-style button ("Open Board"). */
export function TextButton({ className = "", ...props }: ComponentPropsWithoutRef<"button">) {
  return (
    <button
      type="button"
      className={`-mx-2 min-h-11 cursor-pointer rounded-full border-0 bg-transparent px-2 text-[13px] font-semibold text-accent hover:text-accent-strong sm:min-h-0 ${className}`}
      {...props}
    />
  );
}
