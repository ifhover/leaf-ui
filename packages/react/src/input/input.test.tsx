import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Input } from './input';

describe('Input', () => {
  it('supports controlled native input and a forwarded focus ref', async () => {
    const ref = createRef<HTMLInputElement>();
    function Example() {
      const [value, setValue] = useState('');
      return (
        <Input
          ref={ref}
          aria-label="名称"
          name="title"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          prefix={<span>+</span>}
        />
      );
    }
    render(<Example />);
    const input = screen.getByRole('textbox', { name: '名称' });
    await userEvent.type(input, 'Leaf');
    expect(input).toHaveValue('Leaf');
    expect(input).toHaveAttribute('name', 'title');
    expect(ref.current).toBe(input);
    ref.current?.focus();
    expect(input).toHaveFocus();
  });
  it('ignores composition and prevented Enter events', () => {
    const onPressEnter = vi.fn();
    const { rerender } = render(<Input aria-label="搜索" onPressEnter={onPressEnter} />);
    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    expect(onPressEnter).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onPressEnter).toHaveBeenCalledOnce();
    rerender(
      <Input
        aria-label="搜索"
        onPressEnter={onPressEnter}
        onKeyDown={(event) => event.preventDefault()}
      />,
    );
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onPressEnter).toHaveBeenCalledOnce();
  });
  it('preserves error descriptions, read-only and disabled behavior', async () => {
    const { rerender } = render(
      <Input
        aria-label="名称"
        status="error"
        aria-describedby="hint"
        defaultValue="Leaf"
        readOnly
      />,
    );
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'hint');
    await userEvent.type(input, 'edit');
    expect(input).toHaveValue('Leaf');
    rerender(<Input aria-label="名称" disabled />);
    expect(input).toBeDisabled();
  });
});
