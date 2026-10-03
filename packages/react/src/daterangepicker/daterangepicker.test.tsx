import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from '../config-provider';
import { DateRangePicker } from './daterangepicker';

describe('DateRangePicker', () => {
  it.each(['year', 'month', 'week', 'weekday', 'date'] as const)(
    'selects and orders %s ranges',
    async (picker) => {
      const change = vi.fn();
      render(
        <ConfigProvider locale="en-US">
          <DateRangePicker
            aria-label="Range"
            picker={picker}
            minDate={new Date(2026, 0, 1)}
            maxDate={new Date(2028, 11, 31)}
            onChange={change}
          />
        </ConfigProvider>,
      );
      await userEvent.click(screen.getByRole('combobox'));
      const names =
        picker === 'year'
          ? ['2028', '2026']
          : picker === 'month'
            ? ['2026-06', '2026-02']
            : ['2026-01-20', '2026-01-08'];
      if (picker === 'year')
        await userEvent.click(screen.getByRole('button', { name: 'Next years' }));
      await userEvent.click(screen.getByRole('button', { name: names[0] }));
      if (picker === 'year')
        await userEvent.click(screen.getByRole('button', { name: 'Previous years' }));
      await userEvent.click(screen.getByRole('button', { name: names[1] }));
      expect(change).toHaveBeenCalledOnce();
      const range = change.mock.calls[0]?.[0] as [Date, Date];
      expect(range[0].getTime()).toBeLessThanOrEqual(range[1].getTime());
      expect(range[0].getHours()).toBe(0);
      if (picker === 'year') expect(range[0].getMonth()).toBe(0);
      if (picker === 'month') expect(range[0].getDate()).toBe(1);
      if (picker === 'week') {
        expect(range[0].getDay()).toBe(1);
        expect(change.mock.calls[0]?.[1][0]).toBe('2026-W02');
      }
    },
  );
  it('keeps datetime adjustments in a draft until confirmation', async () => {
    const change = vi.fn();
    render(
      <ConfigProvider locale="en-US">
        <DateRangePicker
          picker="datetime"
          aria-label="Range"
          minDate={new Date(2026, 0, 1)}
          onChange={change}
        />
      </ConfigProvider>,
    );
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('button', { name: '2026-01-01' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    await userEvent.click(screen.getByRole('button', { name: '2026-01-08' }));
    await userEvent.click(screen.getByRole('button', { name: '2026-01-20' }));
    expect(screen.getByRole('button', { name: '2026-01-08' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: '2026-01-20' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(change).not.toHaveBeenCalled();
    await userEvent.click(
      within(screen.getByRole('listbox', { name: 'Seconds' })).getByRole('option', { name: '30' }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'OK' }));
    const range = change.mock.calls[0]?.[0] as [Date, Date];
    expect(range[1].getSeconds()).toBe(30);
    expect(screen.queryByRole('dialog')).toBeNull();
  });
  it('does not commit an incomplete or out-of-bounds range', async () => {
    const change = vi.fn();
    render(
      <DateRangePicker
        aria-label="Range"
        minDate={new Date(2026, 0, 5)}
        maxDate={new Date(2026, 0, 10)}
        onChange={change}
      />,
    );
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('button', { name: '2026-01-04' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: '2026-01-06' }));
    expect(screen.getByRole('button', { name: '确定' })).toBeDisabled();
    await userEvent.keyboard('{Escape}');
    expect(change).not.toHaveBeenCalled();
  });
  it('moves keyboard focus between individual days in week mode', async () => {
    render(
      <DateRangePicker
        picker="week"
        defaultValue={[new Date(2026, 0, 8), new Date(2026, 0, 20)]}
      />,
    );
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('button', { name: '2026-01-08' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: '2026-01-09' })).toHaveFocus();
  });
  it('keeps the end time attached to the second selection before ordering a reversed range', async () => {
    const change = vi.fn();
    render(
      <ConfigProvider locale="en-US">
        <DateRangePicker picker="datetime" minDate={new Date(2026, 0, 1)} onChange={change} />
      </ConfigProvider>,
    );
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('button', { name: '2026-01-20' }));
    await userEvent.click(screen.getByRole('button', { name: '2026-01-08' }));
    await userEvent.click(
      within(screen.getByRole('listbox', { name: 'Hours' })).getByRole('option', {
        name: /^10$/,
      }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'OK' }));
    const range = change.mock.calls[0]?.[0] as [Date, Date];
    expect(range[0].getDate()).toBe(8);
    expect(range[0].getHours()).toBe(10);
    expect(range[1].getDate()).toBe(20);
  });
});
