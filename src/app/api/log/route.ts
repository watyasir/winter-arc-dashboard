import { revalidatePath } from "next/cache";
import { apiError, apiOk, authorizeApi, readJson } from "@/lib/api";
import { addDays, assertValidValue, todayISO, type Tracker } from "@/lib/trackers";

/** How far back a scheduled task may log (a missed day can be filled in later). */
const MAX_DAYS_BACK = 7;

/**
 * Logs tracker values for one day, like the check-in does.
 * Body: { "date"?: "YYYY-MM-DD" (default today, India time), "entries": [{ "tracker": "<slug or name>", "value": 7 }] }
 * A tracker that already has a value that day is overwritten.
 */
export async function POST(request: Request) {
  const auth = await authorizeApi(request);
  if (auth instanceof Response) return auth;
  const { supabase, ownerId } = auth;

  const body = await readJson(request);
  if (typeof body !== "object" || body === null) return apiError(400, "Send a JSON object.");
  const { date: rawDate, entries } = body as { date?: unknown; entries?: unknown };

  const today = todayISO();
  const date = rawDate === undefined ? today : rawDate;
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date) || date > today || date < addDays(today, -MAX_DAYS_BACK)) {
    return apiError(400, `date: YYYY-MM-DD, from ${addDays(today, -MAX_DAYS_BACK)} to ${today}.`);
  }
  if (!Array.isArray(entries) || entries.length === 0 || entries.length > 50) {
    return apiError(400, "entries: a list of 1 to 50 { tracker, value }.");
  }

  const { data: trackers, error: readError } = await supabase
    .from("trackers")
    .select("id, slug, name, type")
    .eq("user_id", ownerId)
    .eq("archived", false)
    .returns<Pick<Tracker, "id" | "slug" | "name" | "type">[]>();
  if (readError) return apiError(500, "Couldn't reach the database. Try again.");
  const find = (key: string) => {
    const k = key.trim().toLowerCase();
    return trackers.find((t) => t.slug.toLowerCase() === k) ?? trackers.find((t) => t.name.toLowerCase() === k);
  };

  const rows = new Map<string, { user_id: string; tracker_id: string; entry_date: string; value: number }>();
  const saved: { tracker: string; value: number }[] = [];
  const skipped: { tracker: unknown; reason: string }[] = [];
  for (const e of entries) {
    const key = typeof e === "object" && e !== null ? (e as { tracker?: unknown }).tracker : undefined;
    const value = typeof e === "object" && e !== null ? (e as { value?: unknown }).value : undefined;
    const tracker = typeof key === "string" ? find(key) : undefined;
    if (!tracker) {
      skipped.push({ tracker: key ?? null, reason: "No tracker with that slug or name." });
      continue;
    }
    // Yes/no trackers also take true/false.
    const number = typeof value === "boolean" ? Number(value) : value;
    try {
      if (typeof number !== "number") throw new Error(`${tracker.name}: value must be a number`);
      assertValidValue(tracker, number);
    } catch (err) {
      skipped.push({ tracker: tracker.slug, reason: err instanceof Error ? err.message : "That value doesn't fit." });
      continue;
    }
    rows.set(tracker.id, { user_id: ownerId, tracker_id: tracker.id, entry_date: date, value: number });
    saved.push({ tracker: tracker.slug, value: number });
  }

  if (rows.size > 0) {
    const { error } = await supabase.from("entries").upsert([...rows.values()], { onConflict: "tracker_id,entry_date" });
    if (error) return apiError(500, "Couldn't save. Try again.");
    revalidatePath("/");
    revalidatePath("/log");
  }
  return apiOk({ date, saved, skipped }, saved.length > 0 ? 200 : 400);
}
