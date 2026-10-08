import { describe, expect, it } from 'vitest';
import { leafThemeVariables, mergeLeafTheme } from './theme';

describe('component padding geometry', () => {
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
