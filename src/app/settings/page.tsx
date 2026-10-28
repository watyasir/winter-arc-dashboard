import type { Metadata } from "next";
import { Suspense } from "react";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { requireUser } from "@/lib/auth";
import { shareToken } from "@/lib/share-store";
import { weekStart } from "@/lib/dashboard/dates";
import { loadTrackers } from "@/lib/tracker-store";
import { addDays, todayISO } from "@/lib/trackers";
import { addTracker, resetTestData, saveSeason } from "./actions";

export const metadata: Metadata = { title: "Settings · Yasir OS" };

export default function SettingsPage() {
  return (
    <Suspense fallback={<p className="p-6 text-center text-[15px] text-sub">Loading settings…</p>}>
      <Settings />
    </Suspense>
  );
}

async function Settings() {
  const { supabase } = await requireUser();
  const [trackers, season] = await Promise.all([
    loadTrackers(supabase),
    supabase.from("seasons").select("start_date, targets").eq("is_active", true).maybeSingle<{ start_date: string; targets: Record<string, number> }>(),
  ]);
  if (!trackers || season.error) {
    return <p className="p-6 text-center text-[15px] text-coral-text">Couldn&apos;t load your settings. Refresh to try again.</p>;
  }
  return (
    <SettingsForm
      trackers={trackers}
      season={season.data ? { start: season.data.start_date, targets: season.data.targets } : null}
      defaultStart={addDays(weekStart(todayISO()), 7)}
      actions={{ saveSeason, addTracker, resetTestData }}
      calendarPath={calendarPath()}
    />
  );
}

/** The feeds' shared address; each one adds &cat=<key>. Null = SHARE_TOKEN isn't set. */
function calendarPath(): string | null {
  const token = shareToken();
  return token ? `/api/calendar.ics?token=${encodeURIComponent(token)}` : null;
}
