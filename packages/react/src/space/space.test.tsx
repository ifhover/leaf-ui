import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Space } from '../index';

describe('Space', () => {
  it('applies direction, tuple/numeric sizes, wrap, and split separators', () => {
    const { container, rerender } = render(
      <Space direction="vertical" size={[12, 20]} wrap align="start" split="/">
        <span>A</span>
        {null}
        <span>B</span>
      </Space>,
    );
    const root = container.querySelector<HTMLDivElement>('.leaf-space');
    expect(root).toHaveClass('leaf-space--vertical');
    expect(root).toHaveAttribute('data-wrap', 'true');
    expect(root?.style.display).toBe('flex');
    expect(root?.style.flexDirection).toBe('column');
    expect(root?.style.alignItems).toBe('start');
    expect(root?.style.flexWrap).toBe('wrap');
    expect(root?.style.gap).toBe('12px 20px');
    const splits = container.querySelectorAll('.leaf-space__split');
    expect(splits).toHaveLength(1);
    expect(splits[0]).toHaveAttribute('aria-hidden', 'true');

    rerender(
      <Space size={-8} style={{ gap: '2px' }}>
        <span>Only</span>
      </Space>,
    );
    expect(screen.getByText('Only').parentElement).toHaveStyle({ gap: '2px' });
  });
});
