"use client";

import { Tile } from "@/components/Tile";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { viewHref } from "@/components/dashboard/Nav";

/**
 * Winter Arc at a glance: day N of 90, days left, check-ins, finish date and the 90 squares
 * (filled = logged, today outlined). On the Winter Arc page itself (`onPage`) the heading isn't a link.
 */
export function HeroTile({ onPage = false }: { onPage?: boolean }) {
  const { data } = useDashboard();
  const hero = data.hero;
  const href = onPage ? undefined : viewHref(data.basePath, "arc");
  if (!hero) {
    return (
      <Tile title="Winter Arc" href={href} fill="pop" area={onPage ? undefined : "hero"}>
        <p className="m-0 text-sm">Set the start date in Settings to begin the 90 days.</p>
      </Tile>
    );
  }
  const started = hero.day >= 1;
  return (
    <Tile title="Winter Arc" href={href} fill="pop" area={onPage ? undefined : "hero"} className={onPage ? "min-h-[300px]" : "min-h-[300px] min-[561px]:min-h-0"}>
      <p className="m-0 text-[32px] leading-none display tracking-[-0.02em]">
        {started ? (
          <>
            Day <span className="font-mono">{hero.day}</span> <span className="text-xl font-semibold">of {hero.length}</span>
          </>
        ) : (
          <>
            Starts in <span className="font-mono">{hero.startsIn}</span> {hero.startsIn === 1 ? "day" : "days"}
          </>
        )}
      </p>
      <dl className="m-0 flex flex-wrap gap-x-6 gap-y-2">
        <Stat label="days left" value={String(hero.daysLeft)} />
        <Stat label="check-ins" value={started ? `${hero.checkIns}/${hero.day}` : "0"} />
        <Stat label="finish line" value={hero.finishLabel} />
      </dl>
      <ol
        aria-label={`${hero.checkIns} of ${hero.length} days logged`}
        className="m-0 mt-auto grid list-none grid-cols-[repeat(15,minmax(0,1fr))] gap-1 p-0 min-[561px]:grid-cols-[repeat(30,minmax(0,1fr))]"
      >
        {hero.logged.map((on, i) => (
          <li
            key={i}
            aria-hidden="true"
            className={`aspect-square rounded-[4px] ${on ? "bg-ink" : "bg-ink/10"} ${i === hero.todayIndex ? "outline-2 outline-offset-1 outline-ink" : ""}`}
          />
        ))}
      </ol>
    </Tile>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <dd className="m-0 font-mono text-xl font-bold">{value}</dd>
      <dt className="order-last text-sm">{label}</dt>
    </div>
  );
}
