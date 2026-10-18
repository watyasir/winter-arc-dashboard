import type { ComponentPropsWithoutRef } from "react";

/** A flat base-coloured card with 16px corners on the crust frame. */
export function Card({ className = "", ...props }: ComponentPropsWithoutRef<"section">) {
  return <section className={`min-w-0 rounded-2xl bg-base p-5 ${className}`} {...props} />;
}
