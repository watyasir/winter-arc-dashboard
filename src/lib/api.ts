import "server-only";
import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { ownerClient, secretMatches, type ServiceClient } from "@/lib/owner";

/*
  The API for Claude's scheduled tasks (docs/API.md). Every call sends
  "Authorization: Bearer <API_TOKEN>". With no API_TOKEN set, the API is off (503)
  and the rest of the app works as usual.
*/

export function apiError(status: number, error: string, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ ok: false, error, ...extra }, { status, headers: { "Cache-Control": "no-store" } });
}

export function apiOk(body: Record<string, unknown>, status = 200) {
  return NextResponse.json({ ok: true, ...body }, { status, headers: { "Cache-Control": "no-store" } });
}

/** Checks the token and finds the owner. Returns the database client, or the error response to send. */
export async function authorizeApi(request: Request): Promise<{ supabase: ServiceClient; ownerId: string } | NextResponse> {
  const token = process.env.API_TOKEN?.trim() || null;
  if (!token) return apiError(503, "The API is off: API_TOKEN isn't set.");
  const header = request.headers.get("authorization") ?? "";
  const candidate = header.startsWith("Bearer ") ? header.slice(7).trim() : null;
  if (!secretMatches(candidate, token)) return apiError(401, "Wrong or missing token.");
  const owner = await ownerClient();
  if (!owner) return apiError(503, "The API can't reach the database: check SUPABASE_SERVICE_ROLE_KEY and ALLOWED_EMAIL.");
  return owner;
}

/**
 * The gallery's upload-only key: GALLERY_TOKEN if set, otherwise derived from API_TOKEN
 * (HMAC-SHA256 of "yasiros-gallery-upload-v1", hex), so no new setting is needed. It can add
 * files and nothing else. Null = neither token is set.
 */
function galleryKey(): string | null {
  const own = process.env.GALLERY_TOKEN?.trim();
  if (own) return own;
  const api = process.env.API_TOKEN?.trim();
  return api ? createHmac("sha256", api).update("yasiros-gallery-upload-v1").digest("hex") : null;
}

/** Like authorizeApi, for the gallery upload key. */
export async function authorizeGallery(request: Request): Promise<{ supabase: ServiceClient; ownerId: string } | NextResponse> {
  const key = galleryKey();
  if (!key) return apiError(503, "Gallery uploads are off: API_TOKEN isn't set.");
  const header = request.headers.get("authorization") ?? "";
  const candidate = header.startsWith("Bearer ") ? header.slice(7).trim() : null;
  if (!secretMatches(candidate, key)) return apiError(401, "Wrong or missing gallery key.");
  const owner = await ownerClient();
  if (!owner) return apiError(503, "The gallery can't reach the database: check SUPABASE_SERVICE_ROLE_KEY and ALLOWED_EMAIL.");
  return owner;
}

/** The request's JSON body, or undefined if it isn't JSON. */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}
