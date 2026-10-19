import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckIn } from "@/components/checkin/CheckIn";
import { requireUser } from "@/lib/auth";
import { defaultTrackers } from "@/lib/default-trackers";
import { addDays, formatDayLabel, startingValue, todayISO, type CheckInValues, type Tracker } from "@/lib/trackers";
import { saveCheckIn } from "./actions";

export const metadata: Metadata = { title: "Check-in · Winter Arc Dashboard" };

const TRACKER_COLUMNS = "id, slug, name, area, type, unit, step, scale_labels, target, target_period, sort_order";

export default function LogPage() {
  return (
    <Suspense fallback={<p className="p-6 text-center text-[15px] text-sub">Loading your check-in…</p>}>
      <TodayCheckIn />
    </Suspense>
  );
}

async function TodayCheckIn() {
  const { supabase } = await requireUser();

  let { data: trackers } = await supabase
    .from("trackers")
    .select(TRACKER_COLUMNS)
    .eq("archived", false)
    .order("sort_order")
    .returns<Tracker[]>();

  // First visit: start with the default trackers.
  if (trackers && trackers.length === 0) {
    const { data: seeded } = await supabase
      .from("trackers")
      .upsert(defaultTrackers, { onConflict: "user_id,slug", ignoreDuplicates: true })
      .select(TRACKER_COLUMNS)
      .order("sort_order")
      .returns<Tracker[]>();
    trackers = seeded;
  }
  if (!trackers) {
    return <p className="p-6 text-center text-[15px] text-coral-text">Couldn&apos;t load your trackers. Refresh to try again.</p>;
  }

  // Latest value per tracker over the last 2 weeks: today's if logged, otherwise the most recent day.
  const today = todayISO();
  const twoWeeksAgo = addDays(today, -14);
  const { data: recent } = await supabase
    .from("entries")
    .select("tracker_id, entry_date, value")
    .gte("entry_date", twoWeeksAgo)
    .order("entry_date", { ascending: false });

  const latest = new Map<string, { date: string; value: number }>();
  for (const e of recent ?? []) {
    if (!latest.has(e.tracker_id)) latest.set(e.tracker_id, { date: e.entry_date, value: Number(e.value) });
  }
  const initial: CheckInValues = {};
  for (const t of trackers) {
    const last = latest.get(t.id);
    initial[t.id] = last?.date === today ? last.value : startingValue(t, last?.value);
  }

  return (
    <CheckIn
      trackers={trackers}
      initialValues={initial}
      dayLabel={formatDayLabel(today)}
      cancelHref="/"
      onSave={saveCheckIn}
      footer={
        <form action="/auth/signout" method="post" className="flex justify-center pt-2">
          <button type="submit" className="min-h-11 cursor-pointer rounded-full border-0 bg-transparent px-3 text-[15px] text-sub hover:text-ink">
            Sign out
          </button>
        </form>
      }
    />
  );
}
