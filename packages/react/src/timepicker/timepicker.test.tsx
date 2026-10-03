import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TimePicker } from './timepicker';

describe('TimePicker', () => {
  it.each([
    ['00:05:30', '上午', '下午', '12:05:30'],
    ['12:05:30', '下午', '上午', '00:05:30'],
  ])(
    'converts midnight and noon correctly in 12-hour mode (%s)',
    async (initial, before, after, result) => {
      const change = vi.fn();
      render(<TimePicker use12Hours showSeconds defaultValue={initial} onChange={change} />);
      expect(screen.getByRole('combobox')).toHaveTextContent(`12:05:30 ${before}`);
      await userEvent.click(screen.getByRole('combobox'));
      await userEvent.click(
        within(screen.getByRole('listbox', { name: '时段' })).getByRole('option', { name: after }),
      );
      await userEvent.click(screen.getByRole('button', { name: `使用 12:05:30 ${after}` }));
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
    expect(onChange).toHaveBeenCalledWith('14:30');
    expect(screen.getByRole('combobox')).toHaveTextContent('14:30');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('supports keyboard selection and preserves a default minute outside the configured step', async () => {
    render(<TimePicker aria-label="时间" defaultValue="08:07" minuteStep={15} />);
    await userEvent.click(screen.getByRole('combobox'));
    const hours = within(screen.getByRole('listbox', { name: '小时' }));
    expect(hours.getByRole('option', { name: '08' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(hours.getByRole('option', { name: '09' })).toHaveAttribute('aria-selected', 'true');
    expect(
      within(screen.getByRole('listbox', { name: '分钟' })).getByRole('option', { name: '07' }),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '使用 09:07' }));
    expect(screen.getByRole('combobox')).toHaveTextContent('09:07');
    await userEvent.click(screen.getByRole('button', { name: '清除时间' }));
    expect(screen.getByRole('combobox')).toHaveTextContent('请选择时间');
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
