import type { CalendarMode } from './calendar';
import { periodKey } from './calendar';
import { normalizeWidth, type TimeParts } from './time';

export type SegmentKind =
  | 'year'
  | 'quarter'
  | 'month'
  | 'week'
  | 'day'
  | 'hour'
  | 'hour12'
  | 'minute'
  | 'second'
  | 'period';
export type TemplatePart =
  | { type: 'literal'; text: string; group: number }
  | { type: 'segment'; kind: SegmentKind; group: number; index: number };
export interface SegmentTemplate {
  readonly parts: readonly TemplatePart[];
  /** Editable segments in typing order. */
  readonly segments: readonly { kind: SegmentKind; group: number }[];
  readonly groups: number;
  readonly joiner: string;
}
export type SegmentValues = readonly (number | null)[];
export interface SegmentLabels {
  placeholders: Partial<Record<SegmentKind, string>>;
  periods: readonly [string, string];
}
export interface PickerSegments {
  template: SegmentTemplate;
  dates: readonly (Date | null | undefined)[];
  minuteStep?: number;
  secondStep?: number;
}
export function pickerSegments(
  picker: CalendarMode | 'time',
  format: unknown,
  dates: readonly (Date | null | undefined)[],
  showSeconds = false,
  use12Hours = false,
  minuteStep = 1,
  secondStep = 1,
): PickerSegments | undefined {
  // Arbitrary display functions cannot be inverted into editable date segments.
  if (format !== undefined && !segmentFormat(format)) return undefined;
  const pattern =
    picker === 'time'
      ? { pattern: timePattern(showSeconds, use12Hours), internal: true }
      : pickerPattern(picker, format, showSeconds, use12Hours);
  return {
    template: createTemplate(dates.map(() => pattern)),
    dates,
    minuteStep,
    secondStep,
  };
}
type WeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Digits, minimum and maximum for every numeric segment. */
const limits: Record<Exclude<SegmentKind, 'period'>, readonly [number, number, number]> = {
  year: [4, 1, 9999],
  quarter: [1, 1, 4],
  month: [2, 1, 12],
  week: [2, 1, 53],
  day: [2, 1, 31],
  hour: [2, 0, 23],
  hour12: [2, 1, 12],
  minute: [2, 0, 59],
  second: [2, 0, 59],
};
const publicTokens: Record<string, SegmentKind> = {
  YYYY: 'year',
  Q: 'quarter',
  MM: 'month',
  DD: 'day',
  HH: 'hour',
  mm: 'minute',
  ss: 'second',
};
// Internal patterns may also use a 12-hour clock, period marker and ISO week number.
const internalTokens: Record<string, SegmentKind> = {
  ...publicTokens,
  hh: 'hour12',
  A: 'period',
  WW: 'week',
};
function tokenize(pattern: string, group: number, internal: boolean) {
  const tokens = internal ? internalTokens : publicTokens;
  const parts: ({ type: 'literal'; text: string } | { type: 'segment'; kind: SegmentKind })[] = [];
  for (const token of pattern.match(/\[[^\]]*\]|YYYY|MM|DD|HH|hh|mm|ss|WW|Q|A|./g) ?? []) {
    const kind = tokens[token];
    if (kind) parts.push({ type: 'segment', kind });
    else {
      const text = token.startsWith('[') ? token.slice(1, -1) : token;
      const last = parts.at(-1);
      if (last?.type === 'literal') last.text += text;
      else parts.push({ type: 'literal', text });
    }
  }
  return parts.map((part) => ({ ...part, group }));
}
/** A public `format` string can be edited by segments when it contains at least one token. */
export function segmentFormat(format: unknown): format is string {
  return (
    typeof format === 'string' && tokenize(format, 0, false).some((part) => part.type === 'segment')
  );
}
export function timePattern(showSeconds: boolean, use12Hours: boolean) {
  return `${use12Hours ? 'hh' : 'HH'}:mm${showSeconds ? ':ss' : ''}${use12Hours ? ' A' : ''}`;
}
export function pickerPattern(
  picker: CalendarMode,
  format: unknown,
  showSeconds = false,
  use12Hours = false,
) {
  if (segmentFormat(format)) return { pattern: format, internal: false };
  const pattern =
    picker === 'year'
      ? 'YYYY'
      : picker === 'month'
        ? 'YYYY-MM'
        : picker === 'quarter'
          ? 'YYYY-[Q]Q'
          : picker === 'week'
            ? 'YYYY-[W]WW'
            : picker === 'datetime'
              ? `YYYY-MM-DD ${timePattern(showSeconds, use12Hours)}`
              : 'YYYY-MM-DD';
  return { pattern, internal: true };
}
export function createTemplate(
  patterns: readonly { pattern: string; internal: boolean }[],
  joiner = ' ~ ',
): SegmentTemplate {
  const parts: TemplatePart[] = [];
  const segments: { kind: SegmentKind; group: number }[] = [];
  patterns.forEach(({ pattern, internal }, group) => {
    if (group > 0) parts.push({ type: 'literal', text: joiner, group: -1 });
    for (const part of tokenize(pattern, group, internal)) {
      if (part.type === 'segment') {
        parts.push({ ...part, index: segments.length });
        segments.push({ kind: part.kind, group });
      } else parts.push(part);
    }
  });
  return { parts, segments, groups: patterns.length, joiner };
}
export const emptySegments = (template: SegmentTemplate) =>
  template.segments.map(() => null) as (number | null)[];
export const timeDate = (parts: TimeParts) =>
  new Date(1970, 0, 1, parts.hour, parts.minute, parts.second, 0);
function isoWeek(date: Date, weekStartsOn: WeekStart) {
  const match = /^(\d{4})-W(\d{2})$/.exec(periodKey(date, 'week', weekStartsOn));
  return match ? [Number(match[1]), Number(match[2])] : [date.getFullYear(), 1];
}
/** Read the editable numbers of each group from its date; `null` dates leave a group empty. */
export function segmentValues(
  template: SegmentTemplate,
  dates: readonly (Date | null | undefined)[],
  weekStartsOn: WeekStart = 1,
): (number | null)[] {
  return template.segments.map(({ kind, group }) => {
    const date = dates[group];
    if (!date || !Number.isFinite(date.getTime())) return null;
    const hasWeek = template.segments.some((item) => item.group === group && item.kind === 'week');
    switch (kind) {
      case 'year':
        return hasWeek ? (isoWeek(date, weekStartsOn)[0] ?? null) : date.getFullYear();
      case 'week':
        return isoWeek(date, weekStartsOn)[1] ?? null;
      case 'quarter':
        return Math.floor(date.getMonth() / 3) + 1;
      case 'month':
        return date.getMonth() + 1;
      case 'day':
        return date.getDate();
      case 'hour':
        return date.getHours();
      case 'hour12':
        return date.getHours() % 12 || 12;
      case 'minute':
        return date.getMinutes();
      case 'second':
        return date.getSeconds();
      default:
        return date.getHours() < 12 ? 0 : 1;
    }
  });
}
export interface RenderedSegments {
  text: string;
  ranges: readonly (readonly [number, number])[];
}
export function renderSegments(
  template: SegmentTemplate,
  values: SegmentValues,
  labels: SegmentLabels,
): RenderedSegments {
  let text = '';
  const ranges: [number, number][] = [];
  for (const part of template.parts) {
    if (part.type === 'literal') {
      text += part.text;
      continue;
    }
    const value = values[part.index];
    const content =
      value === null || value === undefined
        ? (labels.placeholders[part.kind] ??
          (part.kind === 'period' ? '--' : '-'.repeat(limits[part.kind][0])))
        : part.kind === 'period'
          ? (labels.periods[value] ?? '')
          : String(value).padStart(limits[part.kind][0], '0');
    ranges.push([text.length, text.length + content.length]);
    text += content;
  }
  return { text, ranges };
}
/** Text for the owning picker's existing parser, with empty range endpoints omitted. */
export function segmentText(
  template: SegmentTemplate,
  values: SegmentValues,
  labels: SegmentLabels,
) {
  if (values.every((value) => value === null)) return '';
  return Array.from({ length: template.groups }, (_, group) => {
    const parts = template.parts.filter((part) => part.group === group);
    const indexes = parts.flatMap((part) => (part.type === 'segment' ? [part.index] : []));
    if (indexes.every((index) => values[index] == null)) return '';
    return renderSegments({ ...template, parts }, values, labels).text;
  }).join(template.joiner);
}
export interface SegmentEdit {
  values: (number | null)[];
  active: number;
  /** Digits typed into the active segment since it was entered. */
  buffer: string;
}
const nextSegment = (template: SegmentTemplate, active: number) =>
  Math.min(active + 1, template.segments.length - 1);
/** Apply one typed character. Returns `null` when the character is ignored. */
export function typeSegment(
  template: SegmentTemplate,
  state: SegmentEdit,
  input: string,
  periods: readonly [string, string],
): SegmentEdit | null {
  const char = normalizeWidth(input);
  const segment = template.segments[state.active];
  if (!segment) return null;
  const values = [...state.values];
  if (/^\d$/.test(char)) {
    if (segment.kind === 'period') return null;
    const [digits, , max] = limits[segment.kind];
    let buffer = state.buffer + char;
    if (buffer.length > digits) buffer = char;
    values[state.active] = Number(buffer);
    // Move on once no further digit could form a valid value, such as hour "3" or month "2".
    const done =
      buffer.length >= digits ||
      (state.active < template.segments.length - 1 && Number(buffer) * 10 > max);
    if (!done) return { values, active: state.active, buffer };
    return { values, active: nextSegment(template, state.active), buffer: '' };
  }
  if (segment.kind === 'period') {
    const lower = char.toLowerCase();
    const period = [0, 1].find(
      (index) =>
        lower === (index === 0 ? 'a' : 'p') || lower === periods[index]?.charAt(0).toLowerCase(),
    );
    if (period === undefined) return null;
    values[state.active] = period;
    return { values, active: nextSegment(template, state.active), buffer: '' };
  }
  // Space and separators finish a partly typed segment; right after an automatic move they
  // are ignored, so typing "09:30" or "2026-10-25" works either way.
  if (/^[\s\p{P}\p{S}]$/u.test(char) && state.buffer) {
    return { values, active: nextSegment(template, state.active), buffer: '' };
  }
  return null;
}
function daysIn(template: SegmentTemplate, values: SegmentValues, group: number) {
  const find = (kind: SegmentKind) => {
    const index = template.segments.findIndex(
      (segment) => segment.group === group && segment.kind === kind,
    );
    return index < 0 ? null : (values[index] ?? null);
  };
  const month = find('month');
  if (!month) return 31;
  return new Date(find('year') ?? 2000, month, 0).getDate();
}
/** Step the active segment with wrapping. Empty segments start from `fallback`. */
export function stepSegment(
  template: SegmentTemplate,
  state: SegmentEdit,
  delta: 1 | -1,
  fallback: SegmentValues,
  steps: { minute?: number; second?: number } = {},
): SegmentEdit {
  const segment = template.segments[state.active];
  const values = [...state.values];
  if (!segment) return state;
  const current = values[state.active];
  if (current === null || current === undefined) {
    values[state.active] = fallback[state.active] ?? null;
    return { values, active: state.active, buffer: '' };
  }
  if (segment.kind === 'period') {
    values[state.active] = current === 0 ? 1 : 0;
    return { values, active: state.active, buffer: '' };
  }
  const [, min, limit] = limits[segment.kind];
  const max = segment.kind === 'day' ? daysIn(template, values, segment.group) : limit;
  const raw =
    segment.kind === 'minute' ? steps.minute : segment.kind === 'second' ? steps.second : 1;
  const step = Number.isFinite(raw) && raw ? Math.max(1, Math.min(60, Math.floor(raw))) : 1;
  // Stepped minutes and seconds snap to the step grid before moving.
  let next =
    delta > 0
      ? Math.floor((current - min) / step) * step + step + min
      : Math.ceil((current - min) / step) * step - step + min;
  const span = max - min + 1;
  next = ((((next - min) % span) + span) % span) + min;
  values[state.active] = next;
  return { values, active: state.active, buffer: '' };
}
/** Segment index under a caret position; positions between segments pick the next one. */
export function segmentAt(ranges: RenderedSegments['ranges'], position: number) {
  const index = ranges.findIndex(([, end]) => position <= end);
  return index < 0 ? Math.max(0, ranges.length - 1) : index;
}
