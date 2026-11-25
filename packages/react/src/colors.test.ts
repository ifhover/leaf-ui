import { describe, expect, it } from 'vitest';
import { colorRecipes } from './color-recipes';
import { colorScaleSteps, generateColorScale } from './color-scale';
import { semanticColorShadeSteps } from './color-shades';
import {
  defaultColors,
  deriveColors,
  generateColorShades,
  mixColors,
  neutralColorScale,
  resolveColorRoles,
  semanticColorFamilies,
} from './colors';
import { colorReadability, isValidColor, parseColor, relativeLuminance } from './shared/color';
import { leafThemeVariables, mergeLeafTheme } from './theme';

const readability = colorReadability;

const semanticSeeds = {
  primary: '#007aff',
  success: '#4bb418',
  danger: '#ff4d4f',
  warning: '#e69f12',
  info: '#1677ff',
} as const;
const neutralSteps = colorScaleSteps;

describe('theme color derivation', () => {
  it('resolves a single family without rebuilding unrelated status colors', () => {
    for (const appearance of ['light', 'dark'] as const) {
      const overrides = { primary: '#7654c6' };
      const complete = resolveColorRoles(appearance, overrides);
      const primary = resolveColorRoles(appearance, overrides, ['primary']);
      for (const [name, value] of Object.entries(primary.values)) {
        expect(value).toBe(complete.values[name as keyof typeof complete.values]);
        expect(primary.sources[name]).toBe(complete.sources[name]);
      }
      expect(primary.values['--leaf-color-success-light-9']).toBeUndefined();
      expect(primary.values['--leaf-color-on-danger']).toBeUndefined();
    }
  });
  it('retains opaque HWB inputs as reactive expressions until browser resolution', () => {
    const color = 'hwb(146 12% 21%)';
    const values = deriveColors('dark', { primary: color });
    expect(values['--leaf-color-primary']).toBe(color);
    expect(values['--leaf-color-primary-soft']).toBe(`color-mix(in srgb, ${color} 10%, #000000)`);
    expect(values['--leaf-color-primary-alpha-20']).toBe(
      `color-mix(in srgb, ${color} 20%, transparent)`,
    );
    expect(values['--leaf-color-on-primary']).toBe('#ffffff');
  });
  it('preserves RGB channels when mixing a transparent color', () => {
    expect(mixColors('#1e964f', 'transparent', 12)).toBe('rgba(30, 150, 79, 0.12)');
    expect(mixColors('rgba(255, 0, 0, 0.5)', 'blue', 50)).toBe('rgba(85, 0, 170, 0.75)');
    expect(mixColors('invalid', '#fff', 50)).toBeUndefined();
    expect(mixColors('color(srgb 1 0.5 0)', '#fff', 50)).toBe(
      'color-mix(in srgb, color(srgb 1 0.5 0) 50%, #fff)',
    );
  });
  it('keeps CSS expressions intact without browser-dependent palette replacement', () => {
    const surface = 'color-mix(in srgb, var(--leaf-color-primary) 8%, white)';
    const variables = leafThemeVariables({
      primaryColor: '#ff6900',
      tokens: {
        mutedSurfaceColor: surface,
        borderColor: 'var(--brand-ink)',
        frameBorderColor: 'var(--brand-frame)',
      },
    });
    expect(variables['--leaf-color-surface-muted']).toBe(surface);
    expect(variables['--leaf-color-border']).toBe('var(--brand-ink)');
    expect(variables['--leaf-frame-border-color']).toBe('var(--brand-frame)');
    expect(variables['--leaf-color-on-primary']).toBe('#ffffff');
    expect(variables['--leaf-color-primary-active']).toBe(mixColors('#ff6900', '#000000', 90));
  });
  it('defaults solid labels to white independently of base luminance and preserves black overrides', () => {
    for (const primaryColor of ['#ffffff', '#ffee00', '#000000', '#1e964f']) {
      for (const appearance of ['light', 'dark'] as const) {
        expect(leafThemeVariables({ primaryColor, appearance })['--leaf-color-on-primary']).toBe(
          '#ffffff',
        );
        expect(
          leafThemeVariables({ primaryColor, appearance, tokens: { onPrimaryColor: '#000000' } })[
            '--leaf-color-on-primary'
          ],
        ).toBe('#000000');
      }
    }
  });
  it('derives readable status ink internally from semantic shades while preserving explicit primary seeds', () => {
    for (const primaryColor of ['#18181b', '#000000', '#102c42']) {
      const theme = Object.freeze({ primaryColor, appearance: 'dark' as const });
      const variables = leafThemeVariables(theme);
      expect(variables['--leaf-color-primary']).toBe(primaryColor);
      expect(variables['--leaf-color-on-primary']).toBe('#ffffff');
      const palette = deriveColors('dark', { primary: primaryColor });
      expect(variables).toEqual(palette);
      expect(theme.primaryColor).toBe(primaryColor);
      expect(leafThemeVariables({ ...theme, appearance: 'light' })['--leaf-color-primary']).toBe(
        primaryColor,
      );
    }
    for (const family of ['success', 'danger', 'warning', 'info'] as const) {
      const roles = resolveColorRoles('dark', { [family]: '#102c42' });
      const ink = String(roles.values[`--leaf-color-${family}-ink`]);
      for (const surface of [
        defaultColors.dark.surface,
        defaultColors.dark['surface-muted'],
        String(roles.values[`--leaf-color-${family}-soft`]),
      ])
        expect(readability(ink, surface)).toBeGreaterThanOrEqual(4.5);
    }
  });
  it('adapts against custom surfaces while retaining explicit foreground and interaction paint', () => {
    const theme = mergeLeafTheme(
      { appearance: 'dark', primaryColor: '#18181b' },
      {
        tokens: {
          surfaceColor: '#333333',
          mutedSurfaceColor: '#383838',
          onPrimaryColor: '#123456',
          primaryHoverColor: '#abcdef',
        },
      },
    );
    const variables = leafThemeVariables(theme);
    expect(variables['--leaf-color-primary']).toBe('#18181b');
    expect(variables['--leaf-color-on-primary']).toBe('#123456');
    expect(variables['--leaf-color-primary-hover']).toBe('#abcdef');
    expect(
      leafThemeVariables(mergeLeafTheme(theme, { appearance: 'light' }))['--leaf-color-primary'],
    ).toBe('#18181b');
    expect(
      leafThemeVariables({ primaryColor: 'var(--brand)', appearance: 'dark' })[
        '--leaf-color-primary'
      ],
    ).toBe('var(--brand)');
  });
  it('produces every static recipe in both appearances', () => {
    for (const mode of ['light', 'dark'] as const) {
      const values = deriveColors(mode);
      for (const key of Object.keys(colorRecipes))
        expect(isValidColor(values[key as keyof typeof values] ?? ''), key).toBe(true);
    }
  });
  it('keeps warning accents separate from soft ink and uses configurable white solid labels', () => {
    for (const appearance of ['light', 'dark'] as const) {
      const values = deriveColors(appearance, { warning: '#ffff00' });
      expect(values['--leaf-color-warning']).toBe('#ffff00');
      expect(
        readability(
          values['--leaf-color-warning-ink'] ?? '',
          values['--leaf-color-warning-soft'] ?? '',
        ),
      ).toBeGreaterThanOrEqual(4.5);
      expect(values['--leaf-color-on-warning']).toBe('#ffffff');
      expect(
        leafThemeVariables({
          appearance,
          tokens: { warningColor: '#ffff00', onWarningColor: '#000000' },
        })['--leaf-color-on-warning'],
      ).toBe('#000000');
    }
  });
  it('uses white for all five solid foreground defaults in both appearances', () => {
    for (const appearance of ['light', 'dark'] as const) {
      expect(defaultColors[appearance]).toMatchObject(semanticSeeds);
      for (const family of semanticColorFamilies) {
        expect(defaultColors[appearance][`on-${family}`]).toBe('#ffffff');
        expect(deriveColors(appearance)[`--leaf-color-on-${family}`]).toBe('#ffffff');
      }
    }
  });
  it('keeps semantic shades and neutral scales in JS without emitting zero-consumer CSS variables', () => {
    const light = resolveColorRoles('light');
    const dark = resolveColorRoles('dark');
    const omittedKeys = [
      ...semanticColorFamilies.flatMap((family) =>
        semanticColorShadeSteps.map((step) => `--leaf-color-${family}-${step}`),
      ),
      ...colorScaleSteps.map((step) => `--leaf-color-neutral-${step}`),
    ];
    expect(omittedKeys).toHaveLength(44);
    for (const key of omittedKeys) {
      expect(light.values[key as keyof typeof light.values]).toBeUndefined();
      expect(dark.values[key as keyof typeof dark.values]).toBeUndefined();
    }
    for (const family of semanticColorFamilies) {
      expect(light.values[`--leaf-color-${family}`]).toBe(semanticSeeds[family]);
      expect(Object.keys(generateColorShades(semanticSeeds[family]))).toEqual([
        ...semanticColorShadeSteps,
      ]);
      for (const step of colorScaleSteps)
        expect(light.values[`--leaf-color-${family}-${step}`]).toBeUndefined();
    }
    expect(neutralColorScale).toEqual(generateColorScale('#707070'));
  });
  it('mixes only named percentages around the original base and preserves opaque endpoints', () => {
    for (const seed of ['#1677ff', '#1e964f', '#ff0000', '#000000', '#ffffff']) {
      const shades = generateColorShades(seed);
      for (const step of semanticColorShadeSteps) {
        const [direction, amount] = step.split('-');
        const target = direction === 'light' ? '#ffffff' : '#000000';
        expect(shades[step]).toBe(mixColors(seed, target, 100 - Number(amount) * 10));
        const lightness = relativeLuminance(parseColor(shades[step]) ?? { r: 0, g: 0, b: 0, a: 1 });
        const original = relativeLuminance(parseColor(seed) ?? { r: 0, g: 0, b: 0, a: 1 });
        if (direction === 'light') expect(lightness).toBeGreaterThanOrEqual(original);
        else expect(lightness).toBeLessThanOrEqual(original);
      }
    }
  });
  it('keeps readable original ink colors instead of forcing a palette step', () => {
    for (const family of ['success', 'danger', 'warning', 'info'] as const) {
      for (const [mode, seed] of [
        ['light', '#004488'],
        ['dark', '#88ccff'],
      ] as const) {
        const roles = resolveColorRoles(mode, { [family]: seed });
        expect(roles.values[`--leaf-color-${family}-ink`]).toBe(seed);
        expect(roles.sources[`--leaf-color-${family}-ink`]).toBe(`--leaf-color-${family}`);
      }
    }
    const roles = resolveColorRoles('light', { success: '#ffffff' });
    expect(roles.values['--leaf-color-success']).toBe('#ffffff');
    expect(
      readability(roles.values['--leaf-color-success-ink'] ?? '', '#ffffff'),
    ).toBeGreaterThanOrEqual(4.5);
  });
  it('updates neutral seeds and adapts neutral roles to explicit surfaces', () => {
    const values = resolveColorRoles('dark', { neutral: '#64748b', surface: '#ffffff' }).values;
    const scale = generateColorScale('#64748b');
    expect(values['--leaf-color-neutral']).toBe('#64748b');
    expect(values['--leaf-color-text']).toBe(scale?.[900]);
    expect(readability(values['--leaf-color-text'] ?? '', '#ffffff')).toBeGreaterThanOrEqual(4.5);
    expect(resolveColorRoles('light', { primary: '#123456' }).sources['--leaf-color-primary']).toBe(
      'override',
    );
  });
  it('keeps default neutral roles achromatic and preserves explicitly tinted neutral seeds', () => {
    for (const appearance of ['light', 'dark'] as const) {
      const defaults = leafThemeVariables({ appearance });
      const tinted = leafThemeVariables({ appearance, tokens: { neutralColor: '#6c737e' } });
      for (const role of ['text-muted', 'surface-muted', 'border', 'divider'] as const) {
        const { r, g, b } = parseColor(String(defaults[`--leaf-color-${role}`])) ?? {
          r: 0,
          g: 0,
          b: 0,
        };
        expect(r, `${appearance} ${role}`).toBe(g);
        expect(g, `${appearance} ${role}`).toBe(b);
        const explicit = parseColor(String(tinted[`--leaf-color-${role}`])) ?? {
          r: 0,
          g: 0,
          b: 0,
        };
        expect(explicit.b).toBeGreaterThan(explicit.g);
        expect(explicit.g).toBeGreaterThan(explicit.r);
      }
      expect(defaults['--leaf-color-primary']).toBe(tinted['--leaf-color-primary']);
      expect(
        leafThemeVariables({ appearance, tokens: { mutedTextColor: '#123456' } })[
          '--leaf-color-text-muted'
        ],
      ).toBe('#123456');
    }
  });
  it('maps neutral defaults and mode roles to the generated scale and surface mixes', () => {
    const expectations = {
      light: {
        text: { value: neutralColorScale[900], source: 'neutral-900' },
        'text-muted': { value: neutralColorScale[600], source: 'neutral-600' },
        'text-subtle': {
          value: mixColors(neutralColorScale[500], neutralColorScale[600], 45),
          source: 'mix(neutral-500, neutral-600, 45%)',
        },
        'surface-muted': { value: neutralColorScale[100], source: 'neutral-100' },
        'surface-raised': { value: '#ffffff', source: 'white' },
        border: { value: neutralColorScale[200], source: 'neutral-200' },
        'border-hover': { value: neutralColorScale[300], source: 'neutral-300' },
        divider: {
          value: mixColors(neutralColorScale[200], '#ffffff', 80),
          source: 'mix(neutral-200, --leaf-color-surface, 80%)',
        },
        'option-hover': { value: neutralColorScale[200], source: 'neutral-200' },
        surface: { value: '#ffffff', source: 'white' },
      },
      dark: {
        text: { value: neutralColorScale[100], source: 'neutral-100' },
        'text-muted': { value: neutralColorScale[400], source: 'neutral-400' },
        'text-subtle': { value: neutralColorScale[500], source: 'neutral-500' },
        'surface-muted': { value: neutralColorScale[800], source: 'neutral-800' },
        'surface-raised': {
          value: mixColors(neutralColorScale[800], neutralColorScale[900], 45),
          source: 'mix(neutral-800, --leaf-color-surface, 45%)',
        },
        border: { value: neutralColorScale[800], source: 'neutral-800' },
        'border-hover': { value: neutralColorScale[700], source: 'neutral-700' },
        divider: {
          value: mixColors(neutralColorScale[800], neutralColorScale[900], 78),
          source: 'mix(neutral-800, --leaf-color-surface, 78%)',
        },
        'option-hover': {
          value: mixColors(neutralColorScale[700], neutralColorScale[800], 45),
          source: 'mix(neutral-700, neutral-800, 45%)',
        },
        surface: { value: neutralColorScale[900], source: 'neutral-900' },
      },
    } as const;
    for (const mode of ['light', 'dark'] as const) {
      const roles = resolveColorRoles(mode);
      for (const step of neutralSteps)
        expect(
          roles.values[`--leaf-color-neutral-${step}` as keyof typeof roles.values],
        ).toBeUndefined();
      for (const [name, expected] of Object.entries(expectations[mode])) {
        const key = `--leaf-color-${name}` as const;
        expect(roles.values[key], `${mode} ${name}`).toBe(expected.value);
        expect(roles.sources[key], `${mode} ${name} source`).toBe(expected.source);
      }
      for (const name of ['text', 'text-muted', 'surface', 'surface-muted', 'border'] as const)
        expect(roles.values[`--leaf-color-${name}`]).toBe(defaultColors[mode][name]);
      expect(
        readability(
          roles.values['--leaf-color-text-muted'] ?? '',
          roles.values['--leaf-color-surface'] ?? '',
        ),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        readability(
          roles.values['--leaf-color-text-subtle'] ?? '',
          roles.values['--leaf-color-surface'] ?? '',
        ),
      ).toBeGreaterThanOrEqual(4.5);
    }
  });
  it('maps soft and border roles to named shades and keeps ink sources traceable', () => {
    const borderFamilies = new Set(['primary', 'danger', 'warning']);
    for (const mode of ['light', 'dark'] as const) {
      const roles = resolveColorRoles(mode);
      const softStep = mode === 'light' ? 'light-9' : 'dark-9';
      const borderStep = mode === 'light' ? 'light-7' : 'dark-7';
      for (const family of semanticColorFamilies) {
        const shades = generateColorShades(semanticSeeds[family]);
        expect(roles.values[`--leaf-color-${family}-soft`]).toBe(shades[softStep]);
        expect(roles.sources[`--leaf-color-${family}-soft`]).toBe(`${family}-${softStep}`);
        expect(roles.values[`--leaf-color-${family}-soft-hover`]).toBe(shades[borderStep]);
        if (borderFamilies.has(family))
          expect(roles.values[`--leaf-color-${family}-border`]).toBe(shades[borderStep]);
        else expect(roles.values[`--leaf-color-${family}-border`]).toBeUndefined();
        if (family !== 'primary') {
          const inkKey = `--leaf-color-${family}-ink` as const;
          const ink = roles.values[inkKey];
          expect(roles.sources[inkKey]).toBeTruthy();
          for (const bg of [
            roles.values['--leaf-color-surface'],
            roles.values['--leaf-color-surface-muted'],
            roles.values[`--leaf-color-${family}-soft`],
          ])
            expect(readability(ink ?? '', bg ?? '')).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });
  it('adapts modern soft roles to the actual surface luminance and honors explicit roles', () => {
    for (const [mode, surface, muted, softStep, borderStep] of [
      ['light', '#111111', '#222222', 'dark-9', 'dark-7'],
      ['dark', '#ffffff', '#f5f2e8', 'light-9', 'light-7'],
    ] as const) {
      const roles = resolveColorRoles(mode, { surface, 'surface-muted': muted });
      for (const family of semanticColorFamilies) {
        expect(roles.sources[`--leaf-color-${family}-soft`]).toBe(`${family}-${softStep}`);
        if (family === 'primary' || family === 'danger' || family === 'warning')
          expect(roles.sources[`--leaf-color-${family}-border`]).toBe(`${family}-${borderStep}`);
        if (family !== 'primary')
          for (const background of [surface, muted, roles.values[`--leaf-color-${family}-soft`]])
            expect(
              readability(roles.values[`--leaf-color-${family}-ink`] ?? '', background ?? ''),
            ).toBeGreaterThanOrEqual(4.5);
      }
    }
    const overridden = resolveColorRoles('dark', {
      primary: '#18181b',
      'primary-soft': '#112233',
      'on-primary': '#778899',
    });
    expect(overridden.values['--leaf-color-primary-soft']).toBe('#112233');
    expect(overridden.values['--leaf-color-on-primary']).toBe('#778899');
    for (const name of ['primary-soft', 'on-primary'])
      expect(overridden.sources[`--leaf-color-${name}`]).toBe('override');
  });
  it('supports explicit black foregrounds for every semantic family', () => {
    for (const family of semanticColorFamilies) {
      for (const appearance of ['light', 'dark'] as const) {
        const values = deriveColors(appearance, {
          [family]: '#fff59d',
          [`on-${family}`]: '#000000',
        });
        expect(values[`--leaf-color-on-${family}`]).toBe('#000000');
      }
    }
    const values = leafThemeVariables({
      tokens: {
        onPrimaryColor: '#000000',
        onSuccessColor: '#000000',
        onDangerColor: '#000000',
        onWarningColor: '#000000',
        onInfoColor: '#000000',
      },
    });
    for (const family of semanticColorFamilies)
      expect(values[`--leaf-color-on-${family}`]).toBe('#000000');
  });
  it('keeps readable soft ink independently from the fixed solid foreground', () => {
    for (const appearance of ['light', 'dark'] as const) {
      const values = deriveColors(appearance);
      for (const family of ['success', 'danger', 'warning', 'info'] as const) {
        for (const background of [
          values['--leaf-color-surface'],
          values['--leaf-color-surface-muted'],
          values[`--leaf-color-${family}-soft`],
        ])
          expect(
            readability(values[`--leaf-color-${family}-ink`] ?? '', background ?? ''),
          ).toBeGreaterThanOrEqual(4.5);
        expect(values[`--leaf-color-on-${family}`]).toBe('#ffffff');
      }
      expect(values['--leaf-color-on-primary']).toBe('#ffffff');
    }
  });
  it('keeps semantic shade expressions deterministic in SSR without numeric aliases', () => {
    for (const appearance of ['light', 'dark'] as const) {
      const values = leafThemeVariables({
        appearance,
        primaryColor: 'var(--brand-primary)',
        tokens: { successColor: 'var(--brand-success)' },
      });
      for (const family of ['primary', 'success'] as const) {
        const seed = `var(--brand-${family})`;
        const shades = generateColorShades(seed);
        expect(values[`--leaf-color-${family}-soft`]).toBe(
          shades[appearance === 'light' ? 'light-9' : 'dark-9'],
        );
        expect(values[`--leaf-color-${family}-light-9`]).toBeUndefined();
        expect(values[`--leaf-color-${family}-500`]).toBeUndefined();
      }
      expect(values['--leaf-color-success-ink']).toBe('var(--brand-success)');
    }
  });
  it('emits only optical percentage recipes with consumers instead of a legacy matrix', () => {
    for (const appearance of ['light', 'dark'] as const) {
      const values = deriveColors(appearance);
      expect(Object.keys(colorRecipes)).toHaveLength(6);
      for (const [key, [first, second, ratio]] of Object.entries(colorRecipes)) {
        expect(values[key as keyof typeof values]).toBe(
          mixColors(
            values[`--leaf-color-${first}`],
            second === 'alpha' ? 'transparent' : values[`--leaf-color-${second}`],
            ratio,
          ),
        );
      }
      expect(values['--leaf-color-danger-alpha-11']).toBeUndefined();
      expect(values['--leaf-color-primary-surface-8']).toBeUndefined();
      expect(values['--leaf-color-warning-text-80']).toBeUndefined();
    }
  });
  it('supports neutral adaptive monochrome primary across light and dark modes', () => {
    const light = leafThemeVariables({ appearance: 'light', primaryColor: 'neutral' });
    expect(light['--leaf-color-primary']).toBe(neutralColorScale[900]);
    expect(light['--leaf-color-on-primary']).toBe('#ffffff');
    expect(light['--leaf-color-primary-soft']).toBe(neutralColorScale[100]);
    expect(light['--leaf-color-primary-soft-hover']).toBe(neutralColorScale[200]);
    expect(light['--leaf-color-primary-border']).toBe(neutralColorScale[300]);
    expect(
      readability(
        String(light['--leaf-color-on-primary'] ?? ''),
        String(light['--leaf-color-primary'] ?? ''),
      ),
    ).toBeGreaterThanOrEqual(4.5);

    const dark = leafThemeVariables({ appearance: 'dark', primaryColor: 'neutral' });
    expect(dark['--leaf-color-primary']).toBe(neutralColorScale[100]);
    expect(dark['--leaf-color-on-primary']).toBe(neutralColorScale[900]);
    expect(dark['--leaf-color-primary-soft']).toBe(neutralColorScale[800]);
    expect(dark['--leaf-color-primary-soft-hover']).toBe(neutralColorScale[700]);
    expect(dark['--leaf-color-primary-border']).toBe(neutralColorScale[700]);
    expect(dark['--leaf-color-primary-alpha-20']).toBe(
      mixColors(neutralColorScale[100], 'transparent', 20),
    );
    expect(
      readability(
        String(dark['--leaf-color-on-primary'] ?? ''),
        String(dark['--leaf-color-primary'] ?? ''),
      ),
    ).toBeGreaterThanOrEqual(4.5);

    const customOnPrimary = leafThemeVariables({
      appearance: 'dark',
      primaryColor: 'neutral',
      tokens: { onPrimaryColor: '#222222' },
    });
    expect(customOnPrimary['--leaf-color-on-primary']).toBe('#222222');

    const coloredDark = leafThemeVariables({ appearance: 'dark', primaryColor: '#007aff' });
    expect(coloredDark['--leaf-color-primary']).toBe('#007aff');
    expect(coloredDark['--leaf-color-on-primary']).toBe('#ffffff');
  });
  it('deepens solid press colors directly instead of quantizing them to a lighter scale step', () => {
    for (const appearance of ['light', 'dark'] as const) {
      for (const seed of ['#1e964f', '#dd3f2e', '#ffffff', '#000000']) {
        const values = deriveColors(appearance, { primary: seed, danger: seed });
        for (const family of ['primary', 'danger'] as const) {
          const active = values[`--leaf-color-${family}-active`];
          expect(active).toBe(mixColors(seed, '#000000', 90));
          expect(
            relativeLuminance(parseColor(active ?? '') ?? { r: 0, g: 0, b: 0, a: 1 }),
          ).toBeLessThanOrEqual(relativeLuminance(parseColor(seed) ?? { r: 0, g: 0, b: 0, a: 1 }));
        }
      }
    }
  });
  it('matches Ant Design link and Tabs palette steps for brand, danger and neutral seeds', () => {
    // Fixtures from @ant-design/colors@7.2.1: palette steps 4, 5 and 7.
    const fixtures = [
      ['#1677ff', '#69b1ff', '#4096ff', '#0958d9'],
      ['#1e964f', '#5bb079', '#3ba363', '#11703c'],
      ['#ff4d4f', '#ffa39e', '#ff7875', '#d9363e'],
      ['#2563eb', '#7aadff', '#4f8af7', '#1647c4'],
      ['#7654c6', '#bba6e0', '#987bd4', '#563ba1'],
      ['#ffffff', '#ffffff', '#ffffff', '#d9d9d9'],
      ['#000000', '#1a1a1a', '#0d0d0d', '#000000'],
      ['#707070', '#8a8a8a', '#7d7d7d', '#4a4a4a'],
    ] as const;
    for (const appearance of ['light', 'dark'] as const) {
      for (const [seed, linkHover, tabHover, active] of fixtures) {
        const values = deriveColors(appearance, { primary: seed, danger: seed });
        expect(values['--leaf-color-primary-link-hover']).toBe(linkHover);
        expect(values['--leaf-color-primary-hover']).toBe(tabHover);
        expect(values['--leaf-color-primary-link-active']).toBe(active);
      }
    }
  });
  it('keeps expression and translucent action inputs browser-native and preserves alpha', () => {
    for (const seed of ['var(--brand)', 'rgba(22, 119, 255, 0.5)']) {
      const values = deriveColors('dark', { primary: seed });
      expect(values['--leaf-color-primary-link-hover']).toBe(mixColors(seed, '#ffffff', 90));
      expect(values['--leaf-color-primary-link-active']).toBe(mixColors(seed, '#000000', 90));
    }
  });
  it('derives interaction colors for a custom palette while allowing explicit state overrides', () => {
    const custom = leafThemeVariables({ primaryColor: '#2563eb' });
    expect(custom['--leaf-color-primary-hover']).not.toEqual(
      deriveColors('light')['--leaf-color-primary-hover'],
    );
    expect(custom['--leaf-color-primary-hover']).toBe('#4f8af7');
    const darkCustom = leafThemeVariables({ appearance: 'dark', primaryColor: '#2563eb' });
    expect(darkCustom['--leaf-color-on-primary']).toBe('#ffffff');

    const customInk = leafThemeVariables({
      appearance: 'dark',
      primaryColor: '#83cf9e',
      tokens: { onPrimaryColor: '#11271a' },
    });
    expect(customInk['--leaf-color-on-primary']).toBe('#11271a');

    const overridden = leafThemeVariables({
      primaryColor: '#2563eb',
      tokens: {
        primaryHoverColor: '#7c3aed',
        primaryActiveColor: '#4c1d95',
        dangerActiveColor: '#9f1239',
      },
    });
    expect(overridden['--leaf-color-primary-hover']).toBe('#7c3aed');
    expect(overridden['--leaf-color-primary-active']).toBe('#4c1d95');
    expect(overridden['--leaf-color-danger-active']).toBe('#9f1239');
    expect(overridden['--leaf-color-primary-link-hover']).toBe('#7c3aed');
    expect(overridden['--leaf-color-primary-link-active']).toBe('#4c1d95');
    const resolved = deriveColors('dark', {
      primary: 'rgb(37, 99, 235)',
      'on-primary': 'rgb(255, 255, 255)',
      'primary-hover': 'rgb(124, 58, 237)',
      'primary-active': 'rgb(76, 29, 149)',
    });
    expect(resolved['--leaf-color-primary-hover']).toBe('rgb(124, 58, 237)');
    expect(resolved['--leaf-color-primary-active']).toBe('rgb(76, 29, 149)');
  });
  it('recalculates status, surfaces and nested themes and respects explicit overrides', () => {
    const theme = mergeLeafTheme(
      { primaryColor: '#ff0000', appearance: 'dark', tokens: { dangerColor: '#0000ff' } },
      { tokens: { surfaceColor: '#000', primarySoftColor: '#123456' } },
    );
    const values = leafThemeVariables(theme);
    expect(values['--leaf-color-primary-alpha-20']).toBe(
      mixColors(String(values['--leaf-color-primary']), 'transparent', 20),
    );
    expect(values['--leaf-color-danger']).toBe('#0000ff');
    expect(values['--leaf-color-surface']).toBe('#000');
    expect(values['--leaf-color-primary-soft']).toBe('#123456');
    expect(leafThemeVariables({})).toEqual({});
  });
});
