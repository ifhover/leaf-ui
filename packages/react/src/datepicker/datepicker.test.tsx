import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DatePicker } from './datepicker';

describe('DatePicker', () => {
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
    expect(screen.getByRole('combobox')).toHaveTextContent('2026年10月15日');
    expect(screen.getByRole('combobox')).toHaveFocus();
  });
  it('navigates days and months with keyboard and returns focus on Escape', async () => {
    render(<DatePicker aria-label="日期" defaultValue={new Date(2026, 9, 31)} />);
    await userEvent.click(screen.getByRole('combobox'));
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
    expect(screen.getByRole('combobox', { name: '截止日期' })).toHaveTextContent('2026年10月3日');
    await userEvent.click(screen.getByRole('button', { name: '清除日期' }));
    expect(screen.getByRole('combobox')).toHaveTextContent('请选择日期');
  });
});
