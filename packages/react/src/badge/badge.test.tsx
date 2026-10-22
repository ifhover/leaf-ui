import { render, waitFor } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Badge } from './badge';

function badgeRoot(container: HTMLElement) {
  const root = container.querySelector<HTMLElement>('.leaf-badge');
  if (!root) throw new Error('Badge root missing');
  return root;
}

afterEach(() => vi.restoreAllMocks());

describe('Badge foreground color', () => {
  it.each([
    ['white', '#ffffff', '#000000'],
    ['yellow', '#ffee00', '#000000'],
    ['dark', '#111827', '#ffffff'],
  ])('derives a readable foreground for a %s custom background', (_, color, foreground) => {
    const { container } = render(<Badge count={8} color={color} />);
    const root = badgeRoot(container);
    expect(root.style.getPropertyValue('--leaf-badge-color')).toBe(color);
    expect(root.style.getPropertyValue('--leaf-badge-on-color')).toBe(foreground);
  });

  it('keeps the danger foreground as a CSS fallback when no custom color is supplied', () => {
    const { container } = render(<Badge count={8} />);
    expect(badgeRoot(container).style.getPropertyValue('--leaf-badge-on-color')).toBe('');
  });

  it('lets an explicit custom foreground take precedence over the derived value', () => {
    const { container } = render(
      <Badge
        count={8}
        color="#ffee00"
        style={{ '--leaf-badge-on-color': '#123456' } as CSSProperties}
      />,
    );
    expect(badgeRoot(container).style.getPropertyValue('--leaf-badge-on-color')).toBe('#123456');
  });

  it('resolves a dynamic CSS color before deriving its foreground', async () => {
    const original = window.getComputedStyle.bind(window);
    vi.spyOn(window, 'getComputedStyle').mockImplementation((element, pseudo) => {
      const computed = original(element, pseudo);
      if (!(element instanceof HTMLElement) || !element.hidden) return computed;
      return new Proxy(computed, {
        get(target, property) {
          if (property === 'color') return 'rgb(17, 24, 39)';
          const value = Reflect.get(target, property, target);
          return typeof value === 'function' ? value.bind(target) : value;
        },
      });
    });
    const { container } = render(<Badge count={8} color="var(--custom-badge-background)" />);
    await waitFor(() =>
      expect(badgeRoot(container).style.getPropertyValue('--leaf-badge-on-color')).toBe('#ffffff'),
    );
  });
});
