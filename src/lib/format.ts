/** ₹1,25,000 (Indian grouping, no decimals). Negative amounts get a real minus: −₹12,400. */
export function formatRupees(amount: number): string {
  const sign = amount < 0 ? "−" : "";
  return sign + "₹" + Math.abs(Math.round(amount)).toLocaleString("en-IN");
}

/** Same, but always signed: +₹10,000 / −₹245 (for transaction lists). */
export function formatSignedRupees(amount: number): string {
  return (amount > 0 ? "+" : "") + formatRupees(amount);
}
