"use server";

import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { isAllowedEmail } from "@/lib/auth";
import { supabaseEnv } from "@/lib/supabase/server";

export type LoginState = { status: "idle" } | { status: "sent"; email: string } | { status: "error"; message: string };

/** Emails a sign-in link, but only to ALLOWED_EMAIL. Anyone else sees the same "check your email" reply. */
export async function sendMagicLink(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: "Enter your email address." };
  }
  if (!isAllowedEmail(email)) {
    // Don't reveal which email is allowed.
    return { status: "sent", email };
  }

  const h = await headers();
  const origin = h.get("origin") ?? `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
  // "implicit" puts the login in the link itself, so it works in whichever browser opens the email
  // (the default needs the same browser that asked). /auth/callback finishes the sign-in.
  const { url, key } = supabaseEnv();
  const supabase = createClient(url, key, {
    auth: { flowType: "implicit", persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });
  if (error) {
    return {
      status: "error",
      message:
        error.status === 429
          ? "Too many sign-in emails for now. Wait a few minutes, then try again."
          : "Couldn't send the link. Try again in a moment.",
    };
  }
  return { status: "sent", email };
}
