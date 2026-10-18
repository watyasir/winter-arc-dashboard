import { Chip, type ChipTone } from "@/components/Chip";
import type { Owner } from "@/modules/types";

const ownerTone: Record<Owner, ChipTone> = { Me: "me", Claude: "claude", Both: "neutral" };

export function OwnerChip({ owner }: { owner: Owner }) {
  return <Chip tone={ownerTone[owner]}>{owner}</Chip>;
}
