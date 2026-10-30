// Checks every text/background pair the v9 themes use, in all 3 themes (WCAG AA, 4.5:1).
// Reads the --th-* values straight from src/app/globals.css. Run: node scripts/contrast.mjs
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");

const themes = {};
for (const [, name, body] of css.matchAll(/\[data-theme="(\w+)"\]\s*\{([^}]*)\}/g)) {
  themes[name] = Object.fromEntries([...body.matchAll(/--th-([\w-]+):\s*(#[0-9a-f]{6})/gi)].map(([, k, v]) => [k, v]));
}

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const hex = (c) => `#${c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
/** color-mix(in srgb, a p%, b) */
const mix = (a, p, b) => hex(rgb(a).map((v, i) => v * p + rgb(b)[i] * (1 - p)));
const lum = (h) => {
  const [r, g, b] = rgb(h).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

const FIXED = { card: "#ffffff", white: "#ffffff", claude: "#d97757", danger: "#b91c1c", "danger-soft": "#fee2e2", ok: "#15803d", "ok-soft": "#dcfce7", warn: "#b45309", "warn-soft": "#fef3c7" };
// The check-in tile is saturated, so its secondary text is ink too (Tile sets --th-soft to ink there).
const TILES = ["tasks", "money", "today", "weight", "fund", "diet", "study", "claude"];

let failed = 0;
for (const [name, t] of Object.entries(themes)) {
  const c = { ...FIXED, ...t, "fill-strong": mix(t.ink, 0.09, t.bg), "pop-strong": mix(t.check, 0.88, t.ink), "accent-faint": mix(t.accent, 0.1, "#ffffff") };
  const pairs = [
    ["ink", "bg"], ["soft", "bg"], ["ink", "card"], ["soft", "card"], ["ink", "fill-strong"], ["soft", "fill-strong"],
    ["accent", "bg"], ["accent", "card"], ["white", "accent"], ["accent", "accent-faint"], ["ink", "hero-soft"],
    ["hero-soft", "hero"], ["white", "hero"], ["hero", "dot-on"], ["ink", "dot-on"],
    ["ink", "claude"], ["danger", "danger-soft"], ["ok", "card"], ["ok", "ok-soft"], ["warn", "warn-soft"], ["danger", "card"],
    ["ink", "pop-strong"], ["ink", "check"], ["ok", "weight"], ["white", "ink"], ["warn", "warn-soft"],
    ...TILES.flatMap((k) => [["ink", k], ["soft", k]]),
  ];
  for (const [fg, bg] of pairs) {
    const r = ratio(c[fg], c[bg]);
    if (r < 4.5) {
      failed++;
      console.log(`✕ ${name}: ${fg} ${c[fg]} on ${bg} ${c[bg]} = ${r.toFixed(2)}:1`);
    }
  }
  console.log(`${name}: ${pairs.length} pairs checked`);
}
if (failed) {
  console.log(`${failed} pair(s) under 4.5:1`);
  process.exit(1);
}
console.log("All pairs ≥ 4.5:1");
