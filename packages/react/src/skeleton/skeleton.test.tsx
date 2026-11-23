import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  ConfigProvider,
  Skeleton,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonImage,
  SkeletonInput,
} from '../index';

describe('Skeleton', () => {
  it('renders composite skeleton with custom widths and reveals children when loaded', () => {
    const { container, rerender } = render(
      <ConfigProvider locale="en-US">
        <Skeleton avatar round titleWidth={120} rows={2} rowWidths={['80%', '40%']}>
          <span>Loaded</span>
        </Skeleton>
      </ConfigProvider>,
    );
    expect(screen.getByRole('status', { name: 'Loading' })).toHaveClass('leaf-skeleton--round');
    expect(container.querySelector('.leaf-skeleton__title')).toHaveStyle({ width: '120px' });
    const rows = container.querySelectorAll('.leaf-skeleton__row');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveStyle({ width: '80%' });
    expect(rows[1]).toHaveStyle({ width: '40%' });

    rerender(
      <ConfigProvider locale="en-US">
        <Skeleton loading={false}>
          <span>Loaded</span>
        </Skeleton>
      </ConfigProvider>,
    );
    expect(screen.getByText('Loaded')).toBeInTheDocument();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('renders atomic placeholder elements and honors ConfigProvider defaults', () => {
    const { container } = render(
      <ConfigProvider
        locale="en-US"
        components={{
          SkeletonButton: { shape: 'round', size: 'sm' },
          SkeletonInput: { active: false },
        }}
      >
        <Skeleton.Avatar size={48} shape="square" />
        <SkeletonAvatar size="sm" />
        <SkeletonButton block />
        <Skeleton.Input size="lg" block />
        <SkeletonImage size={120} />
        <SkeletonInput />
      </ConfigProvider>,
    );
    expect(container.querySelector('.leaf-skeleton-element--avatar')).toHaveStyle({
      width: '48px',
      height: '48px',
    });
    expect(container.querySelector('.leaf-skeleton-element--button')).toHaveClass(
      'leaf-skeleton-element--sm',
      'leaf-skeleton-element--shape-round',
      'leaf-skeleton-element--block',
    );
    const inputs = container.querySelectorAll('.leaf-skeleton-element--input');
    expect(inputs[0]).toHaveClass('leaf-skeleton-element--lg', 'leaf-skeleton-element--block');
    expect(inputs[0]).not.toHaveClass('leaf-skeleton-element--active');
    expect(container.querySelector('.leaf-skeleton-element--image')).toHaveStyle({
      width: '120px',
      height: '120px',
    });
  });
});
