/*
  Data never carries a hex value. It names a tone, and this map turns the tone into a
  fill class (written out in full so Tailwind can find it). Soft bento (docs/DESIGN.md).
*/
export type Tone = "peach" | "blue" | "ok" | "warn" | "danger" | "neutral";

export const toneBg: Record<Tone, string> = {
  peach: "bg-peach",
  blue: "bg-blue",
  ok: "bg-ok",
  warn: "bg-warn",
  danger: "bg-danger",
  neutral: "bg-line-strong",
};
