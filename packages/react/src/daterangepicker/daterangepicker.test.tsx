import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from '../config-provider';
import { DateRangePicker } from './daterangepicker';

describe('DateRangePicker', () => {
  it('uses isolated default line endpoint tabs for datetime with keyboard navigation', async () => {
    const tabsChange = vi.fn();
    render(
      <ConfigProvider
        locale="en-US"
        components={{ Tabs: { type: 'segmented', size: 'lg', onChange: tabsChange } }}
      >
        <DateRangePicker picker="datetime" defaultOpen />
      </ConfigProvider>,
    );
    const start = screen.getByRole('tab', { name: 'Start' });
    const end = screen.getByRole('tab', { name: 'End' });
    expect(start.closest('.leaf-tabs')).toHaveClass('leaf-tabs--line', 'leaf-tabs--sm');
    expect(start.closest('.leaf-tabs')).not.toHaveClass('leaf-tabs--segmented');
    expect(start).toHaveAttribute('aria-selected', 'true');
    start.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(end).toHaveFocus();
    expect(end).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{Home}');
    expect(start).toHaveFocus();
    expect(start).toHaveAttribute('aria-selected', 'true');
    expect(tabsChange).not.toHaveBeenCalled();
  });
  it.each(['date', 'week', 'month', 'quarter', 'year', 'time'] as const)(
    'does not show endpoint tabs for %s ranges',
    (picker) => {
      render(
        picker === 'time' ? (
          <DateRangePicker picker="time" defaultOpen />
        ) : (
          <DateRangePicker picker={picker} defaultOpen />
        ),
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.queryByRole('tablist')).toBeNull();
    },
  );
  it.each(['date', 'datetime'] as const)(
    'previews a replacement end without changing the saved %s range',
    async (picker) => {
      const change = vi.fn();
      render(
        <ConfigProvider locale="en-US">
          <DateRangePicker
            picker={picker}
            defaultValue={[new Date(2026, 0, 8), new Date(2026, 0, 20)]}
            onChange={change}
          />
        </ConfigProvider>,
      );
      const input = screen.getByRole('combobox');
      await userEvent.click(input);
      if (picker === 'datetime') await userEvent.click(screen.getByRole('tab', { name: 'End' }));
      else await userEvent.keyboard('{End}');
      const savedEnd = screen.getByRole('button', { name: '2026-01-20' });
      const laterEnd = screen.getByRole('button', { name: '2026-01-25' });
      await userEvent.hover(laterEnd);
      expect(laterEnd).toHaveClass('leaf-date-picker__day--preview');
      expect(savedEnd).not.toHaveClass('leaf-date-picker__day--selected');
      expect(screen.getByRole('button', { name: '2026-01-24' }).parentElement).toHaveClass(
        'leaf-calendar__cell--range',
      );
      const earlierEnd = screen.getByRole('button', { name: '2026-01-12' });
      await userEvent.hover(earlierEnd);
      expect(earlierEnd).toHaveClass('leaf-date-picker__day--preview');
      expect(laterEnd).not.toHaveClass('leaf-date-picker__day--preview');
      expect(screen.getByRole('button', { name: '2026-01-18' }).parentElement).not.toHaveClass(
        'leaf-calendar__cell--range',
      );
      await userEvent.unhover(earlierEnd);
      expect(savedEnd).toHaveClass('leaf-date-picker__day--selected');
      expect(screen.getByRole('button', { name: '2026-01-18' }).parentElement).toHaveClass(
        'leaf-calendar__cell--range',
      );
      expect(change).not.toHaveBeenCalled();
      await userEvent.keyboard('{Escape}');
      expect(input).toHaveValue(
        picker === 'datetime' ? '2026-01-08 00:00 ~ 2026-01-20 00:00' : '2026-01-08 ~ 2026-01-20',
      );
    },
  );
  it.each([
    { picker: 'year', end: new Date(2028, 0, 1), hover: '2027', old: '2028' },
    { picker: 'quarter', end: new Date(2026, 9, 1), hover: '2026-Q2', old: '2026-Q4' },
    { picker: 'month', end: new Date(2026, 5, 1), hover: '2026-03', old: '2026-06' },
    { picker: 'week', end: new Date(2026, 0, 20), hover: '2026-01-26', old: '2026-01-20' },
  ] as const)('previews a replacement end in $picker mode', async ({ picker, end, hover, old }) => {
    render(
      <ConfigProvider locale="en-US">
        <DateRangePicker picker={picker} defaultValue={[new Date(2026, 0, 8), end]} />
      </ConfigProvider>,
    );
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.keyboard('{End}');
    const candidate = screen.getByRole('button', { name: hover });
    await userEvent.hover(candidate);
    expect(candidate).toHaveClass('leaf-date-picker__day--preview');
    expect(candidate.parentElement).toHaveClass('leaf-calendar__cell--end');
    expect(screen.getByRole('button', { name: old })).not.toHaveClass(
      'leaf-date-picker__day--selected',
    );
  });
  it('edits the ending time in the field in datetime mode and commits with OK', async () => {
    const change = vi.fn();
    render(
      <ConfigProvider locale="en-US">
        <DateRangePicker
          picker="datetime"
          needConfirm
          defaultValue={[new Date(2026, 0, 8, 9), new Date(2026, 0, 20, 10)]}
          onChange={change}
        />
      </ConfigProvider>,
    );
    await userEvent.click(screen.getByRole('combobox'));
    expect(document.querySelectorAll('.leaf-calendar')).toHaveLength(1);
    const end = screen.getByRole('tab', { name: 'End' });
    await userEvent.click(end);
    expect(end).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.keyboard('{End}{ArrowLeft}11');
    expect(change).not.toHaveBeenCalled();
    expect(screen.getByRole('combobox')).toHaveValue('2026-01-08 09:00 ~ 2026-01-20 11:00');
    await userEvent.click(screen.getByRole('button', { name: 'OK' }));
    expect(change.mock.calls[0]?.[1]).toEqual(['2026-01-08 09:00', '2026-01-20 11:00']);
    expect(screen.queryByRole('dialog')).toBeNull();
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
  it('previews a cross-month range with a soft hovered endpoint', async () => {
    render(<DateRangePicker minDate={new Date(2026, 0, 1)} />);
    await userEvent.click(screen.getByRole('combobox'));
    const start = screen.getByRole('button', { name: '2026-01-28' });
    await userEvent.click(start);
    expect(start).toHaveClass('leaf-date-picker__day--selected');
    const end = screen.getByRole('button', { name: '2026-02-04' });
    await userEvent.hover(end);
    expect(end).toHaveAttribute('data-range-hover', 'true');
    expect(end).toHaveClass('leaf-date-picker__day--preview');
    expect(end).not.toHaveClass('leaf-date-picker__day--selected');
    expect(screen.getByRole('button', { name: '2026-01-31' }).parentElement).toHaveClass(
      'leaf-calendar__cell--range',
    );
    expect(screen.getByRole('button', { name: '2026-02-02' }).parentElement).toHaveClass(
      'leaf-calendar__cell--range',
    );
    expect(screen.queryByRole('button', { name: '确定' })).toBeNull();
  });
  it('confirms the start before requesting the end, applying default times to both', async () => {
    const change = vi.fn();
    render(
      <ConfigProvider locale="en-US">
        <DateRangePicker
          picker="datetime"
          needConfirm
          minDate={new Date(2026, 0, 1)}
          defaultTime={['09:00', '18:30']}
          onChange={change}
        />
      </ConfigProvider>,
    );
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('tab', { name: /^Start/ })).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(screen.getByRole('button', { name: '2026-01-08' }));
    expect(screen.getByRole('tab', { name: /^Start/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByRole('button', { name: 'OK' })).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('tab', { name: /^End/ })).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(screen.getByRole('button', { name: '2026-01-20' }));
    expect(change).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('tab', { name: /^Start/ }));
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.keyboard('{Home}{ArrowRight}{ArrowRight}{ArrowRight}10');
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(change).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'OK' }));
    const range = change.mock.calls[0]?.[0] as [Date, Date];
    expect(change.mock.calls[0]?.[1]).toEqual(['2026-01-08 10:00', '2026-01-20 18:30']);
    expect(range[0].getDate()).toBe(8);
  });
  it('commits a completed draft on outside click and keeps it with needConfirm until OK', async () => {
    const change = vi.fn();
    const { rerender } = render(
      <>
        <DateRangePicker
          picker="datetime"
          needConfirm={false}
          defaultValue={[new Date(2026, 0, 8, 9), new Date(2026, 0, 20, 10)]}
          onChange={change}
        />
        <button type="button">Outside</button>
      </>,
    );
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('button', { name: '2026-01-10' }));
    await userEvent.click(screen.getByRole('button', { name: 'Outside' }));
    expect(change.mock.calls[0]?.[1]).toEqual(['2026-01-10 09:00', '2026-01-20 10:00']);
    rerender(
      <>
        <DateRangePicker
          needConfirm
          defaultValue={[new Date(2026, 0, 8), new Date(2026, 0, 20)]}
          onChange={change}
        />
        <button type="button">Outside</button>
      </>,
    );
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('button', { name: '2026-01-02' }));
    await userEvent.click(screen.getByRole('button', { name: '2026-01-05' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Outside' }));
    expect(change).toHaveBeenCalledOnce();
  });
  it('previews presets on hover and marks the matching preset', async () => {
    const week = [new Date(2026, 0, 5), new Date(2026, 0, 11)] as const;
    render(
      <DateRangePicker
        defaultValue={[new Date(2026, 0, 20), new Date(2026, 0, 22)]}
        presets={[{ label: 'First week', value: week }]}
      />,
    );
    await userEvent.click(screen.getByRole('combobox'));
    const preset = screen.getByRole('button', { name: 'First week' });
    expect(preset).toHaveAttribute('aria-pressed', 'false');
    await userEvent.hover(preset);
    expect(screen.getByRole('button', { name: '2026-01-08' }).parentElement).toHaveClass(
      'leaf-calendar__cell--range',
    );
    expect(screen.getByRole('button', { name: '2026-01-21' }).parentElement).not.toHaveClass(
      'leaf-calendar__cell--range',
    );
    await userEvent.click(preset);
    expect(screen.getByRole('combobox')).toHaveValue('2026-01-05 ~ 2026-01-11');
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('button', { name: 'First week' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
  it('follows weekStartsOn for week periods while keeping ISO week numbers', async () => {
    const change = vi.fn();
    render(
      <ConfigProvider weekStartsOn={0}>
        <DateRangePicker picker="week" minDate={new Date(2026, 0, 1)} onChange={change} />
      </ConfigProvider>,
    );
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('button', { name: '2026-01-08' }));
    await userEvent.click(screen.getByRole('button', { name: '2026-01-21' }));
    const range = change.mock.calls[0]?.[0] as [Date, Date];
    expect(range[0].getDay()).toBe(0);
    expect(range[0].getDate()).toBe(4);
    expect(change.mock.calls[0]?.[1]).toEqual(['2026-W02', '2026-W04']);
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
    await userEvent.paste('2026-01-06 ~ 2026-02-08');
    await userEvent.keyboard('{Enter}');
    expect(change).toHaveBeenCalledOnce();
    await userEvent.clear(input);
    expect(change).toHaveBeenLastCalledWith(null, ['', '']);
    change.mockClear();
    await userEvent.type(input, '2026-01-06 ~ 2026-02-30{Enter}');
    expect(change).not.toHaveBeenCalled();
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
  it('navigates individual days in week mode without losing input focus until Alt+ArrowDown', async () => {
    render(
      <DateRangePicker
        picker="week"
        defaultValue={[new Date(2026, 0, 8), new Date(2026, 0, 20)]}
      />,
    );
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('combobox')).toHaveFocus();
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}{ArrowRight}');
    expect(screen.getByRole('button', { name: '2026-01-09' })).toHaveFocus();
  });
});
