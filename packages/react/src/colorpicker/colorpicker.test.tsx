import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ColorPicker, ConfigProvider } from '../index';

describe('ColorPicker', () => {
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
