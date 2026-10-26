import { apiError, apiOk, authorizeApi } from "@/lib/api";
import { loadOwnerDashboard } from "@/lib/owner";
import { toShareCard } from "@/lib/share";
import { formatValue } from "@/lib/trackers";

/** Today at a glance for Claude's scheduled tasks: what's logged, what's missing, and the Winter Arc status. */
export async function GET(request: Request) {
  const auth = await authorizeApi(request);
  if (auth instanceof Response) return auth;

  const loaded = await loadOwnerDashboard(auth.supabase, auth.ownerId);
  if (!loaded) return apiError(500, "Couldn't reach the database. Try again.");
  const { data, trackers, entries, today } = loaded;

  const todays = new Map(entries.filter((e) => e.entry_date === today).map((e) => [e.tracker_id, Number(e.value)]));
  const logged = trackers
    .filter((t) => todays.has(t.id))
    .map((t) => ({ tracker: t.slug, name: t.name, value: todays.get(t.id)!, shown: formatValue(t, todays.get(t.id)!) }));
  const missing = trackers
    .filter((t) => !todays.has(t.id))
    .map((t) => ({ tracker: t.slug, name: t.name, type: t.type, unit: t.unit }));

  const card = toShareCard(data);
  const season =
    card
      ? {
          name: card.name,
          day: card.day,
          length: card.length,
          starts_in: card.startsIn,
          days_left: Math.max(0, card.length - Math.max(card.day, 0)),
          streak: card.streak,
          best_streak: card.bestStreak,
          targets_hit: { pct: card.targets.pct, period: card.targets.label },
          targets_this_week: data.arc?.targets ?? [],
          streaks: data.arc?.streaks ?? [],
          workouts_this_week: card.workouts,
        }
      : null;

  return apiOk({ date: today, logged, missing, season });
}
