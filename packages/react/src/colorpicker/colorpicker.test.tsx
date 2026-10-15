import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ColorPicker, ConfigProvider } from '../index';

describe('ColorPicker', () => {
  it.each(['solid', 'gradient'] as const)(
    'opens %s from the outer row and keeps native clicks and keyboard activation single',
    async (mode) => {
      const click = vi.fn();
      const bubble = vi.fn();
      const open = vi.fn();
      const { container } = render(
        <ConfigProvider locale="en-US">
          {/* biome-ignore lint/a11y/noStaticElementInteractions: This test observes bubbled child clicks rather than providing an interactive control. */}
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: The ColorPicker button provides the keyboard interaction being tested. */}
          <div onClick={bubble}>
            <ColorPicker mode={mode} showText onClick={click} onOpenChange={open} />
          </div>
        </ConfigProvider>,
      );
      const row = container.querySelector('.leaf-color-picker') as HTMLElement;
      const trigger = screen.getByRole('button', { name: 'Choose a color' });
      await userEvent.click(row);
      expect(trigger).toHaveFocus();
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(click).toHaveBeenCalledTimes(1);
      expect(bubble).toHaveBeenCalledTimes(1);
      expect(open).toHaveBeenLastCalledWith(true);

      await userEvent.click(row.querySelector('.leaf-color-picker__text') as HTMLElement);
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(click).toHaveBeenCalledTimes(2);
      expect(bubble).toHaveBeenCalledTimes(2);
      expect(open).toHaveBeenCalledTimes(2);
      expect(open).toHaveBeenLastCalledWith(false);

      await userEvent.keyboard('{Enter}');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      await userEvent.keyboard('{Escape}');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).toHaveFocus();
      await userEvent.keyboard(' ');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    },
  );

  it.each(['solid', 'gradient'] as const)(
    'keeps %s clearing independent and honors cancellation, read-only and disabled rows',
    async (mode) => {
      const change = vi.fn();
      const open = vi.fn();
      const blocked = vi.fn((event: React.MouseEvent<HTMLButtonElement>) => event.preventDefault());
      const { container, rerender } = render(
        <ConfigProvider locale="en-US">
          <ColorPicker mode={mode} allowClear onChange={change} onOpenChange={open} />
        </ConfigProvider>,
      );
      await userEvent.click(screen.getByRole('button', { name: 'Clear color' }));
      expect(change).toHaveBeenCalledExactlyOnceWith('');
      expect(open).not.toHaveBeenCalled();
      expect(screen.getByRole('button', { name: 'Choose a color' })).toHaveFocus();

      rerender(<ColorPicker mode={mode} onClick={blocked} onOpenChange={open} />);
      await userEvent.click(container.querySelector('.leaf-color-picker') as HTMLElement);
      expect(blocked).toHaveBeenCalledTimes(1);
      expect(open).not.toHaveBeenCalled();

      for (const state of [{ readOnly: true }, { disabled: true }]) {
        rerender(<ColorPicker mode={mode} {...state} onOpenChange={open} />);
        await userEvent.click(container.querySelector('.leaf-color-picker') as HTMLElement);
        expect(screen.getByRole('button', { name: '选择颜色' })).toHaveAttribute(
          'aria-expanded',
          'false',
        );
        expect(open).not.toHaveBeenCalled();
      }
    },
  );

  it('accepts CSS colors with alpha, switches formats and rejects invalid text', async () => {
    const change = vi.fn();
    render(
      <ConfigProvider locale="en-US">
        <ColorPicker onChange={change} showText />
      </ConfigProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Choose a color' }));
    const input = screen.getByRole('textbox', { name: 'Color value' });
    fireEvent.change(input, { target: { value: 'rgba(255, 0, 0, 0.5)' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(change).toHaveBeenLastCalledWith('#ff000080');
    await userEvent.click(screen.getByRole('button', { name: /^RGB$/ }));
    expect(input).toHaveValue('rgba(255, 0, 0, 0.5)');
    fireEvent.change(input, { target: { value: 'not-a-color' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(change).toHaveBeenCalledTimes(1);
  });
  it('preserves hue while the color is black and supports keyboard adjustments', async () => {
    const change = vi.fn();
    render(
      <ConfigProvider locale="en-US">
        <ColorPicker defaultValue="#000000" onChange={change} disableAlpha />
      </ConfigProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Choose a color' }));
    const hue = screen.getByRole('slider', { name: 'Hue' });
    fireEvent.change(hue, { target: { value: '120' } });
    expect(hue).toHaveValue('120');
    const plane = screen.getByRole('slider', { name: 'Saturation / Brightness' });
    fireEvent.keyDown(plane, { key: 'End' });
    fireEvent.keyDown(plane, { key: 'ArrowUp', shiftKey: true });
    expect(change).toHaveBeenLastCalledWith('#001a00');
    expect(screen.queryByRole('slider', { name: 'Opacity' })).toBeNull();
  });
  it('uses the native form value and reset while keeping controlled values stable', async () => {
    const { container, rerender } = render(
      <ConfigProvider locale="en-US">
        <form>
          <ColorPicker name="color" defaultValue="#1677ff" allowClear />
        </form>
      </ConfigProvider>,
    );
    const form = container.querySelector('form') as HTMLFormElement;
    await userEvent.click(screen.getByRole('button', { name: 'Clear color' }));
    expect(new FormData(form).get('color')).toBe('');
    fireEvent.reset(form);
    await waitFor(() => expect(new FormData(form).get('color')).toBe('#1677ff'));
    rerender(<ColorPicker value="#1677ff" disabled showText />);
    expect(screen.getByRole('button', { name: '选择颜色' })).toBeDisabled();
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
