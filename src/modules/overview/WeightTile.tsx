"use client";

import { EmptyNote } from "@/components/EmptyNote";
import { LineChart } from "@/components/LineChart";
import { BigNumber, Tile } from "@/components/Tile";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { viewHref } from "@/components/dashboard/Nav";
import { addDays } from "@/lib/trackers";

/** Latest weight, its 14-day change (▲ up / ▼ down, in ink: green fails contrast on the tile fill), and the 14-day line to scrub. */
export function WeightTile() {
  const { data } = useDashboard();
  const points = data.weight.points.filter((p) => p.date > addDays(data.todayISO, -14));
  const href = viewHref(data.basePath, "health");
  if (points.length < 2) {
    return (
      <Tile title="Weight" href={href} tone="weight" area="weight" tilt>
        <EmptyNote>Log 2 days to see the trend.</EmptyNote>
      </Tile>
    );
  }
  const latest = points.at(-1)!.value;
  const change = Math.round((latest - points[0].value) * 10) / 10;
  const kg = (v: number) => v.toLocaleString("en-IN", { maximumFractionDigits: 1 });
  return (
    <Tile title="Weight" href={href} tone="weight" area="weight" tilt>
      <div className="flex min-h-0 flex-1 flex-col gap-3 min-[561px]:flex-row min-[561px]:items-stretch min-[561px]:gap-5">
        <div className="flex shrink-0 flex-col justify-end gap-1">
          <BigNumber value={kg(latest)} unit="kg" />
          <span className="text-sm font-semibold text-ink">
            {change > 0 ? `▲ ${kg(change)} kg` : change < 0 ? `▼ ${kg(-change)} kg` : "No change"} in 14 days
          </span>
        </div>
        <LineChart points={points} unit="kg" summary={`Weight ${change > 0 ? "up" : change < 0 ? "down" : "no change"} ${change ? `${kg(Math.abs(change))} kg ` : ""}over 14 days, now ${kg(latest)} kg`} height={90} />
      </div>
    </Tile>
  );
}
