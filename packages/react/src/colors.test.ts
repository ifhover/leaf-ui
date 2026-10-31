import { readability, TinyColor } from '@ctrl/tinycolor';
import { describe, expect, it } from 'vitest';
import { colorRecipes } from './color-recipes';
import { type ColorScaleStep, colorScaleSteps, generateColorScale } from './color-scale';
import { type ColorShadeStep, semanticColorShadeSteps } from './color-shades';
import {
  defaultColors,
  deriveColors,
  generateColorShades,
  mixColors,
  neutralColorScale,
  resolveColorRoles,
  semanticColorFamilies,
} from './colors';
import { leafThemeVariables, mergeLeafTheme } from './theme';

const semanticSeeds = {
  primary: '#1e964f',
  success: '#52c41a',
  danger: '#ff4d4f',
  warning: '#faad14',
  info: '#1677ff',
} as const;
const neutralSteps = colorScaleSteps;
function roleShades(
  values: ReturnType<typeof resolveColorRoles>['values'],
  family: (typeof semanticColorFamilies)[number],
) {
  return Object.fromEntries(
    semanticColorShadeSteps.map((step) => [step, values[`--leaf-color-${family}-${step}`]]),
  ) as Record<ColorShadeStep, string>;
}

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
    expect(values['--leaf-color-primary-light-9']).toBe(
      `color-mix(in srgb, ${color} 10%, #ffffff)`,
    );
    expect(values['--leaf-color-primary-alpha-12']).toBe(
      `color-mix(in srgb, ${color} 12%, transparent)`,
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
      tokens: { mutedSurfaceColor: surface, borderColor: 'var(--brand-ink)' },
    });
    expect(variables['--leaf-color-surface-muted']).toBe(surface);
    expect(variables['--leaf-frame-border-color']).toBe('var(--brand-ink)');
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
  it('keeps custom brand fills and derives readable ink and indicators from the same scale', () => {
    for (const primaryColor of ['#18181b', '#000000', '#102c42']) {
      const theme = Object.freeze({ primaryColor, appearance: 'dark' as const });
      const variables = leafThemeVariables(theme);
      const roles = resolveColorRoles('dark', { primary: primaryColor });
      expect(variables['--leaf-color-primary']).toBe(primaryColor);
      expect(variables['--leaf-color-on-primary']).toBe(
        readability(primaryColor, '#000000') >= readability(primaryColor, '#ffffff')
          ? '#000000'
          : '#ffffff',
      );
      const ink = String(variables['--leaf-color-primary-ink']);
      const indicator = String(variables['--leaf-color-primary-indicator']);
      for (const surface of [defaultColors.dark.surface, defaultColors.dark['surface-muted']]) {
        expect(readability(ink, surface)).toBeGreaterThanOrEqual(4.5);
        expect(readability(indicator, surface)).toBeGreaterThanOrEqual(3);
      }
      const soft = String(variables['--leaf-color-primary-soft']);
      expect(readability(ink, soft)).toBeGreaterThanOrEqual(4.5);
      const inkSource = String(roles.sources['--leaf-color-primary-ink']);
      const indicatorSource = String(roles.sources['--leaf-color-primary-indicator']);
      expect(inkSource).toMatch(/^--leaf-color-primary(?:-(?:light|dark)-[1379])?$/u);
      expect(roles.values[inkSource as keyof typeof roles.values]).toBe(ink);
      expect(indicatorSource).toMatch(/^--leaf-color-primary(?:-(?:light|dark)-[1379])?$/u);
      if (indicatorSource !== '--leaf-color-primary')
        expect(roles.values[indicatorSource as keyof typeof roles.values]).toBe(indicator);
      expect(variables['--leaf-color-primary-fill-border']).not.toBe('transparent');
      expect(variables['--leaf-color-primary-focus']).toBe(indicator);
      const before = new TinyColor(primaryColor).toHsl();
      const after = new TinyColor(ink).toHsl();
      expect(after.l).toBeGreaterThan(before.l);
      const palette = deriveColors('dark', { primary: primaryColor });
      expect(variables).toEqual(palette);
      expect(theme.primaryColor).toBe(primaryColor);
      expect(leafThemeVariables({ ...theme, appearance: 'light' })['--leaf-color-primary']).toBe(
        primaryColor,
      );
    }
    for (const primaryColor of ['#1d9bf0', '#ff6900']) {
      const variables = leafThemeVariables({ primaryColor, appearance: 'dark' });
      const roles = resolveColorRoles('dark', { primary: primaryColor });
      expect(variables['--leaf-color-primary']).toBe(primaryColor);
      expect(variables['--leaf-color-on-primary']).toBe('#ffffff');
      const inkSource = String(roles.sources['--leaf-color-primary-ink']);
      expect(inkSource).toMatch(/^--leaf-color-primary(?:-(?:light|dark)-[1379])?$/u);
      expect(variables['--leaf-color-primary-ink']).toBe(
        roles.values[inkSource as keyof typeof roles.values],
      );
      if (
        [
          roles.values['--leaf-color-surface'],
          roles.values['--leaf-color-surface-muted'],
          roles.values['--leaf-color-primary-soft'],
        ].every((bg) => readability(primaryColor, bg ?? '') >= 4.5)
      )
        expect(variables['--leaf-color-primary-ink']).toBe(primaryColor);
      expect(variables['--leaf-color-primary-fill-border']).toBe('transparent');
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
    expect(
      readability(String(variables['--leaf-color-primary-ink']), '#383838'),
    ).toBeGreaterThanOrEqual(4.5);
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
        expect(new TinyColor(values[key as keyof typeof values]).isValid, key).toBe(true);
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
  it('shares 35 semantic shades and nine neutral steps without numeric semantic aliases', () => {
    const light = resolveColorRoles('light');
    const dark = resolveColorRoles('dark');
    const keys = [
      ...semanticColorFamilies.flatMap((family) =>
        semanticColorShadeSteps.map((step) => `--leaf-color-${family}-${step}`),
      ),
      ...colorScaleSteps.map((step) => `--leaf-color-neutral-${step}`),
    ];
    expect(keys).toHaveLength(44);
    for (const key of keys) {
      expect(light.values[key as keyof typeof light.values]).toBe(
        dark.values[key as keyof typeof dark.values],
      );
      expect(new TinyColor(light.values[key as keyof typeof light.values]).isValid).toBe(true);
    }
    for (const family of semanticColorFamilies) {
      expect(light.values[`--leaf-color-${family}`]).toBe(semanticSeeds[family]);
      expect(roleShades(light.values, family)).toEqual(generateColorShades(semanticSeeds[family]));
      for (const step of colorScaleSteps)
        expect(light.values[`--leaf-color-${family}-${step}`]).toBeUndefined();
    }
    expect(neutralColorScale).toEqual(generateColorScale('#6c737e'));
  });
  it('mixes only named percentages around the original base and preserves opaque endpoints', () => {
    for (const seed of ['#1677ff', '#1e964f', '#ff0000', '#000000', '#ffffff']) {
      const shades = generateColorShades(seed);
      for (const step of semanticColorShadeSteps) {
        const [direction, amount] = step.split('-');
        const target = direction === 'light' ? '#ffffff' : '#000000';
        expect(shades[step]).toBe(mixColors(seed, target, 100 - Number(amount) * 10));
        const lightness = new TinyColor(shades[step]).getLuminance();
        const original = new TinyColor(seed).getLuminance();
        if (direction === 'light') expect(lightness).toBeGreaterThanOrEqual(original);
        else expect(lightness).toBeLessThanOrEqual(original);
      }
    }
  });
  it('keeps readable original ink and indicator colors instead of forcing a palette step', () => {
    for (const family of semanticColorFamilies) {
      for (const [mode, seed] of [
        ['light', '#004488'],
        ['dark', '#88ccff'],
      ] as const) {
        const roles = resolveColorRoles(mode, { [family]: seed });
        expect(roles.values[`--leaf-color-${family}-ink`]).toBe(seed);
        expect(roles.sources[`--leaf-color-${family}-ink`]).toBe(`--leaf-color-${family}`);
        if (family === 'primary') expect(roles.values['--leaf-color-primary-indicator']).toBe(seed);
      }
    }
    const roles = resolveColorRoles('light', { primary: '#ffffff' });
    expect(roles.values['--leaf-color-primary']).toBe('#ffffff');
    expect(
      readability(roles.values['--leaf-color-primary-ink'] ?? '', '#ffffff'),
    ).toBeGreaterThanOrEqual(4.5);
  });
  it('updates neutral seeds and adapts neutral roles to explicit surfaces', () => {
    const values = resolveColorRoles('dark', { neutral: '#64748b', surface: '#ffffff' }).values;
    const scale = generateColorScale('#64748b');
    expect(values['--leaf-color-neutral']).toBe('#64748b');
    expect(values['--leaf-color-neutral-600']).toBe(scale?.[600]);
    expect(values['--leaf-color-text']).toBe(scale?.[900]);
    expect(readability(values['--leaf-color-text'] ?? '', '#ffffff')).toBeGreaterThanOrEqual(4.5);
    expect(resolveColorRoles('light', { primary: '#123456' }).sources['--leaf-color-primary']).toBe(
      'override',
    );
  });
  it('carries the blue-gray neutral tint through shared roles and lets callers restore pure gray', () => {
    for (const appearance of ['light', 'dark'] as const) {
      const defaults = leafThemeVariables({ appearance });
      const gray = leafThemeVariables({ appearance, tokens: { neutralColor: '#707070' } });
      for (const role of ['text-muted', 'surface-muted', 'border', 'divider'] as const) {
        const { r, g, b } = new TinyColor(String(defaults[`--leaf-color-${role}`])).toRgb();
        expect(b, `${appearance} ${role}`).toBeGreaterThan(g);
        expect(g, `${appearance} ${role}`).toBeGreaterThan(r);
        const restored = new TinyColor(String(gray[`--leaf-color-${role}`])).toRgb();
        expect(restored.r).toBe(restored.g);
        expect(restored.g).toBe(restored.b);
      }
      expect(defaults['--leaf-color-primary']).toBe(gray['--leaf-color-primary']);
      expect(
        leafThemeVariables({ appearance, tokens: { mutedTextColor: '#123456' } })[
          '--leaf-color-text-muted'
        ],
      ).toBe('#123456');
    }
  });
  it('maps neutral defaults and mode roles to the generated scale or white', () => {
    const expectations = {
      light: {
        text: 900,
        'text-muted': 600,
        'surface-muted': 100,
        'surface-raised': 'white',
        border: 200,
        'border-hover': 300,
        divider: 200,
        'option-hover': 200,
        surface: 'white',
      },
      dark: {
        text: 100,
        'text-muted': 400,
        'surface-muted': 800,
        'surface-raised': 800,
        border: 800,
        'border-hover': 700,
        divider: 800,
        'option-hover': 700,
        surface: 900,
      },
    } as const;
    for (const mode of ['light', 'dark'] as const) {
      const roles = resolveColorRoles(mode);
      for (const step of neutralSteps)
        expect(roles.values[`--leaf-color-neutral-${step}`]).toBe(neutralColorScale[step]);
      for (const [name, source] of Object.entries(expectations[mode])) {
        const key = `--leaf-color-${name}` as const;
        const expected =
          source === 'white' ? '#ffffff' : neutralColorScale[source as ColorScaleStep];
        expect(roles.values[key], `${mode} ${name}`).toBe(expected);
        expect(roles.sources[key], `${mode} ${name} source`).toBe(
          source === 'white' ? 'white' : `--leaf-color-neutral-${source}`,
        );
      }
      for (const name of ['text', 'text-muted', 'surface', 'surface-muted', 'border'] as const)
        expect(roles.values[`--leaf-color-${name}`]).toBe(defaultColors[mode][name]);
    }
  });
  it('maps soft and border roles to named shades and keeps ink sources traceable', () => {
    for (const mode of ['light', 'dark'] as const) {
      const roles = resolveColorRoles(mode);
      const softStep = mode === 'light' ? 'light-9' : 'dark-9';
      const borderStep = mode === 'light' ? 'light-7' : 'dark-7';
      for (const family of semanticColorFamilies) {
        const shades = roleShades(roles.values, family);
        expect(roles.values[`--leaf-color-${family}-soft`]).toBe(shades[softStep]);
        expect(roles.sources[`--leaf-color-${family}-soft`]).toBe(
          `--leaf-color-${family}-${softStep}`,
        );
        expect(roles.values[`--leaf-color-${family}-border`]).toBe(shades[borderStep]);
        const inkKey = `--leaf-color-${family}-ink` as const;
        const ink = roles.values[inkKey];
        const source = roles.sources[inkKey] ?? '';
        expect(roles.values[source as keyof typeof roles.values]).toBe(ink);
        for (const bg of [
          roles.values['--leaf-color-surface'],
          roles.values['--leaf-color-surface-muted'],
          roles.values[`--leaf-color-${family}-soft`],
        ])
          expect(readability(ink ?? '', bg ?? '')).toBeGreaterThanOrEqual(4.5);
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
        expect(roles.sources[`--leaf-color-${family}-soft`]).toBe(
          `--leaf-color-${family}-${softStep}`,
        );
        expect(roles.sources[`--leaf-color-${family}-border`]).toBe(
          `--leaf-color-${family}-${borderStep}`,
        );
        for (const background of [surface, muted, roles.values[`--leaf-color-${family}-soft`]])
          expect(
            readability(roles.values[`--leaf-color-${family}-ink`] ?? '', background ?? ''),
          ).toBeGreaterThanOrEqual(4.5);
      }
    }
    const overridden = resolveColorRoles('dark', {
      primary: '#18181b',
      'primary-soft': '#112233',
      'primary-ink': '#445566',
      'on-primary': '#778899',
      'primary-indicator': '#aabbcc',
    });
    expect(overridden.values['--leaf-color-primary-soft']).toBe('#112233');
    expect(overridden.values['--leaf-color-primary-ink']).toBe('#445566');
    expect(overridden.values['--leaf-color-on-primary']).toBe('#778899');
    expect(overridden.values['--leaf-color-primary-indicator']).toBe('#aabbcc');
    expect(overridden.values['--leaf-color-primary-focus']).toBe('#aabbcc');
    expect(overridden.values['--leaf-color-primary-fill-border']).toBe('#aabbcc');
    for (const name of ['primary-soft', 'primary-ink', 'on-primary', 'primary-indicator'])
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
      for (const family of semanticColorFamilies) {
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
        for (const step of semanticColorShadeSteps)
          expect(values[`--leaf-color-${family}-${step}`]).toBe(shades[step]);
        expect(values[`--leaf-color-${family}-ink`]).toBe(seed);
        expect(values[`--leaf-color-${family}-soft`]).toBe(
          shades[appearance === 'light' ? 'light-9' : 'dark-9'],
        );
        expect(values[`--leaf-color-${family}-500`]).toBeUndefined();
      }
    }
  });
  it('emits only optical percentage recipes with consumers instead of a legacy matrix', () => {
    for (const appearance of ['light', 'dark'] as const) {
      const values = deriveColors(appearance);
      expect(Object.keys(colorRecipes)).toHaveLength(10);
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
  it('keeps the primary indicator visible without moving the brand seed into a scale step', () => {
    const light = resolveColorRoles('light');
    expect(light.values['--leaf-color-primary']).toBe(semanticSeeds.primary);
    expect(light.values['--leaf-color-primary-indicator']).toBe(semanticSeeds.primary);
    expect(light.sources['--leaf-color-primary-indicator']).toBe('--leaf-color-primary');

    const black = resolveColorRoles('dark', { primary: '#18181b' });
    const indicator = black.values['--leaf-color-primary-indicator'];
    expect(indicator).not.toBe('#18181b');
    expect(black.sources['--leaf-color-primary-indicator']).toBe('--leaf-color-primary-light-7');
    expect(black.values['--leaf-color-primary-light-7']).toBe(indicator);
    for (const background of [
      black.values['--leaf-color-surface'],
      black.values['--leaf-color-surface-muted'],
    ])
      expect(readability(indicator ?? '', background ?? '')).toBeGreaterThanOrEqual(3);
    expect(black.values['--leaf-color-on-primary']).toBe('#ffffff');
    expect(black.values['--leaf-color-primary-fill-border']).toBe(indicator);

    const yellow = resolveColorRoles('light', { primary: '#ffff00' });
    expect(yellow.values['--leaf-color-primary-indicator']).not.toBe(
      yellow.values['--leaf-color-primary'],
    );
    expect(yellow.sources['--leaf-color-primary-indicator']).toMatch(
      /^--leaf-color-primary(?:-(?:light|dark)-[1379])?$/u,
    );
  });
  it('deepens solid press colors directly instead of quantizing them to a lighter scale step', () => {
    for (const appearance of ['light', 'dark'] as const) {
      for (const seed of ['#1e964f', '#dd3f2e', '#ffffff', '#000000']) {
        const values = deriveColors(appearance, { primary: seed, danger: seed });
        for (const family of ['primary', 'danger'] as const) {
          const active = values[`--leaf-color-${family}-active`];
          expect(active).toBe(mixColors(seed, '#000000', 90));
          expect(new TinyColor(active).getLuminance()).toBeLessThanOrEqual(
            new TinyColor(seed).getLuminance(),
          );
        }
      }
    }
  });
  it('derives interaction colors for a custom palette while allowing explicit state overrides', () => {
    const custom = leafThemeVariables({ primaryColor: '#2563eb' });
    expect(custom['--leaf-color-primary-hover']).not.toEqual(
      deriveColors('light')['--leaf-color-primary-hover'],
    );
    expect(custom['--leaf-color-primary-hover']).toBe(mixColors('#2563eb', '#ffffff', 90));
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
        dangerHoverColor: '#e11d48',
        dangerActiveColor: '#9f1239',
      },
    });
    expect(overridden['--leaf-color-primary-hover']).toBe('#7c3aed');
    expect(overridden['--leaf-color-primary-active']).toBe('#4c1d95');
    expect(overridden['--leaf-color-danger-hover']).toBe('#e11d48');
    expect(overridden['--leaf-color-danger-active']).toBe('#9f1239');
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
    expect(values['--leaf-color-primary-alpha-12']).toBe(
      mixColors(String(values['--leaf-color-primary']), 'transparent', 12),
    );
    expect(values['--leaf-color-danger']).toBe('#0000ff');
    expect(values['--leaf-color-surface']).toBe('#000');
    expect(values['--leaf-color-primary-soft']).toBe('#123456');
    expect(leafThemeVariables({})).toEqual({});
  });
});
