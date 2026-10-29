"use client";

import { useEffect } from "react";

/** Registers public/sw.js (M10: home-screen app, offline page). Production only, so `next dev` never serves stale files. */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {
      // No service worker (private mode, old browser): the site works as a normal website.
    });
  }, []);
  return null;
}
