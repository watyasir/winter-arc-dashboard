"use client";

import { useEffect } from "react";
import { applyTheme, type ThemeId } from "@/lib/theme";

/**
 * Keeps the page on the saved theme: a choice made on another device reaches this one on its
 * next visit (and its cookie, so the next first paint is right). The demo always shows Candy
 * without touching the cookie.
 */
export function ThemeSync({ theme, remember }: { theme: ThemeId; remember: boolean }) {
  useEffect(() => {
    applyTheme(theme, remember);
  }, [theme, remember]);
  return null;
}
