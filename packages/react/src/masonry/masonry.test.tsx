import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Masonry } from '../index';

describe('Masonry', () => {
  it('computes responsive column variables and guards numeric column counts', () => {
    const { container, rerender } = render(
      <Masonry columns={{ xs: 1, sm: 2, lg: 4 }} gap={12}>
        <div>First</div>
        <div>Second</div>
      </Masonry>,
    );
    const root = container.querySelector('.leaf-masonry');
    expect(root).toHaveStyle({
      '--leaf-masonry-gap': '12px',
      '--leaf-masonry-columns-xs': '1',
      '--leaf-masonry-columns-sm': '2',
      '--leaf-masonry-columns-md': '2',
      '--leaf-masonry-columns-lg': '4',
      '--leaf-masonry-columns-xl': '4',
    });
    expect(screen.getByText('First').closest('.leaf-masonry__item')).toBeInTheDocument();

    rerender(
      <Masonry columns={Number.NaN} gap="1.5rem">
        {[null, <span key="a">Keep</span>, false]}
      </Masonry>,
    );
    expect(root).toHaveStyle({
      '--leaf-masonry-gap': '1.5rem',
      '--leaf-masonry-columns': '1',
    });
    expect(container.querySelectorAll('.leaf-masonry__item')).toHaveLength(1);
  });
});
