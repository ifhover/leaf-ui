import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Timeline } from '../index';

describe('Timeline', () => {
  it('renders items, semantic aliases, reverse order, custom non-SVG dots, and pending item', () => {
    const { container, rerender } = render(
      <Timeline
        reverse
        pending="Loading..."
        items={[
          { key: 'a', label: '09:00', children: 'Created', color: 'success' },
          { key: 'b', children: 'Failed', color: 'error', dot: <span>!</span> },
        ]}
      />,
    );
    const items = container.querySelectorAll('.leaf-timeline__item');
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent('Failed');
    expect(items[0]).toHaveStyle({ '--leaf-timeline-color': 'var(--leaf-color-danger)' });
    expect(items[0]?.querySelector('.leaf-timeline__dot')).toHaveClass(
      'leaf-timeline__dot--custom',
    );
    expect(items[1]).toHaveTextContent('Created');
    expect(items[2]).toHaveAttribute('data-pending', 'true');
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    rerender(
      <Timeline mode="alternate" pending={false} items={[{ key: 'only', children: 'Item' }]} />,
    );
    expect(container.querySelector('.leaf-timeline--alternate')).toBeInTheDocument();
    expect(container.querySelectorAll('.leaf-timeline__item')).toHaveLength(2);

    rerender(<Timeline pending={null} items={[{ key: 'only', children: 'Item' }]} />);
    expect(container.querySelectorAll('.leaf-timeline__item')).toHaveLength(1);
  });
});
