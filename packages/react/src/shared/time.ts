export interface TimeParts {
  hour: number;
  minute: number;
  second: number;
}
export const padTime = (value: number) => String(value).padStart(2, '0');
export const timePrecision = (parts: TimeParts, showSeconds: boolean): TimeParts =>
  showSeconds ? parts : { ...parts, second: 0 };
/** Convert full-width digits and separators typed by IMEs to ASCII. */
export function normalizeWidth(text: string) {
  return text
    .replace(/[\uFF01-\uFF5E]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
    .replace(/\u3000/g, ' ');
}
export const timeValue = (parts: TimeParts) => parts.hour * 3600 + parts.minute * 60 + parts.second;
export function timeInRange(parts: TimeParts, min?: TimeParts | null, max?: TimeParts | null) {
  const value = timeValue(parts);
  return (!min || value >= timeValue(min)) && (!max || value <= timeValue(max));
}
/** Split the clock text into hour, minute and second without the period marker. */
function clockParts(text: string, hasPeriod: boolean) {
  const separated = /^(\d{1,2})[:.](\d{2})(?:[:.](\d{2}))?$/.exec(text);
  if (separated) return separated.slice(1, 4);
  const written = /^(\d{1,2})\s*[时時点點](?:\s*(\d{1,2})\s*分?)?(?:\s*(\d{1,2})\s*秒)?$/.exec(
    text,
  );
  if (written) return written.slice(1, 4);
  const compact = /^(\d{3,4}|\d{6})$/.exec(text)?.[1];
  if (compact) {
    const hourLength = compact.length === 3 ? 1 : 2;
    return [
      compact.slice(0, hourLength),
      compact.slice(hourLength, hourLength + 2),
      compact.slice(hourLength + 2) || undefined,
    ];
  }
  // A bare hour is accepted only with an explicit period, such as "9 PM".
  if (hasPeriod && /^\d{1,2}$/.test(text)) return [text, '0', undefined];
  return null;
}
export function parseTime(
  value: string | null | undefined,
  periods?: readonly [string, string],
): TimeParts | null {
  let text = value ? normalizeWidth(value).trim() : undefined;
  if (text && periods) {
    for (const [index, label] of periods.entries()) {
      if (!label) continue;
      const normalized = text.toLowerCase();
      const token = label.toLowerCase();
      if (normalized.endsWith(token)) {
        text = `${text.slice(0, -label.length).trim()} ${index === 0 ? 'AM' : 'PM'}`;
        break;
      }
      if (normalized.startsWith(token)) {
        text = `${text.slice(label.length).trim()} ${index === 0 ? 'AM' : 'PM'}`;
        break;
      }
    }
  }
  const match = text?.match(/^(?:(上午|下午)\s*)?(.+?)\s*(AM|PM|上午|下午)?$/i);
  if (!match) return null;
  if (match[1] && match[3]) return null;
  const period = (match[1] ?? match[3])?.toUpperCase();
  const clock = clockParts(match[2] ?? '', Boolean(period));
  if (!clock) return null;
  let hour = Number(clock[0]);
  const minute = Number(clock[1] ?? 0);
  const second = Number(clock[2] ?? 0);
  if (period) {
    if (hour < 1 || hour > 12) return null;
    hour = (hour % 12) + (period === 'PM' || period === '下午' ? 12 : 0);
  }
  return hour < 24 && minute < 60 && second < 60 ? { hour, minute, second } : null;
}
export function timeString(parts: TimeParts, seconds = false) {
  return `${padTime(parts.hour)}:${padTime(parts.minute)}${seconds ? `:${padTime(parts.second)}` : ''}`;
}
export function displayTime(
  parts: TimeParts,
  seconds: boolean,
  use12Hours: boolean,
  period: readonly [string, string],
) {
  return use12Hours
    ? `${timeString({ ...parts, hour: parts.hour % 12 || 12 }, seconds)} ${period[parts.hour < 12 ? 0 : 1]}`
    : timeString(parts, seconds);
}
