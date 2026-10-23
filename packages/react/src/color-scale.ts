import { TinyColor } from '@ctrl/tinycolor';

export const colorScaleSteps = [100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

export type ColorScaleStep = (typeof colorScaleSteps)[number];

export type ColorScale = Record<ColorScaleStep, string>;

/** Fixed OKLCH lightness values shared by runtime generation and SSR expressions. */
export const colorScaleLightness: Record<ColorScaleStep, number> = {
  100: 0.97,
  200: 0.92,
  300: 0.84,
  400: 0.74,
  500: 0.64,
  600: 0.54,
  700: 0.44,
  800: 0.34,
  900: 0.24,
};

/** Taper chroma toward white and black while keeping the middle of the scale saturated. */
export const colorScaleChromaFactors: Record<ColorScaleStep, number> = {
  100: 0.12,
  200: 0.25,
  300: 0.53,
  400: 0.84,
  500: 1,
  600: 0.96,
  700: 0.73,
  800: 0.41,
  900: 0.12,
};

type Oklch = {
  lightness: number;
  chroma: number;
  hue: number;
};

const neutralChromaThreshold = 0.002;
const gamutEpsilon = 1e-7;
const legacyColorFunction = /^(?:rgba?|hsla?)\(/i;
const colorFunction = /^[a-z][\w-]*\s*\(/i;

const clamp = (value: number, minimum = 0, maximum = 1) =>
  Math.min(maximum, Math.max(minimum, value));

const srgbToLinear = (channel: number) => {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
};

const linearToSrgb = (channel: number) => {
  const value = clamp(channel);
  return value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055;
};

const rgbToOklch = (red: number, green: number, blue: number): Oklch => {
  const r = srgbToLinear(red);
  const g = srgbToLinear(green);
  const b = srgbToLinear(blue);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const axisB = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const chroma = Math.hypot(a, axisB);
  const hue = ((Math.atan2(axisB, a) * 180) / Math.PI + 360) % 360;
  return { lightness, chroma, hue };
};

const oklchToLinearRgb = ({ lightness, chroma, hue }: Oklch) => {
  const radians = (hue * Math.PI) / 180;
  const a = chroma * Math.cos(radians);
  const b = chroma * Math.sin(radians);
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ] as const;
};

const isInSrgbGamut = (channels: readonly number[]) =>
  channels.every((channel) => channel >= -gamutEpsilon && channel <= 1 + gamutEpsilon);

// Preserve L and h while reducing C to the nearest representable sRGB color.
const fitChromaToSrgb = (lightness: number, hue: number, chroma: number) => {
  if (isInSrgbGamut(oklchToLinearRgb({ lightness, chroma, hue }))) return chroma;
  let low = 0;
  let high = chroma;
  for (let step = 0; step < 24; step++) {
    const middle = (low + high) / 2;
    if (isInSrgbGamut(oklchToLinearRgb({ lightness, chroma: middle, hue }))) low = middle;
    else high = middle;
  }
  return low;
};

const toHex = (channels: readonly number[]) =>
  `#${channels
    .map((channel) =>
      Math.round(clamp(linearToSrgb(channel)) * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;

const createScaleColor = (source: Oklch, lightness: number, chromaFactor: number) => {
  const chroma = source.chroma <= neutralChromaThreshold ? 0 : source.chroma * chromaFactor;
  const hue = source.chroma <= neutralChromaThreshold ? 0 : source.hue;
  const fittedChroma = fitChromaToSrgb(lightness, hue, chroma);
  return toHex(oklchToLinearRgb({ lightness, chroma: fittedChroma, hue }));
};

/** Generate the neutral lightness scale; semantic colors use base-relative shades instead. */
export function generateColorScale(color: string): ColorScale | undefined {
  const input = color.trim();
  if (!input) return undefined;
  if (colorFunction.test(input) && !legacyColorFunction.test(input)) return undefined;
  const parsed = new TinyColor(input);
  if (!parsed.isValid || parsed.getAlpha() < 1) return undefined;

  const { r, g, b } = parsed.toRgb();
  const source = rgbToOklch(r, g, b);
  const scale = Object.fromEntries(
    colorScaleSteps.map((step) => [
      step,
      createScaleColor(source, colorScaleLightness[step], colorScaleChromaFactors[step]),
    ]),
  ) as ColorScale;
  return scale;
}
