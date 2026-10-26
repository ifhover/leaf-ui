import { describe, expect, it } from 'vitest';
import { periodKey, startOfPeriod } from './calendar';
import { dateKey } from './date';
import { parseDateText } from './parse-date';
import { parseTime, timeInRange } from './time';

describe('lenient date and time parsing', () => {
  it.each([
    ['2026-10-05', '2026-10-05'],
    ['2026/10/5', '2026-10-05'],
    ['2026.10.05', '2026-10-05'],
    ['20261005', '2026-10-05'],
    ['2026年10月5日', '2026-10-05'],
    ['２０２６－１０－０５', '2026-10-05'],
  ])('reads %s as a local date', (text, key) => {
    const date = parseDateText(text);
    expect(date && dateKey(date)).toBe(key);
  });
  it.each(['2026-02-30', '20261305', '2026-10', '2026年13月1日'])('rejects %s', (text) => {
    expect(parseDateText(text)).toBeNull();
  });
  it('reads months, quarters and date times with lenient separators', () => {
    expect(parseDateText('2026年10月', 'month')?.getMonth()).toBe(9);
    expect(parseDateText('202610', 'month')?.getMonth()).toBe(9);
    expect(parseDateText('2026 Q3', 'quarter')?.getMonth()).toBe(6);
    const date = parseDateText('2026年10月5日 9:30', 'datetime');
    expect(date?.getDate()).toBe(5);
    expect(date?.getHours()).toBe(9);
    expect(date?.getMinutes()).toBe(30);
  });
  it.each([
    ['9:30', [9, 30, 0]],
    ['9.30', [9, 30, 0]],
    ['930', [9, 30, 0]],
    ['0930', [9, 30, 0]],
    ['093015', [9, 30, 15]],
    ['１４：０５', [14, 5, 0]],
    ['14时5分', [14, 5, 0]],
    ['9点', [9, 0, 0]],
    ['9 PM', [21, 0, 0]],
    ['下午3:45', [15, 45, 0]],
  ] as const)('reads %s as a time', (text, [hour, minute, second]) => {
    expect(parseTime(text)).toEqual({ hour, minute, second });
  });
  it.each(['9', '24:00', '9:60', '12345', 'AM 9:00 PM'])('rejects the time %s', (text) => {
    expect(parseTime(text)).toBeNull();
  });
  it('compares times within inclusive bounds', () => {
    const min = { hour: 9, minute: 30, second: 0 };
    const max = { hour: 18, minute: 0, second: 0 };
    expect(timeInRange({ hour: 9, minute: 30, second: 0 }, min, max)).toBe(true);
    expect(timeInRange({ hour: 9, minute: 29, second: 59 }, min, max)).toBe(false);
    expect(timeInRange({ hour: 18, minute: 0, second: 1 }, min, max)).toBe(false);
  });
});

describe('week periods', () => {
  it('starts weeks on the configured day and keeps ISO numbering', () => {
    const thursday = new Date(2026, 0, 8);
    expect(dateKey(startOfPeriod(thursday, 'week'))).toBe('2026-01-05');
    expect(dateKey(startOfPeriod(thursday, 'week', 0))).toBe('2026-01-04');
    expect(periodKey(thursday, 'week')).toBe('2026-W02');
    expect(periodKey(thursday, 'week', 0)).toBe('2026-W02');
    // A Sunday-start week that holds 1 January 2026 (Thursday) is ISO week 1.
    expect(periodKey(new Date(2025, 11, 28), 'week', 0)).toBe('2026-W01');
    expect(periodKey(new Date(2025, 11, 28), 'week', 1)).toBe('2025-W52');
  });
  it('parses week keys into the configured period start', () => {
    expect(dateKey(parseDateText('2026-W02', 'week') as Date)).toBe('2026-01-05');
    expect(dateKey(parseDateText('2026-W02', 'week', undefined, 0) as Date)).toBe('2026-01-04');
    expect(dateKey(parseDateText('2026W2', 'week') as Date)).toBe('2026-01-05');
    expect(parseDateText('2026-W54', 'week')).toBeNull();
  });
});
