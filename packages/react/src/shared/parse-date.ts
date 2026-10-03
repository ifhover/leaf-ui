import { type CalendarMode, periodKey, startOfPeriod } from './calendar';
import { parseTime } from './time';

/** Strict local parsing: never silently roll an invalid day into the next month. */
export function parseDateText(text: string, mode: CalendarMode = 'date') {
  if (mode === 'week') {
    const match = /^(\d{4})-W(\d{2})$/i.exec(text);
    if (!match) return null;
    const date = startOfPeriod(new Date(Number(match[1]), 0, 4), 'week');
    date.setDate(date.getDate() + (Number(match[2]) - 1) * 7);
    return periodKey(date, 'week').toLowerCase() === text.toLowerCase() ? date : null;
  }
  const expression =
    mode === 'year'
      ? /^(\d{4})$/
      : mode === 'month'
        ? /^(\d{4})[-/](\d{1,2})$/
        : /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[T\s]+(.+))?$/;
  const match = expression.exec(text);
  if (!match) return null;
  const year = Number(match[1]);
  const month = mode === 'year' ? 1 : Number(match[2]);
  const day = mode === 'year' || mode === 'month' ? 1 : Number(match[3]);
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day)
    return null;
  if (mode === 'datetime') {
    const time = parseTime(match[4]);
    if (!time) return null;
    date.setHours(time.hour, time.minute, time.second, 0);
    if (date.getHours() !== time.hour || date.getMinutes() !== time.minute) return null;
  } else if (match[4]) return null;
  return date;
}
