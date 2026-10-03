export function dateKey(date: Date) {
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function sameDate(left: Date | null | undefined, right: Date | null | undefined) {
  return Boolean(left && right && dateKey(left) === dateKey(right));
}

export function monthKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

export function calendarDays(month: Date) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(firstDay);
    day.setDate(1 - mondayOffset + index);
    return day;
  });
}

export function shiftMonth(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function formatDateLabel(date: Date) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long' }).format(date);
}

export function isBeforeDay(left: Date, right: Date) {
  return dateKey(left) < dateKey(right);
}

export function isAfterDay(left: Date, right: Date) {
  return dateKey(left) > dateKey(right);
}
