import type { ComponentPropsWithoutRef } from "react";

/** Blue text link-style button ("Open Inbox", "Open Board"). */
export function TextButton({ className = "", ...props }: ComponentPropsWithoutRef<"button">) {
  return (
    <button
      type="button"
      className={`-mx-2 min-h-11 cursor-pointer rounded-md border-0 bg-transparent px-2 text-[13px] font-semibold text-blue-text hover:text-blue-hover sm:min-h-0 ${className}`}
      {...props}
    />
  );
}
