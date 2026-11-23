import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { type CSSProperties, createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { generateColorShades, resolveColorRoles } from '../colors';
import { ConfigProvider } from '../config-provider/config-provider';
import { Tooltip } from '../tooltip';
import { CheckableTag, TagGroup } from './group';
import { Tag } from './tag';

describe('Tag', () => {
  it('renders custom icons without a built-in dot', () => {
    const { container, rerender } = render(<Tag>Live</Tag>);
    expect(container.querySelector('.leaf-tag__dot')).toBeNull();
    rerender(<Tag icon={<svg data-testid="custom-icon" />}>Live</Tag>);
    expect(container.querySelector('.leaf-tag__icon svg')).not.toBeNull();
  });

  it('supports solid tags and regional variant defaults', () => {
    const { container, rerender } = render(
      <ConfigProvider components={{ Tag: { variant: 'solid' } }}>
        <Tag>Live</Tag>
      </ConfigProvider>,
    );
    expect(container.querySelector('.leaf-tag')).toHaveClass('leaf-tag--solid');
    rerender(
      <ConfigProvider components={{ Tag: { variant: 'soft' } }}>
        <Tag>Live</Tag>
      </ConfigProvider>,
    );
    expect(container.querySelector('.leaf-tag')).toHaveClass('leaf-tag--soft');
  });

  it('maps presets to status data and leaves custom colors for local derivation', () => {
    const { container, rerender } = render(<Tag>Default</Tag>);
    const tag = container.querySelector<HTMLElement>('.leaf-tag');
    expect(tag).toHaveAttribute('data-color', 'default');

    rerender(<Tag color="success">Success</Tag>);
    expect(tag).toHaveAttribute('data-color', 'success');

    rerender(<Tag color="#7654c6">Custom</Tag>);
    expect(tag).not.toHaveAttribute('data-color');
    expect(tag?.style.getPropertyValue('--leaf-tag-color')).toBe('#7654c6');
  });

  it('uses the neutral default instead of the primary theme color', () => {
    const { container } = render(<Tag>Default</Tag>);
    const tag = container.querySelector<HTMLElement>('.leaf-tag');
    expect(tag).toHaveAttribute('data-color', 'default');
    expect(tag?.style.getPropertyValue('--leaf-tag-color')).toBe('');
  });

  it('keeps custom soft label ink at the base color while deriving soft surfaces', async () => {
    const { container } = render(<Tag color="#ffeb3b">Custom</Tag>);
    const tag = container.querySelector<HTMLElement>('.leaf-tag');
    if (!tag) throw new Error('Missing tag');
    await waitFor(() => expect(tag.style.getPropertyValue('--leaf-tag-ink')).not.toBe(''));
    expect(tag.style.getPropertyValue('--leaf-tag-ink')).not.toContain('primary');
    const scale = generateColorShades('#ffeb3b');
    expect(tag.style.getPropertyValue('--leaf-tag-color-surface-8')).toBe(scale['light-9']);
    expect(tag.style.getPropertyValue('--leaf-tag-color-alpha-10')).toBe(scale['light-7']);
    expect(tag.style.getPropertyValue('--leaf-tag-ink')).toBe('#ffeb3b');
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

  it('derives custom soft surfaces from the configured neutral and effective surface without DOM reads', () => {
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
    expect(tag?.style.getPropertyValue('--leaf-tag-ink')).toBe('#ff6900');
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

  it('forwards refs for Tag, CheckableTag, and TagGroup so Tooltip triggers attach cleanly', async () => {
    const tagRef = createRef<HTMLSpanElement>();
    const checkableRef = createRef<HTMLButtonElement>();
    const groupRef = createRef<HTMLDivElement>();
    const { container } = render(
      <>
        <Tooltip content="标签提示" enterDelay={0}>
          <Tag ref={tagRef}>Beta</Tag>
        </Tooltip>
        <CheckableTag ref={checkableRef}>Switch</CheckableTag>
        <TagGroup ref={groupRef} options={[{ value: 'a', label: 'A' }]} />
      </>,
    );
    expect(tagRef.current).toBe(container.querySelector('.leaf-tag'));
    expect(checkableRef.current).toBe(container.querySelector('.leaf-checkable-tag'));
    expect(groupRef.current).toBe(container.querySelector('.leaf-tag-group'));
    fireEvent.pointerEnter(tagRef.current as HTMLElement, { pointerType: 'mouse' });
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent('标签提示');
    });
  });
});
