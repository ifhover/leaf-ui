import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DatePicker } from './datepicker';

describe('DatePicker', () => {
  it('toggles with the calendar icon and clears pending input without committing it first', async () => {
    const change = vi.fn();
    render(<DatePicker defaultValue={new Date(2026, 9, 3)} onChange={change} />);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('button', { name: '选择日期' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: '选择日期' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.clear(screen.getByRole('combobox'));
    await userEvent.type(screen.getByRole('combobox'), '2026-10-15');
    await userEvent.click(screen.getByRole('button', { name: '清除日期' }));
    expect(change).toHaveBeenCalledExactlyOnceWith(null, '');
    expect(screen.getByRole('combobox')).toHaveValue('');
  });
  it('commits typed dates on blur and rejects impossible or out-of-bounds dates', async () => {
    const change = vi.fn();
    render(
      <form aria-label="Dates">
        <DatePicker
          minDate={new Date(2026, 0, 1)}
          maxDate={new Date(2026, 11, 31)}
          onChange={change}
        />
        <button type="button">Next</button>
      </form>,
    );
    const input = screen.getByRole('combobox');
    await userEvent.type(input, '2026-02-28');
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(change).toHaveBeenCalledOnce();
    expect(input).toHaveValue('2026-02-28');
    expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus();
    await userEvent.clear(input);
    await userEvent.type(input, '2026-02-30{Enter}');
    expect(change).toHaveBeenCalledOnce();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect((screen.getByRole('form') as HTMLFormElement).checkValidity()).toBe(false);
    await userEvent.clear(input);
    await userEvent.type(input, '2027-01-01{Enter}');
    expect(change).toHaveBeenCalledOnce();
    await userEvent.keyboard('{Escape}');
    expect(input).toHaveValue('2026-02-28');
  });
  it('switches year and month panels and supports custom footer shortcuts', async () => {
    render(
      <DatePicker
        defaultValue={new Date(2026, 9, 15)}
        todayText="本日"
        renderExtraFooter={<span>快捷日期</span>}
      />,
    );
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('button', { name: '年' }));
    await userEvent.click(screen.getByRole('button', { name: '2027' }));
    await userEvent.click(screen.getByRole('button', { name: '2027-02' }));
    await userEvent.click(screen.getByRole('button', { name: '2027-02-20' }));
    expect(screen.getByRole('combobox')).toHaveValue('2027-02-20');
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('button', { name: '本日' })).toBeInTheDocument();
    expect(screen.getByText('快捷日期')).toBeInTheDocument();
  });
  it('selects a local date through the custom calendar and enforces day bounds', async () => {
    const onChange = vi.fn();
    const { container } = render(
      <DatePicker
        aria-label="日期"
        defaultValue={new Date(2026, 9, 10)}
        minDate={new Date(2026, 9, 5)}
        maxDate={new Date(2026, 9, 20)}
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByRole('combobox'));
    expect(container.querySelector('input[type="date"]')).toBeNull();
    expect(screen.getByRole('dialog', { name: '选择日期' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2026-10-04' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: '2026-10-15' }));
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 9, 15), '2026-10-15');
    expect(screen.getByRole('combobox')).toHaveValue('2026-10-15');
    expect(screen.getByRole('combobox')).toHaveFocus();
  });
  it('navigates days and months with keyboard and returns focus on Escape', async () => {
    render(<DatePicker aria-label="日期" defaultValue={new Date(2026, 9, 31)} />);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: '2026-10-31' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: '2026-11-01' })).toHaveFocus();
    await userEvent.keyboard('{PageDown}');
    expect(screen.getByRole('button', { name: '2026-12-01' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveFocus();
  });
  it('supports controlled clearing and labels associated with the trigger', async () => {
    function Example() {
      const [value, setValue] = useState<Date | null>(new Date(2026, 9, 3));
      return (
        <>
          <label htmlFor="date">截止日期</label>
          <DatePicker id="date" value={value} onChange={setValue} />
        </>
      );
    }
    render(<Example />);
    expect(screen.getByRole('combobox', { name: '截止日期' })).toHaveValue('2026-10-03');
    await userEvent.click(screen.getByRole('button', { name: '清除日期' }));
    expect(screen.getByRole('combobox')).toHaveValue('');
    expect(screen.getByRole('combobox')).toHaveAttribute('placeholder', '请选择日期');
  });
});
