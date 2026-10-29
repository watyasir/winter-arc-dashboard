import type { MetadataRoute } from "next";

/** Install as a home-screen app (M10). Colours match the light frame (globals.css --color-frame-start). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Yasir OS",
    short_name: "Yasir OS",
    description: "A personal life dashboard with a 90-day Winter Arc season.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f6f8fa",
    theme_color: "#f6f8fa",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
