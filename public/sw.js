/*
  Yasir OS service worker (M10). No library.
  - /_next/static and /icons: cache first (file names change when the content does).
  - Pages: network first; offline, the last copy of that page, else /offline.
  - Signing out clears the saved pages, so nothing private stays on the phone.
  Bump VERSION to drop every old cache.
*/
const VERSION = "v1";
const STATIC = `static-${VERSION}`;
const PAGES = `pages-${VERSION}`;
const OFFLINE = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      // The offline page and its stylesheets, so it looks right with no network.
      const res = await fetch(OFFLINE, { cache: "reload" });
      const html = await res.clone().text();
      await (await caches.open(PAGES)).put(OFFLINE, res);
      const css = [...html.matchAll(/href="(\/_next\/static\/[^"]+\.css)"/g)].map((m) => m[1]);
      await (await caches.open(STATIC)).addAll(css);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = [STATIC, PAGES];
      for (const key of await caches.keys()) if (!keep.includes(key)) await caches.delete(key);
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.method !== "GET") {
    if (url.pathname === "/auth/signout") event.waitUntil(clearPages());
    return;
  }
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(cacheFirst(request));
    return;
  }
  if (request.mode === "navigate" && !url.pathname.startsWith("/api/") && !url.pathname.startsWith("/auth/")) {
    event.respondWith(networkFirst(request));
  }
});

async function cacheFirst(request) {
  const cache = await caches.open(STATIC);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok) cache.put(request, res.clone());
  return res;
}

async function networkFirst(request) {
  const cache = await caches.open(PAGES);
  try {
    const res = await fetch(request);
    const html = (res.headers.get("content-type") || "").includes("text/html");
    // Keep the share link's token (?t=) out of the cache.
    if (res.ok && !res.redirected && html && !new URL(request.url).searchParams.has("t")) cache.put(request, res.clone());
    return res;
  } catch {
    return (await cache.match(request)) || (await cache.match(OFFLINE)) || Response.error();
  }
}

async function clearPages() {
  const cache = await caches.open(PAGES);
  for (const req of await cache.keys()) if (new URL(req.url).pathname !== OFFLINE) await cache.delete(req);
}
