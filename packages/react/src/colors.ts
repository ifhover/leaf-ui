import { TinyColor } from '@ctrl/tinycolor';
import { colorRecipes } from './color-recipes';

export const defaultColors = {
  light: {
    primary: '#20834a',
    'on-primary': '#ffffff',
    danger: '#c83c3c',
    'on-danger': '#ffffff',
    warning: '#a9670e',
    info: '#1677ff',
    success: '#20834a',
    text: '#202024',
    'text-muted': '#68686f',
    surface: '#ffffff',
    'surface-muted': '#f6f6f7',
    border: '#e5e5e8',
  },
  dark: {
    primary: '#83cf9e',
    'on-primary': '#11271a',
    danger: '#ef8585',
    'on-danger': '#381818',
    warning: '#e0b76e',
    info: '#69b1ff',
    success: '#83cf9e',
    text: '#ededf0',
    'text-muted': '#a5a5ae',
    surface: '#1c1c20',
    'surface-muted': '#25252b',
    border: '#38383f',
  },
};

/** sRGB mixing with premultiplied alpha, matching CSS transparent-color semantics. */
export function mixColors(
  first: string | undefined,
  second: string | undefined,
  weight: number,
): string | undefined {
  if (!first || !second) return undefined;
  const a = new TinyColor(first);
  const b = new TinyColor(second);
  if (!a.isValid || !b.isValid) return undefined;
  const x = a.toRgb();
  const y = b.toRgb();
  const ratio = Math.min(1, Math.max(0, weight / 100));
  const alpha = x.a * ratio + y.a * (1 - ratio);
  const channel = (key: 'r' | 'g' | 'b') =>
    alpha ? Math.round((x[key] * x.a * ratio + y[key] * y.a * (1 - ratio)) / alpha) : 0;
  return `rgba(${channel('r')}, ${channel('g')}, ${channel('b')}, ${Number(alpha.toFixed(4))})`;
}

/** Concrete values only; CSS variable inputs can be resolved by the provider in the browser. */
export function deriveColors(appearance: 'light' | 'dark', overrides: Record<string, string> = {}) {
  const colors: Record<string, string> = { ...defaultColors[appearance], ...overrides };
  colors['text-subtle'] ??= mixColors(colors['text-muted'], colors.surface, 92) ?? '#68686f';
  colors['surface-raised'] ??= mixColors(colors.surface, colors.text, 98) ?? '#ffffff';
  colors['border-hover'] ??= mixColors(colors.border, colors['text-muted'], 65) ?? '#e5e5e8';
  const result: Record<`--leaf-${string}`, string> = {};
  for (const [key, [first, second, ratio]] of Object.entries(colorRecipes)) {
    const other =
      second === 'alpha'
        ? 'transparent'
        : second === 'white'
          ? '#fff'
          : second === 'black'
            ? '#000'
            : colors[second];
    const value = mixColors(colors[first], other, ratio);
    if (value) result[key as `--leaf-${string}`] = value;
  }
  for (const key of ['text-subtle', 'surface-raised', 'border-hover'])
    result[`--leaf-color-${key}`] = colors[key] ?? '';
  return result;
}
