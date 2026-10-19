import Link from "next/link";

/** Under the check-in: the two longer logs that don't belong in the 60-second daily sheet. */
export function MoreLogs({ workoutHref, bodyHref }: { workoutHref: string; bodyHref: string }) {
  const row = "flex min-h-[52px] items-center justify-between border-t border-solid border-sep text-[17px] text-ink no-underline first:border-t-0 hover:text-ink";
  return (
    <nav aria-label="More to log" className="flex flex-col gap-1.5">
      <h2 className="m-0 ml-4 text-[13px] font-normal text-sub">More to log</h2>
      <div className="rounded-[14px] border border-sep bg-card px-4">
        <Link href={workoutHref} className={row}>
          Log a workout <span aria-hidden="true" className="text-sub">›</span>
        </Link>
        <Link href={bodyHref} className={row}>
          Weekly body check <span aria-hidden="true" className="text-sub">›</span>
        </Link>
      </div>
    </nav>
  );
}
