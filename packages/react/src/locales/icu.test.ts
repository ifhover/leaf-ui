// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { extractIcuArguments, formatIcu, type IcuFormatterCaches, parseIcu } from './icu';

function render(
  template: string,
  values: Record<string, string | number | Date>,
  locale = 'en-US',
  pluralLocale = locale,
) {
  const caches: IcuFormatterCaches = {
    numbers: new Map(),
    dates: new Map(),
    plurals: new Map(),
  };
  return formatIcu(parseIcu(template), locale, pluralLocale, values, caches);
}

describe('lightweight ICU parser and formatter', () => {
  it('handles plain interpolation and ICU quote escaping', () => {
    expect(render('Total {total} items', { total: 12 })).toBe('Total 12 items');
    expect(render("It's ''{name}'' in '{braces}'", { name: 'Leaf' })).toBe(
      "It's 'Leaf' in {braces}",
    );
  });

  it('formats plural, exact matches, offset and cross-locale grammar', () => {
    const tpl = '{count, plural, offset:1 =0 {No items} one {# more} other {# others}}';
    expect(render(tpl, { count: 0 })).toBe('No items');
    expect(render(tpl, { count: 2 })).toBe('1 more');
    expect(render(tpl, { count: 5 })).toBe('4 others');

    expect(
      render(
        '{total, plural, one {# item} other {# items}}; {total, number}',
        { total: 1234.5 },
        'de-DE',
        'en-US',
      ),
    ).toBe('1.234,5 items; 1.234,5');
  });

  it('formats select, selectordinal, number and date/time presets', () => {
    expect(
      render('{gender, select, female {She} male {He} other {They}}', { gender: 'female' }),
    ).toBe('She');
    expect(
      render('{rank, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}', { rank: 3 }),
    ).toBe('3rd');
    expect(render('{ratio, number, percent}', { ratio: 0.25 })).toBe('25%');
    expect(render('{value, number, integer}', { value: 12.8 })).toBe('13');

    const date = new Date(2026, 9, 16);
    expect(render('Date: {d, date, short}', { d: date }, 'de-DE')).toBe(
      `Date: ${new Intl.DateTimeFormat('de-DE', {
        month: 'numeric',
        day: 'numeric',
        year: '2-digit',
      }).format(date)}`,
    );
  });

  it('extracts arguments and rejects malformed ICU syntax', () => {
    expect(extractIcuArguments('{count, plural, one {{name} (#)} other {all {extra}}}')).toEqual([
      'count',
      'extra',
      'name',
    ]);

    for (const invalid of [
      '{invalid',
      'stray } brace',
      '{}',
      '{total, plural, invalid',
      '{count, plural, one {#}}',
      '{mode, select, a {A}}',
      '{count, unknown}',
      "'{unterminated",
    ]) {
      expect(() => parseIcu(invalid)).toThrow();
    }
  });
});
