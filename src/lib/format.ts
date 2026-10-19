/** ₹1,25,000 (Indian grouping, no decimals). Negative amounts get a real minus: −₹12,400. */
export function formatRupees(amount: number): string {
  const sign = amount < 0 ? "−" : "";
  return sign + "₹" + Math.abs(Math.round(amount)).toLocaleString("en-IN");
}

/** Same, but always signed: +₹10,000 / −₹245 (for transaction lists). */
export function formatSignedRupees(amount: number): string {
  return (amount > 0 ? "+" : "") + formatRupees(amount);
}

/** 75 seconds -> "1:15" (for the Instinct status pill). */
export function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** 108 seconds -> "1 min 48 s", 6 -> "6 s". */
export function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return m > 0 ? `${m} min ${s} s` : `${s} s`;
}
