import { createBrowserClient } from "@supabase/ssr";

/** Supabase client for the browser. Stores the login in cookies the server can read. */
export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { detectSessionInUrl: false },
  });
}
