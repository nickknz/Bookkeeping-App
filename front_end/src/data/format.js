// Currency + number formatting helpers.

// "5243.5" -> "5,243.50"
export function money(amount) {
  return Number(amount).toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// "5243.5" -> "5,243"  (no decimals, for compact display)
export function money0(amount) {
  return Math.round(Number(amount)).toLocaleString("zh-CN");
}

// Keep money arithmetic in integer cents so decimal inputs such as 0.1 and
// 0.2 never affect totals or budget boundary comparisons.
export function toCents(amount) {
  const numericAmount = Number(amount);
  return Number.isFinite(numericAmount) ? Math.round(numericAmount * 100) : 0;
}

export function fromCents(cents) {
  return cents / 100;
}
