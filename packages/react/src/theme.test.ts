import { readability, TinyColor } from '@ctrl/tinycolor';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { testThemes } from '../tests/fixtures/theme-data';
import { colorScaleSteps } from './color-scale';
import { semanticColorShadeSteps } from './color-shades';
import { ConfigProvider } from './config-provider/config-provider';
import { type LeafTheme, leafThemeVariables, mergeLeafTheme } from './theme';

describe('portable component themes', () => {
  it('deeply merges interaction fields without changing shared inputs or retaining undefined', () => {
    const parent: LeafTheme = Object.freeze({
      components: Object.freeze({
        Button: Object.freeze({
          borderWidth: 2,
          hover: Object.freeze({ background: '#ddd', color: '#222', shadow: 'none' }),
          disabled: Object.freeze({ color: '#777' }),
        }),
      }),
      tokens: Object.freeze({ controlShadow: '2px 2px #222' }),
    });
    const child: LeafTheme = Object.freeze({
      components: Object.freeze({
        Button: Object.freeze({
          hover: Object.freeze({ background: '#fff', color: undefined }),
          active: Object.freeze({ borderColor: '#111' }),
        }),
      }),
      tokens: Object.freeze({ controlShadow: undefined, borderWidth: 3 }),
    });
    const merged = mergeLeafTheme(parent, child);
    expect(merged.components?.Button).toEqual({
      borderWidth: 2,
      hover: { background: '#fff', color: '#222', shadow: 'none' },
      active: { borderColor: '#111' },
      disabled: { color: '#777' },
    });
    expect(merged.tokens).toEqual({ controlShadow: '2px 2px #222', borderWidth: 3 });
    expect(merged.components?.Button?.hover).not.toBe(parent.components?.Button?.hover);
    expect(merged.components?.Button?.disabled).not.toBe(parent.components?.Button?.disabled);
    expect(parent.components?.Button?.hover?.background).toBe('#ddd');
    expect(child.components?.Button?.hover?.color).toBeUndefined();
  });

  it('emits global lengths and all interaction properties with normalized component names', () => {
    const variables = leafThemeVariables({
      tokens: { borderWidth: 2, controlShadow: '2px 2px black', surfaceShadow: 'none' },
      components: {
        DatePicker: {
          borderWidth: '0.125rem',
          hover: { background: '#fff', color: '#111', borderColor: '#222', shadow: 'none' },
          active: { background: '#ddd' },
          focus: { borderColor: '#009' },
          disabled: { color: '#777', background: undefined },
        },
        'invalid:name': { borderWidth: 3, hover: { color: 'red' } },
      },
    });
    expect(variables).toEqual({
      '--leaf-border-width': '2px',
      '--leaf-control-shadow': '2px 2px black',
      '--leaf-surface-shadow': 'none',
      '--leaf-component-date-picker-border-width': '0.125rem',
      '--leaf-component-date-picker-hover-color': '#111',
      '--leaf-component-date-picker-hover-background': '#fff',
      '--leaf-component-date-picker-hover-border-color': '#222',
      '--leaf-component-date-picker-hover-shadow': 'none',
      '--leaf-component-date-picker-active-background': '#ddd',
      '--leaf-component-date-picker-focus-border-color': '#009',
      '--leaf-component-date-picker-disabled-color': '#777',
    });
    expect(leafThemeVariables({ tokens: { borderWidth: 0 } })['--leaf-border-width']).toBe('0px');
  });

  it.each(['cartoon', 'illustration'] as const)(
    '%s supplies readable text and lets the default preset reset its explicit overrides',
    (name) => {
      const preset = testThemes[name];
      const tokens = preset.tokens ?? {};
      for (const text of [
        tokens.textColor,
        tokens.mutedTextColor,
        preset.primaryColor,
        tokens.dangerColor,
        tokens.successColor,
        tokens.infoColor,
      ])
        for (const background of [tokens.surfaceColor, tokens.mutedSurfaceColor])
          expect(readability(text ?? '', background ?? '')).toBeGreaterThanOrEqual(4.5);
      expect(
        readability(preset.primaryColor ?? '', tokens.onPrimaryColor ?? ''),
      ).toBeGreaterThanOrEqual(4.5);
      const reset = leafThemeVariables(mergeLeafTheme(preset, testThemes.default));
      const defaults = leafThemeVariables(testThemes.default);
      for (const key of Object.keys(leafThemeVariables(preset)) as (keyof typeof reset)[])
        expect(reset[key], key).toEqual(defaults[key]);
    },
  );

  it('renders nested preset and state variables deterministically in initial server HTML', () => {
    const content = createElement(
      ConfigProvider,
      { theme: testThemes.illustration },
      createElement(
        ConfigProvider,
        {
          theme: { components: { Button: { focus: { borderColor: '#056' } } } },
          id: 'nested-theme',
        },
        'Themed content',
      ),
    );
    const first = renderToStaticMarkup(content);
    expect(renderToStaticMarkup(content)).toBe(first);
    const container = document.createElement('div');
    container.innerHTML = first;
    const nested = container.querySelector<HTMLElement>('#nested-theme');
    expect(nested?.style.getPropertyValue('--leaf-border-width')).toBe('2px');
    expect(nested?.style.getPropertyValue('--leaf-control-shadow')).toBe('3px 3px 0 #292b1f');
    expect(nested?.style.getPropertyValue('--leaf-component-button-border-color')).toBe('#292b1f');
    expect(nested?.style.getPropertyValue('--leaf-component-button-focus-border-color')).toBe(
      '#056',
    );
    expect(first).not.toContain('[object Object]');
  });

  it('restores each component semantic focus and shadow fallbacks with the default preset', () => {
    const variables = leafThemeVariables(mergeLeafTheme(testThemes.cartoon, testThemes.default));
    for (const token of ['color-focus', 'control-shadow', 'surface-shadow'] as const)
      expect(variables[`--leaf-${token}`]).toBe('initial');
  });

  it('derives custom solid foregrounds while explicit foreground overrides retain priority', () => {
    const tones = ['primary', 'success', 'warning', 'danger', 'info'] as const;
    for (const mode of ['light', 'dark'] as const) {
      for (const [background, expected] of [
        ['#0b1f3a', '#ffffff'],
        ['#fff59d', '#ffffff'],
      ] as const) {
        const variables = leafThemeVariables({
          appearance: mode,
          primaryColor: background,
          tokens: {
            successColor: background,
            warningColor: background,
            dangerColor: background,
            infoColor: background,
          },
        });
        for (const tone of tones)
          expect(variables[`--leaf-color-on-${tone}`], `${mode} ${tone}`).toBe(expected);
      }
    }

    const overridden = leafThemeVariables({
      appearance: 'dark',
      primaryColor: '#0b1f3a',
      tokens: { onPrimaryColor: '#123456', dangerColor: '#0b1f3a', onDangerColor: '#654321' },
    });
    expect(overridden['--leaf-color-on-primary']).toBe('#123456');
    expect(overridden['--leaf-color-on-danger']).toBe('#654321');
  });

  it('keeps the five seeds and semantic shades and neutral scale values shared while modern roles follow appearance', () => {
    const seeds = {
      primary: '#1e964f',
      success: '#52c41a',
      danger: '#ff4d4f',
      warning: '#faad14',
      info: '#1677ff',
    } as const;
    const families = [...Object.keys(seeds), 'neutral'] as const;
    const light = leafThemeVariables({ appearance: 'light' });
    const dark = leafThemeVariables({ appearance: 'dark' });
    const at = (variables: typeof light, key: string) => variables[key as keyof typeof variables];
    for (const family of families)
      for (const step of family === 'neutral' ? colorScaleSteps : semanticColorShadeSteps) {
        const key = `--leaf-color-${family}-${step}`;
        expect(at(light, key), key).toBe(at(dark, key));
        expect(new TinyColor(at(light, key) ?? '').isValid, key).toBe(true);
      }
    for (const family of Object.keys(seeds) as (keyof typeof seeds)[]) {
      const base = `--leaf-color-${family}`;
      expect(at(light, base)).toBe(seeds[family]);
      expect(at(dark, base)).toBe(seeds[family]);
      expect(at(light, `--leaf-color-${family}-soft`)).toBe(
        at(light, `--leaf-color-${family}-light-9`),
      );
      expect(at(dark, `--leaf-color-${family}-soft`)).toBe(
        at(dark, `--leaf-color-${family}-dark-9`),
      );
      expect(at(light, `--leaf-color-${family}-border`)).toBe(
        at(light, `--leaf-color-${family}-light-7`),
      );
      expect(at(dark, `--leaf-color-${family}-border`)).toBe(
        at(dark, `--leaf-color-${family}-dark-7`),
      );
      expect(at(light, `--leaf-color-on-${family}`)).toBe(at(dark, `--leaf-color-on-${family}`));
    }
  });

  it('keeps expression foregrounds reactive in server HTML while explicit overrides remain unchanged', () => {
    const theme: LeafTheme = {
      appearance: 'light',
      primaryColor: 'var(--brand-primary)',
      tokens: {
        successColor: 'var(--brand-success)',
        dangerColor: 'color-mix(in srgb, #dd3f2e 60%, black)',
        onDangerColor: '#123456',
      },
    };
    const content = createElement(
      ConfigProvider,
      { theme, id: 'expression-theme' },
      'Expression content',
    );
    const first = renderToStaticMarkup(content);
    expect(renderToStaticMarkup(content)).toBe(first);
    const container = document.createElement('div');
    container.innerHTML = first;
    const node = container.querySelector<HTMLElement>('#expression-theme');
    expect(node?.style.getPropertyValue('--leaf-color-primary')).toBe('var(--brand-primary)');
    expect(node?.style.getPropertyValue('--leaf-color-success')).toBe('var(--brand-success)');
    expect(node?.style.getPropertyValue('--leaf-color-danger')).toBe(
      'color-mix(in srgb, #dd3f2e 60%, black)',
    );
    expect(node?.style.getPropertyValue('--leaf-color-primary-ink')).toBe('var(--brand-primary)');
    expect(node?.style.getPropertyValue('--leaf-color-on-danger')).toBe('#123456');
  });
});

describe('component padding geometry', () => {
  it('keeps unitless line-height compatibility and derives an integer text scale', () => {
    expect(leafThemeVariables({ lineHeight: 1.6 })).toEqual({
      '--leaf-line-height': 'calc(var(--leaf-font-size) * 1.6)',
      '--leaf-line-height-sm': 'calc(var(--leaf-font-size-sm) * 1.6)',
      '--leaf-line-height-lg': 'calc(var(--leaf-font-size-lg) * 1.6)',
    });
    expect(leafThemeVariables({ lineHeight: 20 })).toEqual({
      '--leaf-line-height': '20px',
      '--leaf-line-height-sm': 'max(1px, calc(20px - 2px))',
      '--leaf-line-height-lg': 'calc(20px + 2px)',
    });
    expect(leafThemeVariables({ lineHeight: '1.25rem' })).toEqual({
      '--leaf-line-height': '1.25rem',
      '--leaf-line-height-sm': 'calc(var(--leaf-line-height) - 2px)',
      '--leaf-line-height-lg': 'calc(var(--leaf-line-height) + 2px)',
    });
    expect(leafThemeVariables({ lineHeight: '22px', tokens: { lineHeight: 18 } })).toMatchObject({
      '--leaf-line-height': '18px',
      '--leaf-line-height-sm': 'max(1px, calc(18px - 2px))',
      '--leaf-line-height-lg': 'calc(18px + 2px)',
    });
  });

  it('merges and emits section surfaces through ConfigProvider theme inputs', () => {
    const theme = mergeLeafTheme(
      { components: { Modal: { footerBackground: '#f5f5f5', borderColor: '#ddd' } } },
      { tokens: { dividerColor: '#ccc' }, components: { Modal: { headerBackground: '#fff' } } },
    );
    const variables = leafThemeVariables(theme);
    expect(variables['--leaf-color-divider']).toBe('#ccc');
    expect(variables['--leaf-component-modal-footer-background']).toBe('#f5f5f5');
    expect(variables['--leaf-component-modal-header-background']).toBe('#fff');
    expect(variables['--leaf-component-modal-border-color']).toBe('#ddd');
  });
  it.each([
    [6, ['6px', '6px', '6px', '6px']],
    ['4px 8px', ['4px', '8px', '4px', '8px']],
    ['2px 4px 6px', ['2px', '4px', '6px', '4px']],
    ['1px 2px 3px 4px', ['1px', '2px', '3px', '4px']],
    [
      'calc(2px + var(--gap, 1px)) clamp(3px, 1vw, 8px)',
      [
        'calc(2px + var(--gap, 1px))',
        'clamp(3px, 1vw, 8px)',
        'calc(2px + var(--gap, 1px))',
        'clamp(3px, 1vw, 8px)',
      ],
    ],
  ] as const)(
    'retains %s and expands its physical sides for nested curves',
    (padding, expected) => {
      const variables = leafThemeVariables({ components: { Dropdown: { padding } } });
      expect(variables['--leaf-component-dropdown-padding']).toBe(
        typeof padding === 'number' ? `${padding}px` : padding,
      );
      expect(
        ['top', 'right', 'bottom', 'left'].map(
          (side) => variables[`--leaf-component-dropdown-padding-${side}`],
        ),
      ).toEqual(expected);
    },
  );

  it('regenerates all sides when a nested theme overrides shorthand padding', () => {
    const theme = mergeLeafTheme(
      { components: { Dropdown: { padding: '2px 4px 6px 8px', borderRadius: 12 } } },
      { components: { Dropdown: { padding: 3 } } },
    );
    const variables = leafThemeVariables(theme);
    expect(variables['--leaf-component-dropdown-radius']).toBe('12px');
    for (const side of ['top', 'right', 'bottom', 'left'])
      expect(variables[`--leaf-component-dropdown-padding-${side}`]).toBe('3px');
  });
});
