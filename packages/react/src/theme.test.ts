import { readability } from '@ctrl/tinycolor';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { testThemes } from '../tests/fixtures/theme-data';
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
});

describe('component padding geometry', () => {
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
