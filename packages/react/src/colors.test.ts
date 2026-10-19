import { readability, TinyColor } from '@ctrl/tinycolor';
import { describe, expect, it } from 'vitest';
import { colorRecipes } from './color-recipes';
import { defaultColors, deriveColors, mixColors } from './colors';
import { leafThemeVariables, mergeLeafTheme } from './theme';

describe('theme color derivation', () => {
  it('preserves RGB channels when mixing a transparent color', () => {
    expect(mixColors('#20834a', 'transparent', 12)).toBe('rgba(32, 131, 74, 0.12)');
    expect(mixColors('rgba(255, 0, 0, 0.5)', 'blue', 50)).toBe('rgba(85, 0, 170, 0.75)');
    expect(mixColors('invalid', '#fff', 50)).toBeUndefined();
    expect(mixColors('color(srgb 1 0.5 0)', '#fff', 50)).toBe(
      'color-mix(in srgb, color(srgb 1 0.5 0) 50%, #fff)',
    );
  });
  it('keeps CSS color recipes reactive in initial HTML without replacing them with a static palette', () => {
    const surface = 'color-mix(in srgb, var(--leaf-color-primary) 8%, white)';
    const variables = leafThemeVariables({
      primaryColor: '#ff6900',
      tokens: { mutedSurfaceColor: surface, borderColor: 'var(--brand-ink)' },
    });
    expect(variables['--leaf-color-surface-muted']).toBe(surface);
    expect(variables['--leaf-color-primary-surface-8']).toBeDefined();
    expect(variables['--leaf-color-border-alpha-65']).toBe(
      'color-mix(in srgb, var(--brand-ink) 65%, transparent)',
    );
    expect(variables['--leaf-frame-border-color']).toBe('var(--brand-ink)');
    expect(variables['--leaf-color-on-primary']).toBe('#ffffff');
    expect(leafThemeVariables({})['--leaf-frame-border-color']).toBeUndefined();
  });
  it('chooses readable primary labels automatically and preserves explicit overrides', () => {
    for (const [primaryColor, foreground] of [
      ['#ff6900', '#ffffff'],
      ['#1d9bf0', '#ffffff'],
      ['#ffee00', '#000000'],
      ['#18181b', '#ffffff'],
      ['#20834a', '#ffffff'],
      ['#9a9a9a', '#ffffff'],
      ['#9b9b9b', '#000000'],
    ] as const) {
      for (const appearance of ['light', 'dark'] as const) {
        const variables = leafThemeVariables({ primaryColor, appearance });
        expect(variables['--leaf-color-on-primary']).toBe(foreground);
        expect(
          readability(variables['--leaf-color-primary'] ?? '', foreground),
        ).toBeGreaterThanOrEqual(2.8);
        for (const state of ['hover', 'active'])
          expect(
            readability(variables[`--leaf-color-primary-${state}`] ?? '', foreground),
          ).toBeGreaterThanOrEqual(2.8);
      }
    }
    expect(
      leafThemeVariables({ primaryColor: '#ffee00', tokens: { onPrimaryColor: '#123456' } })[
        '--leaf-color-on-primary'
      ],
    ).toBe('#123456');
  });
  it('keeps dark brand fills and derives readable ink and selected indicators separately', () => {
    for (const primaryColor of ['#18181b', '#000000', '#102c42']) {
      const theme = Object.freeze({ primaryColor, appearance: 'dark' as const });
      const variables = leafThemeVariables(theme);
      expect(variables['--leaf-color-primary']).toBe(primaryColor);
      expect(variables['--leaf-color-on-primary']).toBe('#ffffff');
      const ink = String(variables['--leaf-color-primary-ink']);
      const indicator = String(variables['--leaf-color-primary-indicator']);
      for (const surface of [defaultColors.dark.surface, defaultColors.dark['surface-muted']]) {
        expect(readability(ink, surface)).toBeGreaterThanOrEqual(4.5);
        expect(readability(indicator, surface)).toBeGreaterThanOrEqual(3);
        for (const shade of ['80', '55', '85'])
          expect(
            readability(String(variables[`--leaf-color-primary-text-${shade}`]), surface),
          ).toBeGreaterThanOrEqual(4.5);
      }
      expect(variables['--leaf-color-primary-fill-border']).not.toBe('transparent');
      expect(variables['--leaf-color-primary-focus']).toBe(indicator);
      const before = new TinyColor(primaryColor).toHsl();
      const after = new TinyColor(ink).toHsl();
      expect(after.l).toBeGreaterThan(before.l);
      expect(after.s).toBeCloseTo(before.s, 1);
      if (before.s > 0.1) expect(after.h).toBeCloseTo(before.h, 0);
      const palette = deriveColors('dark', { primary: primaryColor });
      expect(variables).toEqual(palette);
      expect(theme.primaryColor).toBe(primaryColor);
      expect(leafThemeVariables({ ...theme, appearance: 'light' })['--leaf-color-primary']).toBe(
        primaryColor,
      );
    }
    for (const primaryColor of ['#1d9bf0', '#ff6900']) {
      const variables = leafThemeVariables({ primaryColor, appearance: 'dark' });
      expect(variables['--leaf-color-primary']).toBe(primaryColor);
      expect(variables['--leaf-color-on-primary']).toBe('#ffffff');
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
  it('keeps bright warning accents separate from readable tag labels', () => {
    for (const mode of ['light', 'dark'] as const) {
      for (const warning of [defaultColors[mode].warning, '#ffff00', '#7c3aed']) {
        const palette = defaultColors[mode];
        const values = deriveColors(mode, { warning });
        const ink = values['--leaf-color-warning-text-80'] ?? '';
        for (const background of [
          palette.surface,
          palette['surface-muted'],
          values['--leaf-color-warning-surface-8'] ?? '',
        ])
          expect(readability(ink, background)).toBeGreaterThanOrEqual(4.5);
        expect(
          readability(values['--leaf-color-on-warning'] ?? '', warning),
        ).toBeGreaterThanOrEqual(4.5);
        const custom = leafThemeVariables({ appearance: mode, tokens: { warningColor: warning } });
        expect(custom['--leaf-color-warning']).toBe(warning);
        expect(custom['--leaf-color-warning-alpha-12']).toBe(mixColors(warning, 'transparent', 12));
      }
      const amber = new TinyColor(defaultColors[mode].warning).toHsl();
      expect(amber.h).toBeGreaterThan(35);
      expect(amber.h).toBeLessThan(50);
      expect(amber.s).toBeGreaterThan(0.9);
    }
  });
  it('keeps default interaction shades distinct and solid labels readable in both appearances', () => {
    for (const mode of ['light', 'dark'] as const) {
      const palette = defaultColors[mode];
      const values = deriveColors(mode);
      for (const semantic of ['primary', 'danger'] as const) {
        const base = palette[semantic];
        const foreground = palette[`on-${semantic}`];
        const hover = values[`--leaf-color-${semantic}-hover`] ?? '';
        const active = values[`--leaf-color-${semantic}-active`] ?? '';
        expect(new TinyColor(hover).getLuminance()).toBeGreaterThan(
          new TinyColor(base).getLuminance(),
        );
        expect(new TinyColor(active).getLuminance()).toBeLessThan(
          new TinyColor(base).getLuminance(),
        );
        expect(readability(hover, foreground)).toBeGreaterThanOrEqual(4.5);
        expect(readability(active, foreground)).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
  it('derives interaction colors for a custom palette while allowing explicit state overrides', () => {
    const custom = leafThemeVariables({ primaryColor: '#2563eb' });
    expect(custom['--leaf-color-primary-hover']).not.toEqual(
      deriveColors('light')['--leaf-color-primary-hover'],
    );
    expect(readability(custom['--leaf-color-primary-hover'] ?? '', '#fff')).toBeGreaterThanOrEqual(
      4.5,
    );
    const darkCustom = leafThemeVariables({ appearance: 'dark', primaryColor: '#2563eb' });
    expect(darkCustom['--leaf-color-on-primary']).toBe('#ffffff');
    expect(
      readability(darkCustom['--leaf-color-primary-hover'] ?? '', '#fff'),
    ).toBeGreaterThanOrEqual(2.8);
    const customInk = leafThemeVariables({
      appearance: 'dark',
      primaryColor: '#83cf9e',
      tokens: { onPrimaryColor: '#11271a' },
    });
    expect(customInk['--leaf-color-on-primary']).toBe('#11271a');
    expect(
      readability(customInk['--leaf-color-primary-hover'] ?? '', '#11271a'),
    ).toBeGreaterThanOrEqual(4.5);
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
    expect(values['--leaf-color-danger-alpha-12']).toBe('rgba(0, 0, 255, 0.12)');
    expect(values['--leaf-color-primary-surface-8']).toBe(
      mixColors(String(values['--leaf-color-primary']), '#000', 8),
    );
    expect(values['--leaf-color-primary-soft']).toBe('#123456');
    expect(leafThemeVariables({})).toEqual({});
  });
});
