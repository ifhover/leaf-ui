import { readability, TinyColor } from '@ctrl/tinycolor';
import { colorRecipes } from './color-recipes';

export const defaultColors = {
  light: {
    primary: '#1e964f',
    'on-primary': '#000000',
    danger: '#dd3f2e',
    'on-danger': '#000000',
    warning: '#d38b11',
    'on-warning': '#202024',
    info: '#1677ff',
    'on-info': '#000000',
    success: '#1e964f',
    'on-success': '#000000',
    text: '#202020',
    'text-muted': '#707070',
    surface: '#ffffff',
    'surface-muted': '#f5f5f5',
    border: '#e2e2e2',
  },
  dark: {
    primary: '#83cf9e',
    'on-primary': '#11271a',
    danger: '#ef8585',
    'on-danger': '#381818',
    warning: '#ffc53d',
    'on-warning': '#202024',
    info: '#69b1ff',
    'on-info': '#11271a',
    success: '#83cf9e',
    'on-success': '#11271a',
    text: '#ededed',
    'text-muted': '#aaaaaa',
    surface: '#1c1c1c',
    'surface-muted': '#272727',
    border: '#3b3b3b',
  },
};

/** Choose the higher-contrast black or white label unless the caller supplies another value. */
export function primaryForeground(color: string) {
  if (cssColorExpression(color) || !new TinyColor(color).isValid) return undefined;
  return readability(color, '#000000') >= readability(color, '#ffffff') ? '#000000' : '#ffffff';
}

const cssColorExpression = (color: string) =>
  /^(?:var|color-mix|light-dark|oklch|oklab|lab|lch|color)\(/i.test(color);

/** Derive visible ink/indicators without altering the brand fill or supplied theme. */
export function readableColor(
  color: string,
  backgrounds: string[],
  minimum = 4.5,
  appearance: 'light' | 'dark' = 'light',
) {
  if ([color, ...backgrounds].some((value) => cssColorExpression(value))) return color;
  const primary = new TinyColor(color);
  const surfaces = backgrounds.map((value) => new TinyColor(value));
  if ([primary, ...surfaces].some((value) => !value.isValid || value.getAlpha() !== 1))
    return color;
  const contrasts = (candidate: string) =>
    backgrounds.every((background) => readability(candidate, background) >= minimum);
  if (contrasts(color)) return color;
  const { h, s, l } = primary.toHsl();
  const endpoints = appearance === 'dark' ? ['#ffffff', '#000000'] : ['#000000', '#ffffff'];
  for (const endpoint of endpoints) {
    if (!contrasts(endpoint)) continue;
    const endpointLightness = endpoint === '#000000' ? 0 : 1;
    if (endpointLightness < l) {
      let low = endpointLightness;
      let high = l;
      let result = endpoint;
      for (let step = 0; step < 16; step++) {
        const lightness = (low + high) / 2;
        const candidate = new TinyColor({ h, s, l: lightness }).toHexString();
        if (contrasts(candidate)) {
          result = candidate;
          low = lightness;
        } else high = lightness;
      }
      return result;
    }
    let low = l;
    let high = endpointLightness;
    let result = endpoint;
    for (let step = 0; step < 16; step++) {
      const lightness = (low + high) / 2;
      const candidate = new TinyColor({ h, s, l: lightness }).toHexString();
      if (contrasts(candidate)) {
        result = candidate;
        high = lightness;
      } else low = lightness;
    }
    return result;
  }
  return color;
}

/** sRGB mixing with premultiplied alpha, matching CSS transparent-color semantics. */
export function mixColors(
  first: string | undefined,
  second: string | undefined,
  weight: number,
): string | undefined {
  if (!first || !second) return undefined;
  const a = new TinyColor(first);
  const b = new TinyColor(second);
  if (cssColorExpression(first) || cssColorExpression(second) || !a.isValid || !b.isValid) {
    const cssColor = (value: string) => cssColorExpression(value) || new TinyColor(value).isValid;
    return cssColor(first) && cssColor(second)
      ? `color-mix(in srgb, ${first} ${Math.min(100, Math.max(0, weight))}%, ${second})`
      : undefined;
  }
  const x = a.toRgb();
  const y = b.toRgb();
  const ratio = Math.min(1, Math.max(0, weight / 100));
  const alpha = x.a * ratio + y.a * (1 - ratio);
  const channel = (key: 'r' | 'g' | 'b') =>
    alpha ? Math.round((x[key] * x.a * ratio + y[key] * y.a * (1 - ratio)) / alpha) : 0;
  return `rgba(${channel('r')}, ${channel('g')}, ${channel('b')}, ${Number(alpha.toFixed(4))})`;
}

/** Derive once per theme; keep readable solid-button labels when changing shade. */
function interactionColor(color: string, foreground: string, toward: string, amounts: number[]) {
  if (
    cssColorExpression(color) ||
    cssColorExpression(foreground) ||
    !new TinyColor(color).isValid ||
    !new TinyColor(foreground).isValid
  )
    return undefined;
  // Keep distinct interaction shades without sacrificing normal-text AA.
  const minimumContrast = 4.5;
  for (const amount of amounts) {
    const candidate = mixColors(color, toward, 100 - amount);
    if (candidate && readability(candidate, foreground) >= minimumContrast) return candidate;
  }
  return color;
}

/** Keep CSS expressions reactive in SSR; resolve contrast-sensitive values after hydration. */
export function deriveColors(appearance: 'light' | 'dark', overrides: Record<string, string> = {}) {
  const colors: Record<string, string> = { ...defaultColors[appearance], ...overrides };
  const backgrounds = [colors.surface ?? '', colors['surface-muted'] ?? ''];
  const visible = (color: string, minimum: number) =>
    readableColor(color, backgrounds, minimum, appearance);
  const primary = colors.primary ?? '';
  const indicator = visible(primary, 3);
  const dim = indicator !== primary;
  const hasPrimary = Boolean(overrides.primary);
  if (hasPrimary && !overrides['on-primary'])
    colors['on-primary'] =
      primaryForeground(colors.primary ?? '') ?? defaultColors[appearance]['on-primary'];
  const hasDanger = Boolean(overrides.danger);
  if (hasDanger && !overrides['on-danger'])
    colors['on-danger'] =
      primaryForeground(colors.danger ?? '') ?? defaultColors[appearance]['on-danger'];
  for (const status of ['success', 'warning', 'info'] as const) {
    if (!overrides[status] || overrides[`on-${status}`]) continue;
    colors[`on-${status}`] =
      primaryForeground(colors[status] ?? '') ?? defaultColors[appearance][`on-${status}`];
  }
  colors['text-subtle'] ??= mixColors(colors['text-muted'], colors.surface, 92) ?? '#68686f';
  colors['surface-raised'] ??= mixColors(colors.surface, colors.text, 98) ?? '#ffffff';
  colors['border-hover'] ??= mixColors(colors.border, colors['text-muted'], 65) ?? '#e5e5e8';
  const result: Record<`--leaf-${string}`, string> = {};
  result['--leaf-color-primary-indicator'] = indicator;
  result['--leaf-color-primary-fill-border'] = dim
    ? (mixColors(primary, colors.text, 80) ?? 'transparent')
    : 'transparent';
  result['--leaf-color-primary-focus'] = dim
    ? indicator
    : (mixColors(primary, 'transparent', 42) ?? 'transparent');
  if (hasPrimary) {
    result['--leaf-color-primary'] = colors.primary ?? '';
  }
  if (hasDanger) {
    result['--leaf-color-danger'] = colors.danger ?? '';
  }
  for (const status of ['primary', 'success', 'warning', 'danger', 'info'] as const) {
    result[`--leaf-color-on-${status}`] =
      colors[`on-${status}`] ?? defaultColors[appearance][`on-${status}`];
  }
  for (const [key, [first, second, ratio]] of Object.entries(colorRecipes)) {
    const other =
      second === 'alpha'
        ? 'transparent'
        : second === 'white'
          ? '#fff'
          : second === 'black'
            ? '#000'
            : colors[second];
    const source = dim && first === 'primary' && second === 'surface' ? indicator : colors[first];
    const value = mixColors(source, other, ratio);
    if (value) result[key as `--leaf-${string}`] = value;
  }
  for (const status of ['primary', 'success', 'warning', 'danger', 'info'] as const) {
    const statusBackgrounds = [
      colors.surface,
      colors['surface-muted'],
      result[`--leaf-color-${status}-surface-8`],
    ].filter((color): color is string => Boolean(color));
    result[`--leaf-color-${status}-ink`] = readableColor(
      colors[status] ?? '',
      statusBackgrounds,
      4.5,
      appearance,
    );
  }
  for (const key of ['text-subtle', 'surface-raised', 'border-hover'])
    result[`--leaf-color-${key}`] = colors[key] ?? '';
  // Bright warning glyphs and fills need a separate, readable text color.
  const warning = colors.warning;
  const text = colors.text;
  if (
    warning &&
    text &&
    !cssColorExpression(warning) &&
    !cssColorExpression(text) &&
    new TinyColor(warning).isValid &&
    new TinyColor(text).isValid
  ) {
    const backgrounds = [
      colors.surface,
      colors['surface-muted'],
      result['--leaf-color-warning-surface-8'],
    ].filter((color): color is string => Boolean(color));
    for (let weight = 80; weight >= 0; weight -= 10) {
      const ink = mixColors(warning, text, weight);
      if (ink && backgrounds.every((background) => readability(ink, background) >= 4.5)) {
        result['--leaf-color-warning-text-80'] = ink;
        break;
      }
    }
  }
  for (const key of ['primary', 'danger']) {
    const color = colors[key];
    const foreground = colors[`on-${key}`];
    if (!color || !foreground) continue;
    const hover =
      colors[`${key}-hover`] ?? interactionColor(color, foreground, '#fff', [10, 8, 6, 4, 2.5, 1]);
    const active =
      colors[`${key}-active`] ??
      interactionColor(color, foreground, '#000', [15, 12, 10, 8, 6, 4, 2.5, 1]);
    if (hover) result[`--leaf-color-${key}-hover`] = hover;
    if (active) result[`--leaf-color-${key}-active`] = active;
    if (key === 'primary') {
      if (hover)
        result['--leaf-color-primary-ink-hover'] = colors['primary-hover'] ?? visible(hover, 4.5);
      if (active)
        result['--leaf-color-primary-ink-active'] =
          colors['primary-active'] ?? visible(active, 4.5);
    }
  }
  return result;
}
