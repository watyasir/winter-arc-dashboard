import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

/** Only one person can use the real dashboard: the email in ALLOWED_EMAIL. */
export function isAllowedEmail(email: string | null | undefined): boolean {
  const allowed = process.env.ALLOWED_EMAIL?.trim().toLowerCase();
  return !!allowed && !!email && email.trim().toLowerCase() === allowed;
}

/**
 * The signed-in user. The login token's signature is checked on the server against Supabase's
 * public key (no round trip to Supabase), so a faked cookie can't get in.
 * Sends anyone else to /login. Call it inside a <Suspense> boundary: it reads cookies.
 */
export async function requireUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (error || !claims?.sub) redirect("/login");
  if (!isAllowedEmail(claims.email)) {
    await supabase.auth.signOut();
    redirect("/login?error=not-allowed");
  }
  return { supabase, user: { id: claims.sub, email: claims.email as string } };
}

/** Like requireUser, but returns null instead of redirecting (for "/", which shows a welcome to visitors). */
export async function currentOwner() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = data?.claims?.email;
  return email && isAllowedEmail(email) ? { supabase, email } : null;
}
