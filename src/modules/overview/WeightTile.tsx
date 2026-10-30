"use client";

import { EmptyNote } from "@/components/EmptyNote";
import { changeWords, LineChart } from "@/components/LineChart";
import { BigNumber, Tile } from "@/components/Tile";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { viewHref } from "@/components/dashboard/Nav";
import { addDays } from "@/lib/trackers";

/** Latest weight, its change over 14 days, and the 14-day line. */
export function WeightTile() {
  const { data } = useDashboard();
  const points = data.weight.points.filter((p) => p.date > addDays(data.todayISO, -14));
  const href = viewHref(data.basePath, "health");
  if (points.length < 2) {
    return (
      <Tile title="Weight" href={href} area="weight">
        <EmptyNote>Log your weight on 2 days to see the trend.</EmptyNote>
      </Tile>
    );
  }
  const latest = points.at(-1)!.value;
  const change = changeWords(points, "kg");
  return (
    <Tile title="Weight" href={href} area="weight">
      <div className="flex min-h-0 flex-1 flex-col gap-3 min-[561px]:flex-row min-[561px]:items-end min-[561px]:gap-4">
        <div className="flex shrink-0 flex-col gap-1">
          <BigNumber value={latest.toLocaleString("en-IN", { maximumFractionDigits: 1 })} unit="kg" />
          <span className="text-sm text-soft">{change === "no change" ? "No change" : `${change[0].toUpperCase()}${change.slice(1)}`} in 14 days</span>
        </div>
        <LineChart points={points} unit="kg" summary={`Weight ${change} over 14 days, now ${latest} kg`} height={80} />
      </div>
    </Tile>
  );
}
