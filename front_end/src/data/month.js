function pad(value) {
  return String(value).padStart(2, "0");
}

export function formatLocalDate(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function getCurrentMonth(date = new Date()) {
  const year = date.getFullYear();
  const monthIndex = date.getMonth();
  const month = monthIndex + 1;
  const lastDay = new Date(year, month, 0).getDate();

  return {
    key: `${year}-${pad(month)}`,
    year,
    month,
    label: `${year} 年 ${month} 月`,
    startDate: `${year}-${pad(month)}-01`,
    endDate: `${year}-${pad(month)}-${pad(lastDay)}`,
    elapsedDays: date.getDate(),
    remainingDays: Math.max(lastDay - date.getDate() + 1, 1),
  };
}
