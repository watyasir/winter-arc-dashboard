/*
  The three v9 themes. The colours live in src/app/globals.css ([data-theme="…"]); the choice is
  saved in Supabase (user_prefs.theme) and mirrored in a cookie, so <html data-theme> is right
  before the first paint (the script in src/app/layout.tsx).
*/

export const THEMES = [
  { id: "candy", name: "Candy" },
  { id: "matcha", name: "Matcha" },
  { id: "sunset", name: "Sunset" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export const DEFAULT_THEME: ThemeId = "candy";
export const THEME_COOKIE = "theme";

export const isTheme = (v: unknown): v is ThemeId => THEMES.some((t) => t.id === v);

/** Page colours for <meta name="theme-color"> (the same values as --th-bg in globals.css). */
export const THEME_BG: Record<ThemeId, string> = { candy: "#f5f1ea", matcha: "#eff2ea", sunset: "#fbf0ea" };

/** Runs in <head> before the page paints: the cookie's theme (Candy on /demo), and the matching theme-color. */
export const THEME_SCRIPT = `(function(){try{var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=(candy|matcha|sunset)/);var t=location.pathname.indexOf("/demo")===0||!m?"${DEFAULT_THEME}":m[1];document.documentElement.setAttribute("data-theme",t);var bg=${JSON.stringify(THEME_BG)}[t];var meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.setAttribute("content",bg)}catch(e){}})()`;

/** Applies a theme on the page now (no reload) and remembers it in the cookie for a year. */
export function applyTheme(theme: ThemeId, remember: boolean) {
  document.documentElement.setAttribute("data-theme", theme);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_BG[theme]);
  if (remember) document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=31536000; samesite=lax; secure`;
}
