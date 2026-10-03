export interface TimeParts {
  hour: number;
  minute: number;
  second: number;
}
export const padTime = (value: number) => String(value).padStart(2, '0');
export function parseTime(value: string | null | undefined): TimeParts | null {
  const match = value
    ?.trim()
    .match(/^(?:(上午|下午)\s*)?(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM|上午|下午)?$/i);
  if (!match) return null;
  if (match[1] && match[5]) return null;
  let hour = Number(match[2]);
  const minute = Number(match[3]);
  const second = Number(match[4] ?? 0);
  const period = (match[1] ?? match[5])?.toUpperCase();
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
