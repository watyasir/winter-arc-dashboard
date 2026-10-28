import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { apiError, apiOk, authorizeGallery, readJson } from "@/lib/api";
import { extensionOf, GALLERY_MAX_BYTES, inspectFile, isGalleryMime, parseGalleryMeta, type GalleryMeta } from "@/lib/gallery";
import type { ServiceClient } from "@/lib/owner";

/*
  POST /api/gallery (docs/API.md), with the upload-only gallery key. Three ways in:
  - multipart/form-data with `file` and `meta` (JSON): one call, for files up to ~4 MB
    (Vercel caps a request body at 4.5 MB);
  - JSON { mime, bytes }: a signed upload link for files up to 25 MB, then PUT the file there;
  - JSON { path, ...meta }: after that PUT, files the upload under its title and category.
  Files are stored byte-for-byte: never compressed, resized or re-encoded. The key can't read anything.
*/

const BUCKET = "gallery";

export async function POST(request: Request) {
  const auth = await authorizeGallery(request);
  if (auth instanceof Response) return auth;
  const type = request.headers.get("content-type") ?? "";

  if (type.startsWith("multipart/form-data")) return uploadDirect(request, auth.supabase, auth.ownerId);

  const body = await readJson(request);
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return apiError(400, 'Send multipart (file + meta), JSON { "mime", "bytes" } for an upload link, or JSON { "path", "title", "category" } after the upload.');
  }
  const raw = body as Record<string, unknown>;
  return "path" in raw ? finishUpload(raw, auth.supabase, auth.ownerId) : uploadLink(raw, auth.supabase, auth.ownerId);
}

async function uploadDirect(request: Request, supabase: ServiceClient, ownerId: string) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return apiError(413, "Couldn't read the upload. Over ~4 MB? Ask for an upload link instead (JSON { \"mime\", \"bytes\" }).");
  }
  const file = form.get("file");
  if (!(file instanceof File)) return apiError(400, "file: attach the image or PDF as `file`.");
  const metaField = form.get("meta");
  let rawMeta: unknown = Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === "string"));
  if (typeof metaField === "string") {
    try {
      rawMeta = JSON.parse(metaField);
    } catch {
      return apiError(400, "meta: send valid JSON.");
    }
  }
  const meta = parseGalleryMeta(rawMeta);
  if (!meta.ok) return apiError(400, meta.error);
  if (file.size > GALLERY_MAX_BYTES) return apiError(413, "file: up to 25 MB.");

  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = inspectFile(bytes);
  if (!kind) return apiError(415, "file: PNG, JPG, SVG, PDF or WebP only.");
  const path = `${ownerId}/${randomUUID()}.${extensionOf(kind.mime)}`;
  const stored = await supabase.storage.from(BUCKET).upload(path, bytes, { contentType: kind.mime, upsert: false, cacheControl: "31536000" });
  if (stored.error) {
    console.error(`POST /api/gallery upload failed: ${stored.error.message}`);
    return apiError(500, "Couldn't store the file. Try again.");
  }
  return saveItem(supabase, ownerId, path, meta.meta, { ...kind, bytes: bytes.length });
}

async function uploadLink(raw: Record<string, unknown>, supabase: ServiceClient, ownerId: string) {
  if (!isGalleryMime(raw.mime)) return apiError(400, "mime: image/png, image/jpeg, image/svg+xml, application/pdf or image/webp.");
  if (typeof raw.bytes !== "number" || raw.bytes < 1 || raw.bytes > GALLERY_MAX_BYTES) return apiError(400, "bytes: the file size, up to 25 MB.");
  const path = `${ownerId}/${randomUUID()}.${extensionOf(raw.mime)}`;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error) {
    console.error(`POST /api/gallery upload link failed: ${error.message}`);
    return apiError(500, "Couldn't make an upload link. Try again.");
  }
  return apiOk({
    path,
    upload_url: data.signedUrl,
    next: `PUT the file to upload_url with Content-Type: ${raw.mime}, then POST { "path": "${path}", "title", "category", ... } here.`,
  });
}

async function finishUpload(raw: Record<string, unknown>, supabase: ServiceClient, ownerId: string) {
  const path = raw.path;
  if (typeof path !== "string" || !new RegExp(`^${ownerId}/[0-9a-f-]{36}\\.(png|jpg|svg|pdf|webp)$`).test(path)) {
    return apiError(400, "path: the path you got with the upload link.");
  }
  const meta = parseGalleryMeta(raw);
  if (!meta.ok) return apiError(400, meta.error);
  const taken = await supabase.from("gallery_items").select("id").eq("file_path", path).maybeSingle();
  if (taken.data) return apiError(409, "That upload is already in the gallery.");

  const file = await supabase.storage.from(BUCKET).download(path);
  if (file.error) return apiError(404, "No file at that path yet: PUT it to the upload link first.");
  const bytes = new Uint8Array(await file.data.arrayBuffer());
  const kind = inspectFile(bytes);
  if (!kind || extensionOf(kind.mime) !== path.split(".").pop() || bytes.length > GALLERY_MAX_BYTES) {
    await supabase.storage.from(BUCKET).remove([path]);
    return apiError(415, "The file isn't the PNG, JPG, SVG, PDF or WebP it was announced as (or is over 25 MB). Removed it.");
  }
  return saveItem(supabase, ownerId, path, meta.meta, { ...kind, bytes: bytes.length });
}

async function saveItem(
  supabase: ServiceClient,
  ownerId: string,
  path: string,
  meta: GalleryMeta,
  file: { mime: string; width: number | null; height: number | null; bytes: number },
) {
  const { data, error } = await supabase
    .from("gallery_items")
    .insert({ user_id: ownerId, file_path: path, ...meta, mime: file.mime, width: file.width, height: file.height, bytes: file.bytes })
    .select("id")
    .single();
  if (error) {
    console.error(`POST /api/gallery save failed: ${error.message}`);
    await supabase.storage.from(BUCKET).remove([path]);
    return apiError(500, "Couldn't save the gallery entry. Try again.");
  }
  revalidatePath("/");
  return apiOk({ id: data.id, mime: file.mime, bytes: file.bytes, width: file.width, height: file.height }, 201);
}
