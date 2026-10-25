import "server-only";
import { createServerClient } from "@supabase/ssr";
import { supabaseUrl } from "./config";

/**
 * Supabase with the secret key (SUPABASE_SERVICE_ROLE_KEY), for reads with no one signed in.
 * It skips row-level security, so every query through it must filter by user_id itself.
 * Only the public share card uses it. Null = the key isn't set.
 */
export function createServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) return null;
  return createServerClient(supabaseUrl, key, {
    cookies: { getAll: () => [], setAll: () => {} },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
