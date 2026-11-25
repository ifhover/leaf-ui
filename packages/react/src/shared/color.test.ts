// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  colorReadability,
  hsvToRgba,
  isLightColor,
  isValidColor,
  parseColor,
  relativeLuminance,
  rgbaToHex,
  rgbaToHex8,
  rgbaToHslString,
  rgbaToHsv,
  rgbaToRgbString,
} from './color';

describe('internal color utilities', () => {
  it('parses hex, rgb/rgba, hsl/hsla and CSS base names while rejecting expressions', () => {
    expect(parseColor('#1677ff')).toEqual({ r: 22, g: 119, b: 255, a: 1 });
    expect(parseColor('#fff')).toEqual({ r: 255, g: 255, b: 255, a: 1 });
    expect(parseColor('#ff000080')?.a).toBeCloseTo(128 / 255, 5);
    expect(parseColor('rgb(30 150 79 / 50%)')).toEqual({ r: 30, g: 150, b: 79, a: 0.5 });
    expect(parseColor('rgba(255, 0, 0, 0.5)')).toEqual({ r: 255, g: 0, b: 0, a: 0.5 });
    expect(parseColor('transparent')).toEqual({ r: 0, g: 0, b: 0, a: 0 });
    expect(parseColor('blue')).toEqual({ r: 0, g: 0, b: 255, a: 1 });

    const fromHsl = parseColor('hsl(145, 67%, 35%)');
    expect(fromHsl).not.toBeNull();
    if (fromHsl) expect(rgbaToHex(fromHsl)).toBe('#1d954f');

    for (const invalid of ['', 'not-a-color', '#12', 'var(--brand)', 'oklch(60% 0.2 30)']) {
      expect(isValidColor(invalid)).toBe(false);
    }
  });

  it('round-trips HSV/HSL/RGB/Hex8 and evaluates luminance and WCAG contrast', () => {
    const redHalf = { r: 255, g: 0, b: 0, a: 0.5 };
    expect(rgbaToHex8(redHalf)).toBe('#ff000080');
    expect(rgbaToRgbString(redHalf)).toBe('rgba(255, 0, 0, 0.5)');
    expect(rgbaToHslString(redHalf)).toBe('hsla(0, 100%, 50%, 0.5)');

    const hsv = rgbaToHsv({ r: 22, g: 119, b: 255, a: 1 });
    expect(rgbaToHex(hsvToRgba(hsv))).toBe('#1677ff');
    expect(rgbaToHex(hsvToRgba({ h: 120, s: 1, v: 0.1, a: 1 }))).toBe('#001a00');

    expect(colorReadability('#000000', '#ffffff')).toBe(21);
    expect(relativeLuminance({ r: 0, g: 0, b: 0, a: 1 })).toBe(0);
    expect(isLightColor({ r: 255, g: 255, b: 255, a: 1 })).toBe(true);
    expect(isLightColor({ r: 32, g: 51, b: 41, a: 1 })).toBe(false);
  });
});
