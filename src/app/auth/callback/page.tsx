"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/browser";

/*
  The sign-in email link lands here with the login tokens after "#". Only the browser can
  read that part of the link, so this page saves the login and moves on to the dashboard (/), where the
  server checks the email is allowed. Works from any browser, including a phone mail app's.
*/
export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = hash.get("access_token");
    const refreshToken = hash.get("refresh_token");
    // Clear the tokens from the address bar straight away.
    window.history.replaceState(null, "", window.location.pathname);
    if (!accessToken || !refreshToken) {
      router.replace("/login?error=link-expired");
      return;
    }
    createClient()
      .auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => router.replace(error ? "/login?error=link-expired" : "/"));
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <p role="status" className="m-0 text-[15px] text-sub">
        Signing you in…
      </p>
    </main>
  );
}
