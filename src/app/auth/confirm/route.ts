import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { isAllowedEmail } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/*
  The sign-in email link lands here. Two link styles are handled:
    ?token_hash=...&type=email  works from any browser (needs the custom email template, see docs)
    ?code=...                   Supabase's default link; only works in the browser that asked for it
*/
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const tokenHash = params.get("token_hash");
  const type = params.get("type") as EmailOtpType | null;
  const code = params.get("code");
  const to = (path: string) => NextResponse.redirect(new URL(path, request.nextUrl.origin));

  const supabase = await createClient();
  const { data, error } =
    tokenHash && type
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      : code
        ? await supabase.auth.exchangeCodeForSession(code)
        : { data: { user: null }, error: new Error("missing token") };

  if (error || !data.user) return to("/login?error=link-expired");
  if (!isAllowedEmail(data.user.email)) {
    await supabase.auth.signOut();
    return to("/login?error=not-allowed");
  }
  return to("/log");
}
