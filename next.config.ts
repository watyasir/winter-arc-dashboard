import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  experimental: {
    // Reuse a visited page for 2 minutes when going back and forth (saves clear it at once via revalidatePath).
    staleTimes: { dynamic: 120, static: 300 },
  },
  partialPrefetching: true,
  // The Winter Arc page is a view of the dashboard.
  async redirects() {
    return [
      { source: "/winter-arc", destination: "/#winter-arc", permanent: false },
      { source: "/demo/winter-arc", destination: "/demo#winter-arc", permanent: false },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
