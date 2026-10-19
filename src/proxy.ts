import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { sessionExpired } from "@/lib/session";
import { supabaseKey, supabaseUrl } from "@/lib/supabase/config";

/*
  Runs before the signed-in pages. Keeps the Supabase login cookie fresh (so the same
  browser stays signed in), signs you out 7 days after you signed in (src/lib/session.ts),
  and sends signed-out visitors to /login. The allowed-email check happens in requireUser().
*/
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const path = request.nextUrl.pathname;

  if (data?.claims && sessionExpired(data.claims)) {
    // Only this device: each device gets its own 7 days from when it signed in.
    await supabase.auth.signOut({ scope: "local" });
    const to = request.nextUrl.clone();
    to.pathname = "/login";
    to.search = "?error=session-ended";
    const redirect = NextResponse.redirect(to);
    // Carry over the cleared login cookies from signOut().
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  }
  const signedIn = !!data?.claims;

  if (!signedIn && (path === "/log" || path.startsWith("/log/") || path.startsWith("/settings"))) {
    const to = request.nextUrl.clone();
    to.pathname = "/login";
    to.search = "";
    return NextResponse.redirect(to);
  }
  if (signedIn && path === "/login") {
    const to = request.nextUrl.clone();
    to.pathname = "/log";
    to.search = "";
    return NextResponse.redirect(to);
  }
  return response;
}

export const config = {
  // "/" is here so the login cookie stays fresh on the dashboard too.
  matcher: ["/", "/log/:path*", "/login", "/settings/:path*"],
};
