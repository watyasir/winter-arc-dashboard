"use client";

import { formatSet, groupSets, workoutSummary, type Workout } from "@/lib/body";
import { formatDayLabel } from "@/lib/trackers";

/** The workout log's recent sessions: tap one to see its sets; Delete when the page allows it. */
export function RecentWorkouts({ recent, deleting, onDelete }: { recent: Workout[]; deleting: boolean; onDelete?: (w: Workout) => void }) {
  if (recent.length === 0) return null;
  return (

    <section aria-labelledby="recent-workouts" className="flex flex-col gap-1.5">
      <h2 id="recent-workouts" className="m-0 ml-4 text-[13px] font-medium text-soft">
        Recent workouts
      </h2>
      <ul className="m-0 list-none rounded-[14px] border border-line bg-card px-4 py-0 [&>li:first-child]:border-t-0">
        {recent.map((w) => (
          <li key={w.id} className="flex items-center justify-between gap-3 border-t border-line py-2.5">
            <details className="min-w-0 flex-1">
              <summary className="cursor-pointer list-none">
                <span className="block truncate text-[15px] font-semibold">{w.name}</span>
                <span className="text-[13px] text-soft">
                  {formatDayLabel(w.date)} · {workoutSummary(w.sets)}
                </span>
              </summary>
              <ul className="m-0 mt-1.5 list-none p-0 text-[13px] text-soft">
                {groupSets(w.sets).map((g) => (
                  <li key={g.exercise}>
                    <span className="text-ink">{g.exercise}</span> · {g.sets.map(formatSet).join(", ")}
                  </li>
                ))}
              </ul>
            </details>
            {onDelete && (
              <button
                type="button"
                disabled={deleting}
                onClick={() => onDelete(w)}
                aria-label={`Delete ${w.name} from ${formatDayLabel(w.date)}`}
                className="min-h-11 shrink-0 cursor-pointer self-start rounded-full border-0 bg-transparent px-3 text-[15px] text-danger hover:bg-fill"
              >
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
