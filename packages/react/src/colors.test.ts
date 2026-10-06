import { describe, expect, it } from 'vitest';
import { colorRecipes } from './color-recipes';
import { deriveColors, mixColors } from './colors';
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
