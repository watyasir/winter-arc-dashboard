/*
  Data never carries a hex value. It names a tone, and this map turns the tone into a
  fill class (written out in full so Tailwind can find it). v9 Playground (docs/DESIGN.md).
*/
export type Tone = "pop" | "accent" | "ok" | "warn" | "danger" | "neutral";

export const toneBg: Record<Tone, string> = {
  pop: "bg-pop",
  accent: "bg-accent",
  ok: "bg-ok",
  warn: "bg-warn",
  danger: "bg-danger",
  neutral: "bg-line-strong",
};
