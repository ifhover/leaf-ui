import { readability, TinyColor } from '@ctrl/tinycolor';
import { actionColor } from './action-colors';
import { colorRecipes } from './color-recipes';
import {
  type ColorScale,
  type ColorScaleStep,
  colorScaleChromaFactors,
  colorScaleLightness,
  colorScaleSteps,
  generateColorScale,
} from './color-scale';
import { type ColorShades, semanticColorShadeSteps } from './color-shades';

const solidForeground = { black: '#000000', white: '#ffffff' } as const;
export const semanticColorFamilies = ['primary', 'success', 'danger', 'warning', 'info'] as const;
const semanticSeeds = {
  primary: '#007aff',
  success: '#4bb418',
  danger: '#ff4d4f',
  warning: '#e69f12',
  info: '#1677ff',
};
export const colorSeeds = { ...semanticSeeds, neutral: '#707070' };

export const neutralColorScale = generateColorScale(colorSeeds.neutral) as ColorScale;

const cssColorExpression = (color: string) =>
  /^(?:var|color-mix|light-dark|oklch|oklab|lab|lch|color|hwb)\(/i.test(color);

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

export const defaultColors = {
  light: {
    ...semanticSeeds,
    neutral: colorSeeds.neutral,
    'on-primary': solidForeground.white,
    'on-danger': solidForeground.white,
    'on-warning': solidForeground.white,
    'on-info': solidForeground.white,
    'on-success': solidForeground.white,
    text: neutralColorScale[900],
    'text-muted': neutralColorScale[600],
    surface: solidForeground.white,
    'surface-muted': neutralColorScale[100],
    border: neutralColorScale[200],
  },
  dark: {
    ...semanticSeeds,
    neutral: colorSeeds.neutral,
    'on-primary': solidForeground.white,
    'on-danger': solidForeground.white,
    'on-warning': solidForeground.white,
    'on-info': solidForeground.white,
    'on-success': solidForeground.white,
    text: neutralColorScale[100],
    'text-muted': neutralColorScale[400],
    surface: neutralColorScale[900],
    'surface-muted': neutralColorScale[800],
    border: neutralColorScale[800],
  },
};

type ColorVariables = Record<`--leaf-${string}`, string>;
type RoleChoice = { value: string; source: string };

const colorVariable = (name: string): `--leaf-${string}` => `--leaf-color-${name}`;
const concreteOpaque = (value: string) => {
  const parsed = new TinyColor(value);
  return !cssColorExpression(value) && parsed.isValid && parsed.getAlpha() === 1;
};

function scaleForColor(color: string): ColorScale {
  const generated = generateColorScale(color);
  if (generated) return generated;
  // CSS expressions stay browser-native; no DOM reads or hydration color probes are needed.
  return Object.fromEntries(
    colorScaleSteps.map((step) => [
      step,
      `oklch(from ${color} ${colorScaleLightness[step]} calc(c * ${colorScaleChromaFactors[step]}) h)`,
    ]),
  ) as ColorScale;
}

/** Generate only the shared semantic shades; neutral lightness scales are independent. */
export function generateColorShades(color: string): ColorShades {
  return Object.fromEntries(
    semanticColorShadeSteps.map((step) => {
      const [direction, amount] = step.split('-');
      return [
        step,
        mixColors(
          color,
          direction === 'light' ? solidForeground.white : solidForeground.black,
          100 - Number(amount) * 10,
        ) ?? color,
      ];
    }),
  ) as ColorShades;
}

function chooseReadableColor(
  family: string,
  shades: ColorShades,
  seed: string,
  source: string,
  darkSurface: boolean,
  backgrounds: string[],
  minimum: number,
): RoleChoice {
  const ordered = [...semanticColorShadeSteps].sort((a, b) => {
    const preferred = darkSurface ? 'light' : 'dark';
    const priority = (step: string) =>
      (step.startsWith(preferred) ? 0 : 100) + Number(step.split('-')[1]);
    return priority(a) - priority(b);
  });
  const choice = (step: (typeof semanticColorShadeSteps)[number]) => ({
    value: shades[step],
    source: colorVariable(`${family}-${step}`),
  });
  // Expressions remain browser-native. Do not guess a different brand color during SSR.
  if (!backgrounds.every(concreteOpaque) || !concreteOpaque(seed)) return { value: seed, source };
  const matches = (value: string) =>
    backgrounds.every((background) => readability(value, background) >= minimum);
  if (matches(seed)) return { value: seed, source };
  for (const step of ordered) if (matches(shades[step])) return choice(step);
  for (const [source, value] of Object.entries(solidForeground))
    if (matches(value)) return { value, source };
  // Conflicting explicit surfaces can make a single accessible ink impossible.
  const score = (value: string) => Math.min(...backgrounds.map((bg) => readability(value, bg)));
  return [{ value: seed, source }, ...ordered.map(choice)].reduce((best, candidate) =>
    score(candidate.value) > score(best.value) ? candidate : best,
  );
}

/** Bases and their shades stay fixed across appearances; only role mappings switch. */
export function resolveColorRoles(
  appearance: 'light' | 'dark',
  overrides: Record<string, string> = {},
  families: readonly (typeof semanticColorFamilies)[number][] = semanticColorFamilies,
): { values: ColorVariables; sources: Record<string, string> } {
  const colors: Record<string, string> = { ...defaultColors[appearance], ...overrides };
  const values: ColorVariables = {};
  const sources: Record<string, string> = {};
  const dark = appearance === 'dark';
  const assign = (name: string, value: string, source: string) => {
    const key = colorVariable(name);
    values[key] = overrides[name] ?? value;
    sources[key] = overrides[name] !== undefined ? 'override' : source;
  };
  const neutral = overrides.neutral ? scaleForColor(overrides.neutral) : neutralColorScale;
  assign('neutral', colors.neutral ?? colorSeeds.neutral, 'seed');
  const surfaceOverride = overrides.surface;
  const darkSurface =
    surfaceOverride && concreteOpaque(surfaceOverride)
      ? new TinyColor(surfaceOverride).getLuminance() < 0.18
      : dark;
  const neutralRoleSteps: Record<string, ColorScaleStep | 'white'> = {
    text: darkSurface ? 100 : 900,
    'text-muted': darkSurface ? 400 : 600,
    'text-subtle': darkSurface ? 500 : 600,
    surface: dark ? 900 : 'white',
    'surface-muted': darkSurface ? 800 : 100,
    'surface-raised': darkSurface ? 800 : 'white',
    border: darkSurface ? 800 : 200,
    'border-hover': darkSurface ? 700 : 300,
    divider: darkSurface ? 800 : 200,
    'option-hover': darkSurface ? 700 : 200,
  };
  for (const [name, step] of Object.entries(neutralRoleSteps))
    assign(
      name,
      step === 'white' ? solidForeground.white : neutral[step],
      step === 'white' ? 'white' : `neutral-${step}`,
    );
  const surfaceValue = values['--leaf-color-surface'] ?? colors.surface ?? solidForeground.white;
  if (!darkSurface) {
    assign(
      'text-subtle',
      mixColors(neutral[500], neutral[600], 45) ?? neutral[600],
      'mix(neutral-500, neutral-600, 45%)',
    );
    assign(
      'divider',
      mixColors(neutral[200], surfaceValue, 80) ?? neutral[200],
      'mix(neutral-200, --leaf-color-surface, 80%)',
    );
  } else {
    assign(
      'surface-raised',
      mixColors(neutral[800], surfaceValue, 45) ?? neutral[800],
      'mix(neutral-800, --leaf-color-surface, 45%)',
    );
    assign(
      'divider',
      mixColors(neutral[800], surfaceValue, 78) ?? neutral[800],
      'mix(neutral-800, --leaf-color-surface, 78%)',
    );
    assign(
      'option-hover',
      mixColors(neutral[700], neutral[800], 45) ?? neutral[700],
      'mix(neutral-700, neutral-800, 45%)',
    );
  }

  const surface = values['--leaf-color-surface'] ?? colors.surface ?? '';
  const muted = values['--leaf-color-surface-muted'] ?? colors['surface-muted'] ?? '';
  const softStep = darkSurface ? 'dark-9' : 'light-9';
  const softHoverStep = darkSurface ? 'dark-7' : 'light-7';
  const borderFamilies = new Set(['primary', 'danger', 'warning']);

  for (const family of families) {
    const rawSeed = colors[family] ?? semanticSeeds[family];
    // primaryColor: 'neutral' 随明暗外观自动切换黑白高对比角色，深色模式反转填充与图标色。
    const isNeutralPrimary = family === 'primary' && rawSeed.trim().toLowerCase() === 'neutral';
    if (isNeutralPrimary) {
      const neutralPrimary = darkSurface ? neutral[100] : neutral[900];
      const neutralOnPrimary = darkSurface ? neutral[900] : solidForeground.white;
      const key = colorVariable('primary');
      values[key] = neutralPrimary;
      sources[key] = darkSurface ? 'neutral-100' : 'neutral-900';
      assign('on-primary', neutralOnPrimary, darkSurface ? 'neutral-900' : 'white');
      assign(
        'primary-hover',
        darkSurface
          ? (mixColors(neutralPrimary, solidForeground.black, 88) ?? neutral[200])
          : (mixColors(neutralPrimary, solidForeground.white, 86) ?? neutral[800]),
        darkSurface ? 'mix(primary, black, 88%)' : 'mix(primary, white, 86%)',
      );
      assign(
        'primary-active',
        darkSurface
          ? (mixColors(neutralPrimary, solidForeground.black, 78) ?? neutral[300])
          : (mixColors(neutralPrimary, solidForeground.white, 76) ?? neutral[700]),
        darkSurface ? 'mix(primary, black, 78%)' : 'mix(primary, white, 76%)',
      );
      assign(
        'primary-soft',
        darkSurface ? neutral[800] : neutral[100],
        darkSurface ? 'neutral-800' : 'neutral-100',
      );
      assign(
        'primary-soft-hover',
        darkSurface ? neutral[700] : neutral[200],
        darkSurface ? 'neutral-700' : 'neutral-200',
      );
      assign(
        'primary-border',
        darkSurface ? neutral[700] : neutral[300],
        darkSurface ? 'neutral-700' : 'neutral-300',
      );
      assign(
        'primary-link-hover',
        darkSurface ? neutral[400] : neutral[600],
        darkSurface ? 'neutral-400' : 'neutral-600',
      );
      assign(
        'primary-link-active',
        darkSurface ? neutral[100] : neutral[900],
        darkSurface ? 'neutral-100' : 'neutral-900',
      );
      continue;
    }

    const seed = rawSeed;
    const shades = generateColorShades(seed);
    assign(family, seed, 'seed');
    assign(`${family}-soft`, shades[softStep], `${family}-${softStep}`);
    assign(`${family}-soft-hover`, shades[softHoverStep], `${family}-${softHoverStep}`);
    if (borderFamilies.has(family))
      assign(`${family}-border`, shades[softHoverStep], `${family}-${softHoverStep}`);
    if (family !== 'primary') {
      const ink = chooseReadableColor(
        family,
        shades,
        seed,
        colorVariable(family),
        darkSurface,
        [surface, muted, values[colorVariable(`${family}-soft`)] ?? surface],
        4.5,
      );
      assign(`${family}-ink`, ink.value, ink.source);
    }
    // Solid labels default to white; on*Color tokens are the only way to switch them.
    assign(`on-${family}`, solidForeground.white, 'white');

    if (family === 'primary') {
      for (const state of ['active', 'hover'] as const) {
        // 链接交互与实底按压及可读前景色相互独立。
        const linkOffset = state === 'active' ? 1 : -2;
        const linkValue = concreteOpaque(seed)
          ? actionColor(seed, linkOffset)
          : (mixColors(
              seed,
              state === 'active' ? solidForeground.black : solidForeground.white,
              90,
            ) ?? seed);
        assign(
          `primary-link-${state}`,
          overrides[`primary-${state}`] ?? linkValue,
          overrides[`primary-${state}`] !== undefined
            ? colorVariable(`primary-${state}`)
            : concreteOpaque(seed)
              ? `antd-palette(primary, ${6 + linkOffset})`
              : `mix(primary, ${state === 'active' ? 'black' : 'white'}, 90%)`,
        );
        const value =
          state === 'active'
            ? shades['dark-1']
            : concreteOpaque(seed)
              ? actionColor(seed, -1)
              : (mixColors(seed, solidForeground.white, 90) ?? seed);
        assign(
          `primary-${state}`,
          value,
          state === 'active'
            ? 'primary-dark-1'
            : concreteOpaque(seed)
              ? 'antd-palette(primary, 5)'
              : 'mix(primary, white, 90%)',
        );
      }
    } else if (family === 'danger') {
      assign('danger-active', shades['dark-1'], 'danger-dark-1');
    }
  }
  return { values, sources };
}

/** Emit shared roles and only the optical recipes with actual consumers. */
export function deriveColors(appearance: 'light' | 'dark', overrides: Record<string, string> = {}) {
  const modern = resolveColorRoles(appearance, overrides);
  const colors: Record<string, string> = Object.fromEntries(
    Object.entries(modern.values).map(([key, value]) => [key.slice('--leaf-color-'.length), value]),
  );
  const result: ColorVariables = {};
  for (const [key, [first, second, ratio]] of Object.entries(colorRecipes)) {
    const other =
      second === 'alpha'
        ? 'transparent'
        : second === 'white'
          ? solidForeground.white
          : second === 'black'
            ? solidForeground.black
            : colors[second];
    const value = mixColors(colors[first], other, ratio);
    if (value) result[key as `--leaf-${string}`] = value;
  }
  return { ...result, ...modern.values };
}
