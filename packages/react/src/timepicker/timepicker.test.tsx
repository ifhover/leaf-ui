import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TimePicker } from './timepicker';

describe('TimePicker', () => {
  it('keeps the selected time row focused while skipping unavailable values', async () => {
    const change = vi.fn();
    render(
      <TimePicker
        defaultValue="08:07"
        minuteStep={15}
        disabledTime={(parts) => parts.minute === 15}
        onChange={change}
      />,
    );
    await userEvent.click(screen.getByRole('combobox'));
    const minutes = within(screen.getByRole('listbox', { name: '分钟' }));
    const selected = minutes.getByRole('option', { name: '07' });
    selected.focus();
    fireEvent.keyDown(selected, { key: 'ArrowDown' });
    expect(minutes.getByRole('option', { name: '15' })).toBeDisabled();
    expect(minutes.getByRole('option', { name: '30' })).toHaveFocus();
    expect(minutes.getByRole('option', { name: '30' })).toHaveAttribute('aria-selected', 'true');
    expect(change).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: '确定' }));
    expect(change).toHaveBeenLastCalledWith('08:30');
  });
  it('accepts 12-hour typed values and keeps unconfirmed text out of FormData', async () => {
    const change = vi.fn();
    render(
      <form aria-label="Times">
        <TimePicker name="time" use12Hours defaultValue="09:00" onChange={change} />
        <button type="button">Next</button>
      </form>,
    );
    const input = screen.getByRole('combobox');
    const form = screen.getByRole('form') as HTMLFormElement;
    await userEvent.clear(input);
    await userEvent.type(input, '11:25 PM');
    expect(new FormData(form).get('time')).toBe('09:00');
    await userEvent.keyboard('{Enter}');
    expect(change).toHaveBeenLastCalledWith('23:25');
    await userEvent.clear(input);
    await userEvent.type(input, '12:45 上午');
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(new FormData(form).get('time')).toBe('23:25');
    expect(input).toHaveValue('11:25 下午');
    await userEvent.clear(input);
    await userEvent.type(input, '25:99{Enter}');
    expect(change).toHaveBeenCalledOnce();
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
  it.each([
    ['00:05:30', '上午', '下午', '12:05:30'],
    ['12:05:30', '下午', '上午', '00:05:30'],
  ])(
    'converts midnight and noon correctly in 12-hour mode (%s)',
    async (initial, before, after, result) => {
      const change = vi.fn();
      render(<TimePicker use12Hours showSeconds defaultValue={initial} onChange={change} />);
      expect(screen.getByRole('combobox')).toHaveValue(`12:05:30 ${before}`);
      await userEvent.click(screen.getByRole('combobox'));
      await userEvent.click(
        within(screen.getByRole('listbox', { name: '时段' })).getByRole('option', { name: after }),
      );
      await userEvent.click(screen.getByRole('button', { name: '确定' }));
      expect(change).toHaveBeenCalledWith(result);
    },
  );
  it('selects hours and stepped minutes without a native time input', async () => {
    const onChange = vi.fn();
    const { container } = render(
      <TimePicker aria-label="时间" minuteStep={15} onChange={onChange} />,
    );
    await userEvent.click(screen.getByRole('combobox'));
    expect(container.querySelector('input[type="time"]')).toBeNull();
    await userEvent.click(
      within(screen.getByRole('listbox', { name: '小时' })).getByRole('option', { name: '14' }),
    );
    await userEvent.click(
      within(screen.getByRole('listbox', { name: '分钟' })).getByRole('option', { name: '30' }),
    );
    expect(onChange).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: '确定' }));
    expect(onChange).toHaveBeenCalledWith('14:30');
    expect(screen.getByRole('combobox')).toHaveValue('14:30');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('supports keyboard selection and preserves a default minute outside the configured step', async () => {
    render(<TimePicker aria-label="时间" defaultValue="08:07" minuteStep={15} />);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.keyboard('{ArrowDown}');
    const hours = within(screen.getByRole('listbox', { name: '小时' }));
    expect(hours.getByRole('option', { name: '08' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(hours.getByRole('option', { name: '09' })).toHaveAttribute('aria-selected', 'true');
    expect(
      within(screen.getByRole('listbox', { name: '分钟' })).getByRole('option', { name: '07' }),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '确定' }));
    expect(screen.getByRole('combobox')).toHaveValue('09:07');
    await userEvent.click(screen.getByRole('button', { name: '清除时间' }));
    expect(screen.getByRole('combobox')).toHaveValue('');
  });
  it('normalizes invalid steps and blocks disabled interaction', async () => {
    const { rerender } = render(<TimePicker aria-label="时间" minuteStep={0} />);
    await userEvent.click(screen.getByRole('combobox'));
    expect(
      within(screen.getByRole('listbox', { name: '分钟' })).getAllByRole('option'),
    ).toHaveLength(60);
    rerender(<TimePicker aria-label="时间" disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
