import { createBrowserClient } from "@supabase/ssr";
import { supabaseKey, supabaseUrl } from "./config";

/** Supabase client for the browser. Stores the login in cookies the server can read. */
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseKey, {
    auth: { detectSessionInUrl: false },
  });
}
