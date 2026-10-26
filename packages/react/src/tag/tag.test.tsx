import { readability } from '@ctrl/tinycolor';
import { render, waitFor } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { describe, expect, it } from 'vitest';
import { generateColorShades, resolveColorRoles } from '../colors';
import { ConfigProvider } from '../config-provider/config-provider';
import { Tag } from './tag';

describe('Tag', () => {
  it('shows a decorative dot by default, allows hiding it and prioritizes custom icons', () => {
    const { container, rerender } = render(<Tag>Live</Tag>);
    expect(container.querySelector('.leaf-tag__dot')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.leaf-tag')).not.toHaveAttribute('dot');
    rerender(<Tag dot={false}>Live</Tag>);
    expect(container.querySelector('.leaf-tag__dot')).toBeNull();
    rerender(<Tag icon={<svg data-testid="custom-icon" />}>Live</Tag>);
    expect(container.querySelector('.leaf-tag__dot')).toBeNull();
    expect(container.querySelector('.leaf-tag__icon svg')).not.toBeNull();
    rerender(
      <Tag dot={false} icon={<svg />}>
        Live
      </Tag>,
    );
    expect(container.querySelector('.leaf-tag__icon svg')).not.toBeNull();
  });

  it('supports outlined tags and regional dot defaults with instance overrides', () => {
    const { container, rerender } = render(
      <ConfigProvider components={{ Tag: { variant: 'outline', dot: false } }}>
        <Tag>Live</Tag>
      </ConfigProvider>,
    );
    expect(container.querySelector('.leaf-tag')).toHaveClass('leaf-tag--outline');
    expect(container.querySelector('.leaf-tag__dot')).toBeNull();
    rerender(
      <ConfigProvider components={{ Tag: { dot: false } }}>
        <Tag dot>Live</Tag>
      </ConfigProvider>,
    );
    expect(container.querySelector('.leaf-tag__dot')).not.toBeNull();
  });

  it('maps presets to status data and leaves custom colors for local derivation', () => {
    const { container, rerender } = render(<Tag color="success">Success</Tag>);
    const tag = container.querySelector<HTMLElement>('.leaf-tag');
    expect(tag).toHaveAttribute('data-color', 'success');

    rerender(<Tag color="#7654c6">Custom</Tag>);
    expect(tag).not.toHaveAttribute('data-color');
    expect(tag?.style.getPropertyValue('--leaf-tag-color')).toBe('#7654c6');
  });

  it('derives readable custom soft labels without inheriting primary ink', async () => {
    const { container } = render(<Tag color="#ffeb3b">Custom</Tag>);
    const tag = container.querySelector<HTMLElement>('.leaf-tag');
    if (!tag) throw new Error('Missing tag');
    await waitFor(() => expect(tag.style.getPropertyValue('--leaf-tag-ink')).not.toBe(''));
    expect(tag.style.getPropertyValue('--leaf-tag-ink')).not.toContain('primary');
    const scale = generateColorShades('#ffeb3b');
    expect(tag.style.getPropertyValue('--leaf-tag-color-surface-8')).toBe(scale['light-9']);
    expect(Object.values(scale ?? {})).toContain(tag.style.getPropertyValue('--leaf-tag-ink'));
    expect(tag.style.getPropertyValue('--leaf-tag-color-alpha-10')).toBe(scale['light-7']);
    expect(tag.style.getPropertyValue('--leaf-tag-ink')).toBe(
      resolveColorRoles('light', { primary: '#ffeb3b' }).values['--leaf-color-primary-ink'],
    );
    expect(
      readability(
        tag.style.getPropertyValue('--leaf-tag-ink'),
        tag.style.getPropertyValue('--leaf-tag-color-surface-8'),
      ),
    ).toBeGreaterThanOrEqual(4.5);
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

  it('derives custom ink from the configured neutral and effective surface without DOM reads', () => {
    const theme = {
      appearance: 'dark' as const,
      tokens: { neutralColor: '#665577', surfaceColor: '#ffffff', onPrimaryColor: '#000000' },
    };
    const { container, rerender } = render(
      <ConfigProvider theme={theme}>
        <Tag color="#ff6900">Custom</Tag>
      </ConfigProvider>,
    );
    const tag = container.querySelector<HTMLElement>('.leaf-tag');
    const expected = resolveColorRoles('dark', {
      primary: '#ff6900',
      neutral: '#665577',
      surface: '#ffffff',
    }).values;
    expect(tag?.style.getPropertyValue('--leaf-tag-ink')).toBe(
      expected['--leaf-color-primary-ink'],
    );
    expect(tag?.style.getPropertyValue('--leaf-tag-color-surface-8')).toBe(
      expected['--leaf-color-primary-soft'],
    );
    rerender(
      <ConfigProvider theme={{ ...theme, tokens: { ...theme.tokens, surfaceColor: '#000000' } }}>
        <Tag color="#ff6900">Custom</Tag>
      </ConfigProvider>,
    );
    expect(tag?.style.getPropertyValue('--leaf-tag-color-surface-8')).toBe(
      generateColorShades('#ff6900')['dark-9'],
    );
  });
});
