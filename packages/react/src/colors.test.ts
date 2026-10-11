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
  });
  it('produces every static recipe in both appearances', () => {
    for (const mode of ['light', 'dark'] as const) {
      const values = deriveColors(mode);
      for (const key of Object.keys(colorRecipes))
        expect(values[key as keyof typeof values], key).toMatch(/^rgba\(/);
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
    ).toBeGreaterThanOrEqual(4.5);
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
    expect(values['--leaf-color-primary-alpha-12']).toBe('rgba(255, 0, 0, 0.12)');
    expect(values['--leaf-color-danger-alpha-12']).toBe('rgba(0, 0, 255, 0.12)');
    expect(values['--leaf-color-primary-surface-8']).toBe('rgba(20, 0, 0, 1)');
    expect(values['--leaf-color-primary-soft']).toBe('#123456');
    expect(leafThemeVariables({})).toEqual({});
  });
});
