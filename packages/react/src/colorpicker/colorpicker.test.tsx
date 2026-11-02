import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Button, ColorPicker, ConfigProvider, Form, FormField } from '../index';

describe('ColorPicker', () => {
  it.each(['solid', 'gradient'] as const)(
    'uses a custom %s button with its ref, events, name and keyboard interaction intact',
    async (mode) => {
      const ref = createRef<HTMLButtonElement>();
      const childClick = vi.fn();
      const pickerClick = vi.fn();
      const onOpenChange = vi.fn();
      const { container } = render(
        <ColorPicker mode={mode} onClick={pickerClick} onOpenChange={onOpenChange}>
          <Button ref={ref} variant="solid" className="custom-trigger" onClick={childClick}>
            Pick a color
          </Button>
        </ColorPicker>,
      );
      const trigger = screen.getByRole('button', { name: 'Pick a color' });
      expect(ref.current).toBe(trigger);
      expect(trigger).toHaveClass('leaf-button--solid', 'custom-trigger');
      expect(trigger).not.toHaveClass('leaf-color-picker__trigger');
      expect(container.querySelector('.leaf-color-picker')).toBeNull();
      expect(container.querySelector('button button')).toBeNull();
      await userEvent.click(trigger);
      expect(childClick).toHaveBeenCalledTimes(1);
      expect(pickerClick).toHaveBeenCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(true);
      expect(trigger).toHaveAttribute('aria-controls', screen.getByRole('dialog').id);
      await userEvent.keyboard('{Escape}');
      expect(trigger).toHaveFocus();
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      await userEvent.keyboard('{Enter}');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      await userEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      await userEvent.keyboard(' ');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    },
  );

  it.each(['solid', 'gradient'] as const)(
    'honors cancellation, disabled triggers, read-only and controlled open state for custom %s buttons',
    async (mode) => {
      const onOpenChange = vi.fn();
      const cancel = vi.fn((event: React.MouseEvent<HTMLButtonElement>) => event.preventDefault());
      const { rerender } = render(
        <ColorPicker mode={mode} onOpenChange={onOpenChange}>
          <button type="button" onClick={cancel}>
            Pick a color
          </button>
        </ColorPicker>,
      );
      await userEvent.click(screen.getByRole('button', { name: 'Pick a color' }));
      expect(cancel).toHaveBeenCalledTimes(1);
      expect(onOpenChange).not.toHaveBeenCalled();
      for (const state of [{ disabled: true }, { readOnly: true }]) {
        rerender(
          <ColorPicker mode={mode} {...state} open onOpenChange={onOpenChange}>
            <Button>Pick a color</Button>
          </ColorPicker>,
        );
        const trigger = screen.getByRole('button', { name: 'Pick a color' });
        onOpenChange.mockClear();
        await userEvent.click(trigger);
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
        expect(onOpenChange).not.toHaveBeenCalled();
      }
      rerender(
        <ColorPicker mode={mode} open onOpenChange={onOpenChange}>
          <Button disabled>Pick a color</Button>
        </ColorPicker>,
      );
      expect(screen.getByRole('button', { name: 'Pick a color' })).toBeDisabled();
      expect(screen.queryByRole('dialog')).toBeNull();
      rerender(
        <ColorPicker mode={mode} open={false} onOpenChange={onOpenChange}>
          <Button>Pick a color</Button>
        </ColorPicker>,
      );
      await userEvent.click(screen.getByRole('button', { name: 'Pick a color' }));
      expect(onOpenChange).toHaveBeenLastCalledWith(true);
      expect(screen.queryByRole('dialog')).toBeNull();
    },
  );

  it.each(['solid', 'gradient'] as const)(
    'keeps custom %s triggers associated with field descriptions, clearing and native form reset',
    async (mode) => {
      const initial =
        mode === 'solid' ? '#1677ff' : 'linear-gradient(90deg, #1677ff 0%, #ff0000 100%)';
      const { container } = render(
        <ConfigProvider locale="en-US">
          <Form>
            <FormField label="Accent" description="Field hint" required>
              <ColorPicker mode={mode} name="accent" defaultValue={initial} allowClear>
                <Button aria-describedby="custom-hint">Pick a color</Button>
              </ColorPicker>
            </FormField>
          </Form>
        </ConfigProvider>,
      );
      const form = container.querySelector('form') as HTMLFormElement;
      const trigger = screen.getByRole('button', { name: 'Accent' });
      expect(trigger.getAttribute('aria-describedby')).toContain('custom-hint');
      expect(trigger).toHaveAccessibleDescription('Field hint');
      expect(new FormData(form).get('accent')).toBe(initial);
      await userEvent.click(screen.getByRole('button', { name: 'Clear color' }));
      expect(new FormData(form).get('accent')).toBe('');
      expect(trigger).toHaveFocus();
      const proxy = form.querySelector('input[name="accent"]') as HTMLInputElement;
      fireEvent.invalid(proxy);
      expect(trigger).toHaveFocus();
      fireEvent.reset(form);
      await waitFor(() => expect(new FormData(form).get('accent')).toBe(initial));
    },
  );

  it('isolates the value Input from its owning field and regional Input defaults', async () => {
    const change = vi.fn();
    const { container } = render(
      <ConfigProvider
        locale="en-US"
        components={{ Input: { prefix: 'Regional prefix', allowClear: true, size: 'lg' } }}
      >
        <Form>
          <FormField label="Accent" required>
            <ColorPicker name="accent" defaultValue="#1677ff" defaultOpen onChange={change} />
          </FormField>
        </Form>
      </ConfigProvider>,
    );
    const input = screen.getByRole('textbox', { name: 'Color value' });
    expect(input).not.toBeRequired();
    expect(input.id).not.toBe(screen.getByRole('button', { name: 'Accent' }).id);
    expect(screen.queryByText('Regional prefix')).toBeNull();
    fireEvent.change(input, { target: { value: '#ff0000' } });
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    expect(change).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(change).toHaveBeenLastCalledWith('#ff0000');
    expect(
      new FormData(container.querySelector('form') as HTMLFormElement).getAll('accent'),
    ).toEqual(['#ff0000']);
  });
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
    await userEvent.click(screen.getByRole('tab', { name: /^RGB$/ }));
    expect(input).toHaveValue('rgba(255, 0, 0, 0.5)');
    fireEvent.change(input, { target: { value: 'not-a-color' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(change).toHaveBeenCalledTimes(1);
  });
  it('uses isolated format tabs with keyboard navigation and controlled format updates', async () => {
    const onFormatChange = vi.fn();
    const renderPicker = (format?: 'hex' | 'rgb' | 'hsl') => (
      <ConfigProvider
        locale="en-US"
        components={{ Tabs: { type: 'line', size: 'lg', onChange: vi.fn() } }}
      >
        <ColorPicker defaultOpen format={format} onFormatChange={onFormatChange} />
      </ConfigProvider>
    );
    const { rerender } = render(renderPicker());
    const hex = screen.getByRole('tab', { name: 'HEX' });
    expect(hex.closest('.leaf-tabs')).toHaveClass('leaf-tabs--segmented', 'leaf-tabs--sm');
    hex.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'RGB' })).toHaveFocus();
    expect(screen.getByRole('tab', { name: 'RGB' })).toHaveAttribute('aria-selected', 'true');
    expect(onFormatChange).toHaveBeenLastCalledWith('rgb');
    rerender(renderPicker('hex'));
    await userEvent.click(screen.getByRole('tab', { name: 'HSL' }));
    expect(onFormatChange).toHaveBeenLastCalledWith('hsl');
    expect(hex).toHaveAttribute('aria-selected', 'true');
    rerender(renderPicker('hsl'));
    expect(screen.getByRole('tab', { name: 'HSL' })).toHaveAttribute('aria-selected', 'true');
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
