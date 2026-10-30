import Link from "next/link";
import type { ReactNode } from "react";

const fills = {
  card: "bg-card text-ink",
  pop: "bg-pop text-ink",
  accent: "bg-accent-soft text-ink",
};

/**
 * The one tile every page uses (Soft bento): 20px corners, 1px border, soft shadow,
 * 16px padding on the phone and 20px from 640px up. The heading is the tile's one link
 * to its full page. `area` places it in the Overview bento grid.
 */
export function Tile({
  title,
  href,
  aside,
  fill = "card",
  area,
  className = "",
  children,
}: {
  title: string;
  /** The tile's full page. Omitted on a page's own tiles. */
  href?: string;
  /** Right of the heading: a count, a chip. */
  aside?: ReactNode;
  fill?: keyof typeof fills;
  area?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-label={title}
      style={area ? { gridArea: area } : undefined}
      className={`flex min-w-0 flex-col gap-3 overflow-hidden rounded-tile border border-line p-4 shadow-tile sm:p-5 ${fills[fill]} ${className}`}
    >
      <div className="flex min-h-6 items-center justify-between gap-2">
        <h2 className="m-0 text-sm font-semibold">
          {href ? (
            <Link href={href} prefetch className="-m-2 inline-flex min-h-11 items-center gap-1 rounded-item p-2 text-inherit no-underline hover:underline">
              {title}
              <span aria-hidden="true">→</span>
            </Link>
          ) : (
            title
          )}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

/** A big number with its unit: "58.4 kg". Numbers are JetBrains Mono. */
export function BigNumber({ value, unit, size = "lg" }: { value: string; unit?: string; size?: "md" | "lg" }) {
  return (
    <span className={`font-mono leading-none font-bold tracking-[-0.02em] ${size === "lg" ? "text-[32px]" : "text-2xl"}`}>
      {value}
      {unit && <span className="ml-1 font-sans text-sm font-semibold tracking-normal text-soft">{unit}</span>}
    </span>
  );
}
