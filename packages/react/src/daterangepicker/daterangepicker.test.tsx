import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from '../config-provider';
import { DateRangePicker } from './daterangepicker';

describe('DateRangePicker', () => {
  it('updates endpoint times on an existing complete range without another date click', async () => {
    const change = vi.fn();
    render(
      <ConfigProvider locale="en-US">
        <DateRangePicker
          picker="datetime"
          defaultValue={[new Date(2026, 0, 8, 9), new Date(2026, 0, 20, 10)]}
          onChange={change}
        />
      </ConfigProvider>,
    );
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('button', { name: 'End Choose time' }));
    await userEvent.click(
      within(screen.getByRole('listbox', { name: 'Hours' })).getByRole('option', { name: '11' }),
    );
    expect(change).toHaveBeenCalledOnce();
    expect(change.mock.calls[0]?.[1]).toEqual(['2026-01-08 09:00:00', '2026-01-20 11:00:00']);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
  it.each(['year', 'month', 'week', 'date'] as const)(
    'selects and orders %s ranges across two calendars',
    async (picker) => {
      const change = vi.fn();
      const { container } = render(
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
      expect(document.querySelectorAll('.leaf-calendar')).toHaveLength(2);
      if (picker === 'month' || picker === 'date' || picker === 'week')
        expect(document.querySelectorAll('.leaf-calendar__cells [tabindex="0"]')).toHaveLength(2);
      const names =
        picker === 'year'
          ? ['2028', '2026']
          : picker === 'month'
            ? ['2026-06', '2026-02']
            : ['2026-01-20', '2026-01-08'];
      await userEvent.click(screen.getByRole('button', { name: names[0] }));
      expect(change).not.toHaveBeenCalled();
      await userEvent.click(screen.getByRole('button', { name: names[1] }));
      expect(change).toHaveBeenCalledOnce();
      const range = change.mock.calls[0]?.[0] as [Date, Date];
      expect(range[0].getTime()).toBeLessThanOrEqual(range[1].getTime());
      if (picker === 'year') expect(range[0].getMonth()).toBe(0);
      if (picker === 'month') expect(range[0].getDate()).toBe(1);
      if (picker === 'week') {
        expect(range[0].getDay()).toBe(1);
        expect(change.mock.calls[0]?.[1][0]).toBe('2026-W02');
      }
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(container.querySelector('input[type="date"]')).toBeNull();
    },
  );
  it('previews a cross-month range and paints the hovered endpoint as selected', async () => {
    render(<DateRangePicker minDate={new Date(2026, 0, 1)} />);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('button', { name: '2026-01-28' }));
    const end = screen.getByRole('button', { name: '2026-02-04' });
    await userEvent.hover(end);
    expect(end).toHaveAttribute('data-range-hover', 'true');
    expect(end).toHaveClass('leaf-date-picker__day--selected');
    expect(screen.getByRole('button', { name: '2026-01-31' }).parentElement).toHaveClass(
      'leaf-calendar__cell--range',
    );
    expect(screen.getByRole('button', { name: '2026-02-02' }).parentElement).toHaveClass(
      'leaf-calendar__cell--range',
    );
    expect(screen.queryByRole('button', { name: '确定' })).toBeNull();
  });
  it('sets independent times before selecting the end date and commits without a footer confirmation', async () => {
    const change = vi.fn();
    render(
      <ConfigProvider locale="en-US">
        <DateRangePicker picker="datetime" minDate={new Date(2026, 0, 1)} onChange={change} />
      </ConfigProvider>,
    );
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('button', { name: 'Start Choose time' }));
    expect(
      within(screen.getByRole('listbox', { name: 'Hours' })).getByRole('option', { name: '00' }),
    ).toHaveFocus();
    await userEvent.click(
      within(screen.getByRole('listbox', { name: 'Hours' })).getByRole('option', { name: '09' }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Choose date' }));
    expect(screen.getByRole('button', { name: '2026-01-01' })).toHaveFocus();
    await userEvent.click(screen.getByRole('button', { name: '2026-01-20' }));
    await userEvent.click(screen.getByRole('button', { name: 'End Choose time' }));
    await userEvent.click(
      within(screen.getByRole('listbox', { name: 'Hours' })).getByRole('option', { name: '10' }),
    );
    await userEvent.click(
      within(screen.getByRole('listbox', { name: 'Seconds' })).getByRole('option', { name: '30' }),
    );
    expect(change).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Choose date' }));
    await userEvent.click(screen.getByRole('button', { name: '2026-01-08' }));
    const range = change.mock.calls[0]?.[0] as [Date, Date];
    expect(range[0].getDate()).toBe(8);
    expect(range[0].getHours()).toBe(10);
    expect(range[0].getSeconds()).toBe(30);
    expect(range[1].getDate()).toBe(20);
    expect(range[1].getHours()).toBe(9);
    expect(screen.queryByRole('button', { name: 'OK' })).toBeNull();
  });
  it('discards incomplete ranges and accepts strict text input with bounds', async () => {
    const change = vi.fn();
    render(
      <DateRangePicker
        minDate={new Date(2026, 0, 5)}
        maxDate={new Date(2026, 1, 10)}
        onChange={change}
      />,
    );
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    expect(screen.getByRole('button', { name: '2026-01-04' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: '2026-01-06' }));
    await userEvent.keyboard('{Escape}');
    expect(change).not.toHaveBeenCalled();
    await userEvent.type(input, '2026-01-06 ~ 2026-02-08{Enter}');
    expect(change).toHaveBeenCalledOnce();
    await userEvent.clear(input);
    await userEvent.type(input, '2026-01-06 ~ 2026-02-30{Enter}');
    expect(change).toHaveBeenCalledOnce();
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
  it('navigates individual days in week mode without losing input focus until ArrowDown', async () => {
    render(
      <DateRangePicker
        picker="week"
        defaultValue={[new Date(2026, 0, 8), new Date(2026, 0, 20)]}
      />,
    );
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('combobox')).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}{ArrowRight}');
    expect(screen.getByRole('button', { name: '2026-01-09' })).toHaveFocus();
  });
});
