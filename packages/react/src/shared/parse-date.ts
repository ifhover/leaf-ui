import { type CalendarMode, periodKey, startOfPeriod } from './calendar';
import { normalizeWidth, parseTime } from './time';

type WeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6;
/** Accept common local spellings: full-width digits, 年/月/日, dots and compact YYYYMMDD. */
function normalizeDateText(text: string, mode: CalendarMode) {
  const value = normalizeWidth(text)
    .trim()
    .replace(/\s*[年月]\s*/g, '-')
    .replace(/\s*[日号號]\s*/g, ' ')
    .replace(/-+(?=\s|$)/g, '')
    .trim();
  const compact = /^(\d{4})(\d{2})(\d{2})?(?:[T\s]+(.+))?$/.exec(value);
  if (compact && (mode === 'month' ? !compact[3] : Boolean(compact[3])))
    return `${compact[1]}-${compact[2]}${compact[3] ? `-${compact[3]}` : ''}${compact[4] ? ` ${compact[4]}` : ''}`;
  return value;
}
/** Strict local parsing: never silently roll an invalid day into the next month. */
export function parseDateText(
  input: string,
  mode: CalendarMode = 'date',
  periods?: readonly [string, string],
  weekStartsOn: WeekStart = 1,
) {
  const text = normalizeWidth(input).trim();
  if (mode === 'quarter') {
    const match = /^(\d{4})\s*[-\s]?\s*Q([1-4])$/i.exec(text);
    if (!match) return null;
    const date = new Date(0);
    date.setFullYear(Number(match[1]), (Number(match[2]) - 1) * 3, 1);
    date.setHours(0, 0, 0, 0);
    return date;
  }
  if (mode === 'week') {
    const match = /^(\d{4})-?W(\d{1,2})$/i.exec(text);
    if (!match) return null;
    const week = Number(match[2]);
    // Week numbers stay ISO 8601; only the selected period start follows weekStartsOn.
    const monday = startOfPeriod(new Date(Number(match[1]), 0, 4), 'week', 1);
    monday.setDate(monday.getDate() + (week - 1) * 7);
    const thursday = new Date(monday);
    thursday.setDate(monday.getDate() + 3);
    const date = startOfPeriod(thursday, 'week', weekStartsOn);
    return periodKey(date, 'week', weekStartsOn) === `${match[1]}-W${String(week).padStart(2, '0')}`
      ? date
      : null;
  }
  const normalized = normalizeDateText(text, mode);
  const expression =
    mode === 'year'
      ? /^(\d{4})$/
      : mode === 'month'
        ? /^(\d{4})[-/.](\d{1,2})$/
        : /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:[T\s]+(.+))?$/;
  const match = expression.exec(normalized);
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
    const time = parseTime(match[4], periods);
    if (!time) return null;
    date.setHours(time.hour, time.minute, time.second, 0);
    if (date.getHours() !== time.hour || date.getMinutes() !== time.minute) return null;
  } else if (match[4]) return null;
  return date;
}
