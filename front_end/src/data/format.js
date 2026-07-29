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
