import "server-only";
import { loadOwnerDashboard, ownerClient, secretMatches } from "@/lib/owner";
import { toShareCard, type ShareCard } from "@/lib/share";

/*
  The public side of /progress. Anyone with ?t=<SHARE_TOKEN> sees the Winter Arc card,
  and nothing else: the numbers are worked out here and only the card leaves the server.
*/

/** The secret in the share link. Null = sharing is off. */
export function shareToken(): string | null {
  return process.env.SHARE_TOKEN?.trim() || null;
}

export function isShareToken(candidate: string | undefined): boolean {
  return secretMatches(candidate, shareToken());
}

/** The owner's card, read with the secret key. Null = no season; undefined = not set up or database error. */
export async function loadPublicShareCard(): Promise<ShareCard | null | undefined> {
  const owner = await ownerClient();
  if (!owner) return undefined;
  const loaded = await loadOwnerDashboard(owner.supabase, owner.ownerId);
  return loaded && toShareCard(loaded.data);
}
