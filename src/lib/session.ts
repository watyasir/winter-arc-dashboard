/*
  How long one sign-in lasts on each device (7 days, decided 20 Oct 2026). Change it here only.
*/
const SESSION_DAYS = 7;

/**
 * When this login started, in seconds, from the token's "amr" claim. That timestamp is
 * the real sign-in moment and stays the same when the token refreshes. Falls back to
 * "iat" (when this token was issued) if the claim is missing.
 */
function signedInAt(claims: { amr?: unknown; iat?: number }): number | null {
  const times = Array.isArray(claims.amr)
    ? claims.amr.map((m) => (typeof m === "object" && m && "timestamp" in m ? Number(m.timestamp) : NaN)).filter(Number.isFinite)
    : [];
  if (times.length) return Math.max(...times);
  return typeof claims.iat === "number" ? claims.iat : null;
}

export function sessionExpired(claims: { amr?: unknown; iat?: number }, nowSeconds = Date.now() / 1000): boolean {
  const start = signedInAt(claims);
  return start !== null && nowSeconds - start > SESSION_DAYS * 24 * 60 * 60;
}
