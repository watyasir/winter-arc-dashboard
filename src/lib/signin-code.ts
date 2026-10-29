import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { createServiceClient } from "./supabase/service";

/*
  Sign-in code (M10). On iPhone the home-screen app doesn't share Safari's sign-in, and the
  email link opens in Safari. So /settings shows a one-time code, and /login on the other
  device takes it.

  The code is an HMAC of the user id and the minute it was made, keyed with
  SUPABASE_SERVICE_ROLE_KEY. Only that minute is stored, in the user's app_metadata (which
  only the secret key can write), so only the latest code works, for 10 minutes, once.
  5 wrong tries also end it.
*/

const VALID_MINUTES = 10;
const MAX_TRIES = 5;
// 32 letters and digits that can't be mixed up (no 0/O, 1/I). 32 = 5 bits, so no bias.
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const CODE_LENGTH = 8;

interface CodeState {
  signin_code_at?: number | null;
  signin_code_tries?: number;
}

function codeFor(userId: string, minute: number, secret: string): string {
  const mac = createHmac("sha256", secret).update(`signin-code:${userId}:${minute}`).digest();
  return Array.from(mac.subarray(0, CODE_LENGTH), (b) => ALPHABET[b & 31]).join("");
}

/** "ab3k-7mpq" -> "AB3K7MPQ" (spaces, dashes and case don't matter). */
function normalizeCode(input: string): string {
  return input.toUpperCase().replace(/[^0-9A-Z]/g, "");
}

const nowMinute = () => Math.floor(Date.now() / 60_000);

/** A new code for the signed-in owner; any older one stops working. Null = the secret key isn't set or Supabase failed. */
export async function createSignInCode(userId: string): Promise<{ code: string; expiresAt: number } | null> {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const admin = createServiceClient();
  if (!secret || !admin) return null;
  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error || !data.user) return null;
  const minute = nowMinute();
  const state: CodeState = { signin_code_at: minute, signin_code_tries: 0 };
  const saved = await admin.auth.admin.updateUserById(userId, { app_metadata: { ...data.user.app_metadata, ...state } });
  if (saved.error) return null;
  return { code: codeFor(userId, minute, secret), expiresAt: (minute + VALID_MINUTES) * 60_000 };
}

/**
 * Checks a code for the given email. Right: the code is used up and the result is a
 * magic-link token hash, to be verified with verifyOtp on the device signing in.
 * Wrong, old or used: null (and a wrong try counts toward the 5).
 */
export async function redeemSignInCode(email: string, input: string): Promise<string | null> {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const admin = createServiceClient();
  const code = normalizeCode(input);
  if (!secret || !admin || code.length !== CODE_LENGTH) return null;

  // One allowed person, so the first page of users is plenty.
  const { data: list, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 100 });
  if (error) return null;
  const user = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!user) return null;

  const state = user.app_metadata as CodeState;
  const at = state.signin_code_at;
  if (typeof at !== "number" || nowMinute() - at >= VALID_MINUTES) return null;

  const expected = Buffer.from(codeFor(user.id, at, secret));
  const right = timingSafeEqual(expected, Buffer.from(code));
  const tries = (state.signin_code_tries ?? 0) + 1;
  // Used up when right, or after too many wrong tries. Saved before the sign-in, so it can't be used twice.
  const next: CodeState = right || tries >= MAX_TRIES ? { signin_code_at: null, signin_code_tries: 0 } : { signin_code_tries: tries };
  const saved = await admin.auth.admin.updateUserById(user.id, { app_metadata: { ...user.app_metadata, ...next } });
  if (saved.error || !right) return null;

  const { data: link, error: linkError } = await admin.auth.admin.generateLink({ type: "magiclink", email: user.email! });
  return linkError ? null : link.properties.hashed_token;
}
