import type { ReactNode } from 'react';
export type DateFormat = string | ((date: Date) => string);
export interface DatePreset<T = Date> {
  key?: string;
  label: ReactNode;
  value: T | (() => T);
}
export function formatPickerDate(
  date: Date,
  format: DateFormat | undefined,
  fallback: (date: Date) => string,
) {
  if (!format) return fallback(date);
  if (typeof format === 'function') return format(date);
  const values: Record<string, string> = {
    YYYY: String(date.getFullYear()).padStart(4, '0'),
    MM: String(date.getMonth() + 1).padStart(2, '0'),
    DD: String(date.getDate()).padStart(2, '0'),
    HH: String(date.getHours()).padStart(2, '0'),
    mm: String(date.getMinutes()).padStart(2, '0'),
    ss: String(date.getSeconds()).padStart(2, '0'),
    Q: String(Math.floor(date.getMonth() / 3) + 1),
  };
  return format.replace(/\[[^\]]*\]|YYYY|MM|DD|HH|mm|ss|Q/g, (token) =>
    token.startsWith('[') ? token.slice(1, -1) : (values[token] ?? token),
  );
}
export function parsePickerDate(
  text: string,
  format: DateFormat | undefined,
  fallback: (text: string) => Date | null,
  parse?: (text: string) => Date | null,
) {
  if (parse) return parse(text);
  if (!format || typeof format === 'function') return fallback(text);
  const tokens: string[] = [];
  const parts = format.match(/\[[^\]]*\]|YYYY|MM|DD|HH|mm|ss|Q|./g) ?? [];
  const pattern = parts
    .map((part) => {
      if (/^(YYYY|MM|DD|HH|mm|ss|Q)$/.test(part)) {
        tokens.push(part);
        return part === 'YYYY' ? '(\\d{4})' : '(\\d{1,2})';
      }
      const literal = part.startsWith('[') ? part.slice(1, -1) : part;
      return literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('');
  const match = text.trim().match(new RegExp(`^${pattern}$`));
  if (!match) return null;
  const values = new Map(tokens.map((token, index) => [token, Number(match[index + 1])]));
  const year = values.get('YYYY') ?? new Date().getFullYear(),
    month = values.has('Q') ? ((values.get('Q') ?? 1) - 1) * 3 : (values.get('MM') ?? 1) - 1,
    day = values.get('DD') ?? 1,
    hour = values.get('HH') ?? 0,
    minute = values.get('mm') ?? 0,
    second = values.get('ss') ?? 0;
  const date = new Date(0);
  date.setFullYear(year, month, day);
  date.setHours(hour, minute, second, 0);
  return date.getFullYear() === year &&
    date.getMonth() === month &&
    date.getDate() === day &&
    date.getHours() === hour &&
    date.getMinutes() === minute &&
    date.getSeconds() === second
    ? date
    : null;
}
