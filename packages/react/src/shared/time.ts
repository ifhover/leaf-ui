export interface TimeParts {
  hour: number;
  minute: number;
  second: number;
}
export const padTime = (value: number) => String(value).padStart(2, '0');
export function parseTime(value: string | null | undefined): TimeParts | null {
  const match = value?.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const second = Number(match[3] ?? 0);
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
