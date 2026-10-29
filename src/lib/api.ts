import "server-only";
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

/** Like authorizeApi, for the gallery's upload-only key (GALLERY_TOKEN): it can add files and nothing else. */
export async function authorizeGallery(request: Request): Promise<{ supabase: ServiceClient; ownerId: string } | NextResponse> {
  const key = process.env.GALLERY_TOKEN?.trim();
  if (!key) return apiError(503, "Gallery key not set: add GALLERY_TOKEN to the site's settings.");
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
