import { readability } from '@ctrl/tinycolor';
import { render, waitFor } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { describe, expect, it } from 'vitest';
import { Tag } from './tag';

describe('Tag', () => {
  it('maps presets to status data and leaves custom colors for local derivation', () => {
    const { container, rerender } = render(<Tag color="success">Success</Tag>);
    const tag = container.querySelector<HTMLElement>('.leaf-tag');
    expect(tag).toHaveAttribute('data-color', 'success');

    rerender(<Tag color="#7654c6">Custom</Tag>);
    expect(tag).not.toHaveAttribute('data-color');
    expect(tag?.style.getPropertyValue('--leaf-tag-color')).toBe('#7654c6');
  });

  it('derives readable custom soft and solid labels without inheriting primary ink', async () => {
    const { container } = render(<Tag color="#ffeb3b">Custom</Tag>);
    const tag = container.querySelector<HTMLElement>('.leaf-tag');
    if (!tag) throw new Error('Missing tag');
    await waitFor(() => expect(tag.style.getPropertyValue('--leaf-tag-ink')).not.toBe(''));
    expect(tag.style.getPropertyValue('--leaf-tag-ink')).not.toContain('primary');
    expect(
      readability(
        tag.style.getPropertyValue('--leaf-tag-ink'),
        tag.style.getPropertyValue('--leaf-tag-color-surface-8'),
      ),
    ).toBeGreaterThanOrEqual(4.5);
    expect(readability(tag.style.getPropertyValue('--leaf-tag-solid-ink'), '#ffeb3b')).toBe(
      readability('#000000', '#ffeb3b'),
    );
  });

  it('preserves explicit local tag variables and reactive expressions', () => {
    const { container, rerender } = render(
      <Tag color="#ffeb3b" style={{ '--leaf-tag-ink': 'rgb(1, 2, 3)' } as CSSProperties}>
        Explicit
      </Tag>,
    );
    const tag = container.querySelector<HTMLElement>('.leaf-tag');
    expect(tag?.style.getPropertyValue('--leaf-tag-ink')).toBe('rgb(1, 2, 3)');

    rerender(<Tag color="var(--custom-tag-color)">Reactive</Tag>);
    expect(tag?.style.getPropertyValue('--leaf-tag-color-surface-8')).toContain(
      'var(--custom-tag-color)',
    );
  });
});
