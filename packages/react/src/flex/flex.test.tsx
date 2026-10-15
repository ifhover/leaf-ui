import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Flex } from './flex';

describe('Flex', () => {
  it('preserves direct children, native events, refs and form participation', () => {
    const ref = createRef<HTMLDivElement>();
    const click = vi.fn();
    render(
      <form aria-label="Settings">
        <Flex ref={ref} onClick={click} aria-label="Actions" data-layout="actions">
          <input name="title" defaultValue="Leaf" aria-label="Project" />
          <button type="button">Save</button>
        </Flex>
      </form>,
    );
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button.parentElement).toBe(ref.current);
    expect(ref.current?.children).toHaveLength(2);
    expect(ref.current).toHaveAttribute('data-layout', 'actions');
    fireEvent.click(button);
    expect(click).toHaveBeenCalledOnce();
    expect(new FormData(screen.getByRole('form') as HTMLFormElement).get('title')).toBe('Leaf');
  });

  it('keeps theme spacing as inherited variables and lets caller styles take precedence', () => {
    const { rerender } = render(
      <Flex aria-label="Layout" gap={['sm', 12]} direction="column" wrap />,
    );
    const layout = screen.getByLabelText('Layout');
    expect(layout.style.gap).toBe('var(--leaf-spacing-sm, 8px) 12px');
    rerender(
      <Flex
        aria-label="Layout"
        inline
        gap="lg"
        direction="column"
        style={{ flexDirection: 'row-reverse', gap: '2rem' }}
      />,
    );
    expect(layout.style.display).toBe('inline-flex');
    expect(layout.style.flexDirection).toBe('row-reverse');
    expect(layout.style.gap).toBe('2rem');
    expect(layout.children).toHaveLength(0);
  });
});
