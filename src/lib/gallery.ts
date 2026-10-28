/*
  The gallery (…_gallery.sql): images and PDFs Claude sends from chats, stored as the exact
  original bytes in the private "gallery" bucket. Shared by the upload API, the gallery view
  and the demo.
*/

export const GALLERY_CATEGORIES = ["Health", "Education", "Money", "Work", "Home", "Build", "Life"] as const;
export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

export const GALLERY_MAX_BYTES = 25 * 1024 * 1024;

const TYPES = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/svg+xml": "svg",
  "application/pdf": "pdf",
  "image/webp": "webp",
} as const;
export type GalleryMime = keyof typeof TYPES;

export const extensionOf = (mime: GalleryMime) => TYPES[mime];
export const isGalleryMime = (v: unknown): v is GalleryMime => typeof v === "string" && v in TYPES;

/** One item as the gallery view shows it. `url` is a short-lived signed link (a static file on the demo). */
export interface GalleryItem {
  id: string;
  title: string;
  category: GalleryCategory;
  description: string | null;
  mime: GalleryMime;
  width: number | null;
  height: number | null;
  bytes: number;
  createdAt: string;
  url: string;
  /** The original as a download, with its file name. */
  downloadUrl: string;
  fileName: string;
}

/** What the uploader says about a file. */
export interface GalleryMeta {
  title: string;
  category: GalleryCategory;
  description: string | null;
  source_chat: string | null;
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const optionalText = (v: unknown, max: number) => v === undefined || v === null || (typeof v === "string" && v.length <= max);

export function parseGalleryMeta(raw: unknown): { ok: true; meta: GalleryMeta } | { ok: false; error: string } {
  if (!isObject(raw)) return { ok: false, error: 'meta: send JSON like { "title": "…", "category": "Health" }.' };
  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  if (!title || title.length > 120) return { ok: false, error: "title: text, 1 to 120 characters." };
  if (!GALLERY_CATEGORIES.includes(raw.category as GalleryCategory)) return { ok: false, error: `category: one of ${GALLERY_CATEGORIES.join(", ")}.` };
  if (!optionalText(raw.description, 2000)) return { ok: false, error: "description: text, up to 2000 characters." };
  if (!optionalText(raw.source_chat, 120)) return { ok: false, error: "source_chat: text, up to 120 characters." };
  const clean = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
  return { ok: true, meta: { title, category: raw.category as GalleryCategory, description: clean(raw.description), source_chat: clean(raw.source_chat) } };
}

/**
 * What the file really is, from its first bytes (never the name or the sender's word), and
 * its pixel size where the format says it. Null = not a PNG, JPG, SVG, PDF or WebP.
 */
export function inspectFile(bytes: Uint8Array): { mime: GalleryMime; width: number | null; height: number | null } | null {
  const b = bytes;
  const u16be = (i: number) => (b[i] << 8) | b[i + 1];
  const u32be = (i: number) => ((b[i] << 24) >>> 0) + (b[i + 1] << 16) + (b[i + 2] << 8) + b[i + 3];
  const u16le = (i: number) => b[i] | (b[i + 1] << 8);
  const u24le = (i: number) => b[i] | (b[i + 1] << 8) | (b[i + 2] << 16);
  const ascii = (i: number, n: number) => String.fromCharCode(...b.subarray(i, i + n));

  if (b.length > 24 && ascii(1, 3) === "PNG" && b[0] === 0x89) return { mime: "image/png", width: u32be(16), height: u32be(20) };

  if (b.length > 4 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) {
    // Walk the markers to the frame header (SOF0–SOF15, not DHT/JPG/DAC).
    let i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) return { mime: "image/jpeg", width: null, height: null };
      const marker = b[i + 1];
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { mime: "image/jpeg", width: u16be(i + 7), height: u16be(i + 5) };
      }
      i += 2 + u16be(i + 2);
    }
    return { mime: "image/jpeg", width: null, height: null };
  }

  if (b.length > 30 && ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP") {
    const chunk = ascii(12, 4);
    if (chunk === "VP8X") return { mime: "image/webp", width: u24le(24) + 1, height: u24le(27) + 1 };
    if (chunk === "VP8L") {
      const bits = b[21] | (b[22] << 8) | (b[23] << 16) | (b[24] << 24);
      return { mime: "image/webp", width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
    if (chunk === "VP8 ") return { mime: "image/webp", width: u16le(26) & 0x3fff, height: u16le(28) & 0x3fff };
    return { mime: "image/webp", width: null, height: null };
  }

  if (ascii(0, 5) === "%PDF-") return { mime: "application/pdf", width: null, height: null };

  const head = new TextDecoder().decode(b.subarray(0, 4096)).replace(/^﻿/, "").trimStart();
  if (/^(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*(<!DOCTYPE[^>]*>\s*)?<svg[\s>]/i.test(head)) {
    const tag = head.slice(head.search(/<svg[\s>]/i)).split(">")[0];
    const attr = (name: string) => Number(tag.match(new RegExp(`\\s${name}\\s*=\\s*["']\\s*([\\d.]+)(px)?\\s*["']`))?.[1]) || null;
    const box = tag.match(/viewBox\s*=\s*["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/);
    const width = attr("width") ?? (box ? Number(box[1]) : null);
    const height = attr("height") ?? (box ? Number(box[2]) : null);
    return { mime: "image/svg+xml", width: width && Math.round(width), height: height && Math.round(height) };
  }
  return null;
}

/** "Lab report.pdf": the title, made safe for a file name, with the real extension. */
export function fileNameFor(title: string, mime: GalleryMime): string {
  const base = title.replace(/[\\/:*?"<>|\u0000-\u001f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 80) || "image";
  return `${base}.${extensionOf(mime)}`;
}

/** 1.2 MB, 340 KB. */
export function formatBytes(n: number): string {
  if (n >= 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(n / 1024))} KB`;
}
