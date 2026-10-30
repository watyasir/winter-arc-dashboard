import "server-only";
import type { createClient } from "@/lib/supabase/server";
import { DEFAULT_THEME, isTheme, type ThemeId } from "./theme";

type Supabase = Awaited<ReturnType<typeof createClient>>;

/** The saved theme. No row, no table yet or a database error: Candy, never a crash. */
export async function loadTheme(supabase: Supabase): Promise<ThemeId> {
  const { data, error } = await supabase.from("user_prefs").select("theme").maybeSingle<{ theme: string }>();
  return !error && isTheme(data?.theme) ? data.theme : DEFAULT_THEME;
}
