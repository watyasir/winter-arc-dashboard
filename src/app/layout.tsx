import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ServiceWorker } from "@/components/ServiceWorker";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yasir OS",
  description: "A personal life dashboard with a 90-day Winter Arc season.",
  // Home-screen app on iPhone (the manifest is src/app/manifest.ts).
  appleWebApp: { capable: true, title: "Yasir OS", statusBarStyle: "default" },
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

// Self-hosted by next/font at build time. Body 500, labels 600, headings 800.
const inter = Inter({ subsets: ["latin"], weight: ["500", "600", "800"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-jetbrains", display: "swap" });

export const viewport: Viewport = {
  // The page colour (globals.css --color-surface).
  themeColor: "#fff5e6",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`h-full ${inter.variable} ${mono.variable}`}>
      <body className="min-h-full">
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
