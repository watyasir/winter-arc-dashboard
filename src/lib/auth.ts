import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

/** Only one person can use the real dashboard: the email in ALLOWED_EMAIL. */
export function isAllowedEmail(email: string | null | undefined): boolean {
  const allowed = process.env.ALLOWED_EMAIL?.trim().toLowerCase();
  return !!allowed && !!email && email.trim().toLowerCase() === allowed;
}

/**
 * The signed-in user, checked with Supabase's auth server (not just the cookie).
 * Sends anyone else to /login. Call it inside a <Suspense> boundary: it reads cookies.
 */
export async function requireUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/login");
  if (!isAllowedEmail(data.user.email)) {
    await supabase.auth.signOut();
    redirect("/login?error=not-allowed");
  }
  return { supabase, user: data.user };
}
