/*
  How long one sign-in lasts. 7 days on purpose: Google signs a personal (unverified) app
  out of Gmail every 7 days, so the dashboard login and the Gmail connection (Phase 8b)
  expire together and you reconnect both in one go. Change it here only.
*/
export const SESSION_DAYS = 7;

/**
 * When this login started, in seconds, from the token's "amr" claim. That timestamp is
 * the real sign-in moment and stays the same when the token refreshes. Falls back to
 * "iat" (when this token was issued) if the claim is missing.
 */
export function signedInAt(claims: { amr?: unknown; iat?: number }): number | null {
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
