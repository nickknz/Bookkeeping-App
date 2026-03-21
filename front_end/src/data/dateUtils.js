const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

export function formatDateLabel(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  if (dateStr === now.toISOString().slice(0, 10)) return "今天";
  if (dateStr === yesterday.toISOString().slice(0, 10)) return "昨天";
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export function getWeekday(dateStr) {
  return "周" + WEEKDAYS[new Date(dateStr + "T00:00:00").getDay()];
}

export function groupTransactionsByDate(transactions) {
  const map = {};
  transactions.forEach((t) => {
    if (!map[t.date]) map[t.date] = [];
    map[t.date].push(t);
  });
  return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]));
}
