/*
  Data never carries a hex value. It names a tone, and these maps turn the tone into
  Tailwind classes (written out in full so Tailwind can find them).
  v6 "Teal and grey" (docs/DESIGN.md §2b).
*/
export type Tone =
  | "brand"
  | "sage"
  | "yellow"
  | "coral"
  | "arc"
  | "cyan"
  | "pine"
  | "mist"
  | "seafoam"
  | "lagoon"
  | "neutral";

export const toneBg: Record<Tone, string> = {
  brand: "bg-brand",
  sage: "bg-sage",
  yellow: "bg-yellow",
  coral: "bg-coral",
  arc: "bg-arc",
  cyan: "bg-cyan",
  pine: "bg-pine",
  mist: "bg-mist",
  seafoam: "bg-seafoam",
  lagoon: "bg-lagoon",
  neutral: "bg-overlay",
};
