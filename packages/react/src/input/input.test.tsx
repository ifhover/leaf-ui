import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from '../config-provider';
import { Input } from './input';

describe('Input', () => {
  it('clears through onChange, updates count and restores uncontrolled form defaults', async () => {
    const clear = vi.fn();
    const change = vi.fn();
    render(
      <form aria-label="Input form">
        <Input
          aria-label="Name"
          name="title"
          defaultValue="Leaf"
          allowClear
          showCount
          maxLength={10}
          onClear={clear}
          onChange={change}
        />
      </form>,
    );
    const input = screen.getByRole('textbox');
    expect(screen.getByText('4 / 10')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '清除输入' }));
    expect(input).toHaveValue('');
    expect(input).toHaveFocus();
    expect(change).toHaveBeenCalledOnce();
    expect(clear).toHaveBeenCalledOnce();
    expect(screen.getByText('0 / 10')).toBeInTheDocument();
    const form = screen.getByRole('form') as HTMLFormElement;
    await act(async () => form.reset());
    expect(input).toHaveValue('Leaf');
    expect(new FormData(form).get('title')).toBe('Leaf');
  });
  it('reveals passwords without changing the value and supports controlled visibility', async () => {
    const visible = vi.fn();
    const { rerender } = render(
      <ConfigProvider locale="en-US">
        <Input
          type="password"
          aria-label="Password"
          defaultValue="secret"
          onVisibleChange={visible}
        />
      </ConfigProvider>,
    );
    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');
    await userEvent.click(screen.getByRole('button', { name: 'Show password' }));
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveValue('secret');
    expect(visible).toHaveBeenLastCalledWith(true);
    rerender(
      <ConfigProvider locale="en-US">
        <Input
          type="password"
          aria-label="Password"
          visible={false}
          onVisibleChange={visible}
          visibilityIcon={() => <span>eye</span>}
        />
      </ConfigProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Show password' }));
    expect(input).toHaveAttribute('type', 'password');
    rerender(<Input type="password" aria-label="Password" visibilityToggle={false} />);
    expect(screen.queryByRole('button')).toBeNull();
  });
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
