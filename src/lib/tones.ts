/*
  Data never carries a hex value. It names a tone, and these maps turn the tone into
  Tailwind classes (written out in full so Tailwind can find them).
*/
export type Tone =
  | "red"
  | "peach"
  | "yellow"
  | "green"
  | "teal"
  | "sky"
  | "sapphire"
  | "blue"
  | "lavender"
  | "mauve"
  | "pink"
  | "neutral";

export const toneBg: Record<Tone, string> = {
  red: "bg-red",
  peach: "bg-peach",
  yellow: "bg-yellow",
  green: "bg-green",
  teal: "bg-teal",
  sky: "bg-sky",
  sapphire: "bg-sapphire",
  blue: "bg-blue",
  lavender: "bg-lavender",
  mauve: "bg-mauve",
  pink: "bg-pink",
  neutral: "bg-overlay1",
};

export const toneStroke: Record<Tone, string> = {
  red: "stroke-red",
  peach: "stroke-peach",
  yellow: "stroke-yellow",
  green: "stroke-green",
  teal: "stroke-teal",
  sky: "stroke-sky",
  sapphire: "stroke-sapphire",
  blue: "stroke-blue",
  lavender: "stroke-lavender",
  mauve: "stroke-mauve",
  pink: "stroke-pink",
  neutral: "stroke-overlay1",
};
