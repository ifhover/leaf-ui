import { TinyColor } from '@ctrl/tinycolor';
import { describe, expect, it } from 'vitest';
import {
  type ColorScale,
  colorScaleChromaFactors,
  colorScaleLightness,
  colorScaleSteps,
  generateColorScale,
} from './color-scale';

type ReferenceOklch = {
  lightness: number;
  chroma: number;
  hue: number;
};

const srgbToLinear = (channel: number) => {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
};

const referenceOklch = (color: string): ReferenceOklch => {
  const { r, g, b } = new TinyColor(color).toRgb();
  const red = srgbToLinear(r);
  const green = srgbToLinear(g);
  const blue = srgbToLinear(b);
  const l = Math.cbrt(0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue);
  const m = Math.cbrt(0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue);
  const s = Math.cbrt(0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue);
  const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const axisB = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return {
    lightness,
    chroma: Math.hypot(a, axisB),
    hue: ((Math.atan2(axisB, a) * 180) / Math.PI + 360) % 360,
  };
};

const hueDistance = (first: number, second: number) => {
  const difference = Math.abs(first - second) % 360;
  return Math.min(difference, 360 - difference);
};

const getScale = (color: string): ColorScale => {
  const scale = generateColorScale(color);
  expect(scale).toBeDefined();
  if (!scale) throw new Error(`Expected a color scale for ${color}`);
  return scale;
};

const expectValidScale = (scale: ColorScale) => {
  expect(Object.keys(scale)).toEqual(colorScaleSteps.map(String));
  for (const step of colorScaleSteps) {
    const value = scale[step];
    expect(value).toMatch(/^#[0-9a-f]{6}$/);
    const parsed = new TinyColor(value);
    expect(parsed.isValid).toBe(true);
    expect(parsed.getAlpha()).toBe(1);
  }
};

describe('generateColorScale', () => {
  it.each([
    ['red', '#ff0000'],
    ['green', '#00ff00'],
    ['blue', '#0000ff'],
    ['yellow', '#ffff00'],
  ])('creates nine valid steps for %s', (_name, color) => {
    const scale = getScale(color);
    expectValidScale(scale);
    expect(scale[500]).not.toBe(color);
  });

  it('exports complete fixed SSR metadata for every step', () => {
    const steps = colorScaleSteps.map(String);
    expect(Object.keys(colorScaleLightness)).toEqual(steps);
    expect(Object.keys(colorScaleChromaFactors)).toEqual(steps);
    for (const step of colorScaleSteps) {
      expect(colorScaleLightness[step]).toBeGreaterThan(0);
      expect(colorScaleLightness[step]).toBeLessThan(1);
      expect(colorScaleChromaFactors[step]).toBeGreaterThan(0);
      expect(colorScaleChromaFactors[step]).toBeLessThanOrEqual(1);
    }
  });

  it('keeps black, white, and gray neutral without an invented hue', () => {
    const black = getScale('#000000');
    const white = getScale('#ffffff');
    const gray = getScale('#808080');
    expect(black).toEqual(white);
    expect(gray).toEqual(black);

    for (const step of colorScaleSteps) {
      const actual = referenceOklch(black[step]);
      expect(actual.chroma).toBeLessThan(0.001);
      expect(actual.lightness).toBeCloseTo(colorScaleLightness[step], 2);
    }
  });

  it.each([
    ['custom hex', '#1e964f'],
    ['custom rgb', 'rgb(30, 150, 79)'],
    ['custom hsl', 'hsl(145, 67%, 35%)'],
  ])('accepts %s input', (_name, color) => {
    expectValidScale(getScale(color));
  });

  it('rejects invalid, transparent, and non-sRGB CSS color expressions', () => {
    for (const color of [
      '',
      'not-a-color',
      '#12',
      'transparent',
      'rgba(255, 0, 0, 0.5)',
      '#ff000080',
      'var(--brand-color)',
      'color-mix(in srgb, red 50%, blue)',
      'oklch(62.8% 0.2577 29.23)',
      'color(display-p3 1 0 0)',
      'hwb(30 0% 0%)',
      'currentColor',
    ])
      expect(generateColorScale(color), color).toBeUndefined();
  });

  it('keeps OKLCH lightness and relative luminance strictly descending', () => {
    for (const color of ['#ff0000', '#00ff00', '#0000ff', '#ffff00']) {
      const scale = getScale(color);
      for (let index = 1; index < colorScaleSteps.length; index++) {
        const previous = scale[colorScaleSteps[index - 1] ?? 100];
        const current = scale[colorScaleSteps[index] ?? 900];
        expect(referenceOklch(current).lightness).toBeLessThan(referenceOklch(previous).lightness);
        expect(new TinyColor(current).getLuminance()).toBeLessThan(
          new TinyColor(previous).getLuminance(),
        );
      }
    }
  });

  it('is deterministic across calls and equivalent legacy formats', () => {
    const first = getScale('#1e964f');
    expect(generateColorScale('#1e964f')).toEqual(first);
    expect(generateColorScale('rgb(30, 150, 79)')).toEqual(first);
    expect(generateColorScale('red')).toEqual(getScale('#ff0000'));
  });

  it('matches known OKLCH hue data and fixed target lightness', () => {
    const cases = [
      ['#ff0000', 29.23],
      ['#00ff00', 142.5],
      ['#0000ff', 264.05],
    ] as const;
    for (const [color, knownHue] of cases) {
      const scale = getScale(color);
      const middle = referenceOklch(scale[500]);
      expect(middle.lightness).toBeCloseTo(colorScaleLightness[500], 2);
      expect(hueDistance(middle.hue, knownHue)).toBeLessThan(2);
    }
  });

  it('reduces chroma in gamut without hard-clipping hue or lightness', () => {
    const source = referenceOklch('#00ff00');
    const scale = getScale('#00ff00');
    for (const step of colorScaleSteps) {
      const mapped = referenceOklch(scale[step]);
      expect(mapped.lightness).toBeCloseTo(colorScaleLightness[step], 2);
      expect(hueDistance(mapped.hue, source.hue)).toBeLessThan(2);
      expect(mapped.chroma).toBeLessThan(source.chroma);
    }
  });
});
