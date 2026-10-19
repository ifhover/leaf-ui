import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Textarea } from './textarea';

describe('Textarea', () => {
  it('decorates the native editing viewport and refreshes tracks for controlled value changes', () => {
    const clientHeight = vi
      .spyOn(HTMLElement.prototype, 'clientHeight', 'get')
      .mockReturnValue(120);
    const scrollHeight = vi
      .spyOn(HTMLElement.prototype, 'scrollHeight', 'get')
      .mockImplementation(function (this: HTMLElement) {
        return this instanceof HTMLTextAreaElement
          ? Math.max(120, this.value.split('\n').length * 30)
          : 120;
      });
    const scroll = vi.fn((event) => event.currentTarget);
    const ref = createRef<HTMLTextAreaElement>();
    const example = (value: string) => (
      <form aria-label="Editor form">
        <label htmlFor="native-editor">Editor</label>
        <Textarea
          ref={ref}
          id="native-editor"
          name="description"
          value={value}
          onChange={() => {}}
          onScroll={scroll}
          style={{ width: '50%', maxWidth: '80%', minWidth: '20%' }}
          className="user-editor"
          resize="both"
        />
      </form>
    );
    try {
      const { rerender } = render(example('Short'));
      const native = screen.getByRole('textbox', { name: 'Editor' }) as HTMLTextAreaElement;
      expect(ref.current).toBe(native);
      expect(native).toHaveClass('leaf-textarea', 'user-editor');
      expect(native.parentElement).toHaveStyle({ width: '50%', maxWidth: '80%', minWidth: '20%' });
      expect(native).toHaveStyle({ width: '100%', resize: 'both' });
      expect(native.style.maxWidth).toBe('');
      expect(native.style.minWidth).toBe('');
      expect(screen.queryByRole('scrollbar')).not.toBeInTheDocument();
      const value = Array.from({ length: 30 }, (_, index) => `Line ${index}`).join('\n');
      rerender(example(value));
      const track = screen.getByRole('scrollbar');
      expect(track).toHaveAttribute('aria-controls', native.id);
      expect(track).toHaveAttribute('tabindex', '-1');
      native.focus();
      native.setSelectionRange(2, 7);
      fireEvent.pointerDown(track, { button: 0, pointerId: 1, clientY: 40 });
      fireEvent.pointerUp(track, { pointerId: 1 });
      expect(ref.current).toBe(native);
      expect(native).toHaveFocus();
      expect([native.selectionStart, native.selectionEnd]).toEqual([2, 7]);
      fireEvent.scroll(native);
      expect(scroll.mock.results[0]?.value).toBe(native);
      expect(new FormData(screen.getByRole('form') as HTMLFormElement).get('description')).toBe(
        value,
      );
    } finally {
      clientHeight.mockRestore();
      scrollHeight.mockRestore();
    }
  });
  it('supports multiline editing, native maxLength and the DOM ref', async () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} aria-label="简介" maxLength={9} name="description" rows={4} />);
    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, 'Leaf{Enter}Garden');
    expect(textarea).toHaveValue('Leaf\nGard');
    expect(textarea).toHaveAttribute('rows', '4');
    expect(ref.current).toBe(textarea);
  });
  it('passes accessibility attributes and prevents disabled editing', async () => {
    render(
      <Textarea
        aria-label="简介"
        status="error"
        aria-describedby="error"
        disabled
        defaultValue="Locked"
      />,
    );
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
    expect(textarea).toHaveAttribute('aria-describedby', 'error');
    await userEvent.type(textarea, 'edit');
    expect(textarea).toHaveValue('Locked');
  });
});
