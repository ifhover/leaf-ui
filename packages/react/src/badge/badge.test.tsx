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

describe('Badge placement', () => {
  it('defaults to outside and updates to inside without replacing the target', () => {
    const { container, rerender, getByRole } = render(
      <Badge dot>
        <button type="button">Messages</button>
      </Badge>,
    );
    const target = getByRole('button');
    expect(badgeRoot(container)).toHaveAttribute('data-placement', 'outside');
    rerender(
      <Badge dot placement="inside">
        <button type="button">Messages</button>
      </Badge>,
    );
    expect(badgeRoot(container)).toHaveAttribute('data-placement', 'inside');
    expect(badgeRoot(container)).not.toHaveAttribute('placement');
    expect(getByRole('button')).toBe(target);
  });
});

describe('Badge content', () => {
  it('does not render an indicator without an attached child', () => {
    const { container } = render(<Badge count={120}>{false}</Badge>);
    expect(container.firstChild).toBeNull();
  });

  it('hides empty counts and only shows zero when requested', () => {
    const { rerender, queryByRole, getByRole } = render(
      <Badge>
        <span>Target</span>
      </Badge>,
    );
    expect(queryByRole('status')).not.toBeInTheDocument();
    rerender(
      <Badge count="">
        <span>Target</span>
      </Badge>,
    );
    expect(queryByRole('status')).not.toBeInTheDocument();
    rerender(
      <Badge count={0}>
        <span>Target</span>
      </Badge>,
    );
    expect(queryByRole('status')).not.toBeInTheDocument();
    rerender(
      <Badge count={0} showZero>
        <span>Target</span>
      </Badge>,
    );
    expect(getByRole('status')).toHaveTextContent('0');
  });

  it('keeps attached dots empty and uses an explicit accessible name', () => {
    const { getByRole } = render(
      <Badge dot count={8} aria-label="Unread">
        <span>Target</span>
      </Badge>,
    );
    expect(getByRole('status', { name: 'Unread' })).toHaveClass('leaf-badge__indicator--dot');
    expect(getByRole('status')).toBeEmptyDOMElement();
  });
});

describe('Badge foreground color', () => {
  it.each([
    ['white', '#ffffff', 'var(--leaf-color-on-primary)'],
    ['yellow', '#ffee00', 'var(--leaf-color-on-primary)'],
    ['dark', '#111827', 'var(--leaf-color-on-primary)'],
  ])('uses a white foreground for a %s custom background', (_, color, foreground) => {
    const { container } = render(
      <Badge count={8} color={color}>
        <span>Target</span>
      </Badge>,
    );
    const root = badgeRoot(container);
    expect(root.style.getPropertyValue('--leaf-badge-color')).toBe(color);
    expect(root.style.getPropertyValue('--leaf-badge-on-color')).toBe(foreground);
  });

  it('keeps the danger foreground as a CSS fallback when no custom color is supplied', () => {
    const { container } = render(
      <Badge count={8}>
        <span>Target</span>
      </Badge>,
    );
    expect(badgeRoot(container).style.getPropertyValue('--leaf-badge-on-color')).toBe('');
  });

  it('lets an explicit custom foreground take precedence over the derived value', () => {
    const { container } = render(
      <Badge
        count={8}
        color="#ffee00"
        style={{ '--leaf-badge-on-color': '#123456' } as CSSProperties}
      >
        <span>Target</span>
      </Badge>,
    );
    expect(badgeRoot(container).style.getPropertyValue('--leaf-badge-on-color')).toBe('#123456');
  });

  it('keeps expression backgrounds without reading computed colors', async () => {
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
    const { container } = render(
      <Badge count={8} color="var(--custom-badge-background)">
        <span>Target</span>
      </Badge>,
    );
    expect(
      vi
        .mocked(window.getComputedStyle)
        .mock.calls.every(([node]) => !(node instanceof HTMLElement) || !node.hidden),
    ).toBe(true);
    await waitFor(() =>
      expect(badgeRoot(container).style.getPropertyValue('--leaf-badge-on-color')).toBe(
        'var(--leaf-color-on-primary)',
      ),
    );
  });
});
