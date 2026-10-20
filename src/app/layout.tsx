import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yarizz's Dashboard",
  description: "A personal life dashboard with a 90-day Winter Arc season.",
};

export const viewport: Viewport = {
  themeColor: "#f6f8fa",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
