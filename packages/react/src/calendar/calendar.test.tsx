import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Calendar, ConfigProvider } from '../index';

describe('Calendar', () => {
  it('supports custom date content, disabled dates and controlled month updates', () => {
    const change = vi.fn();
    const { rerender } = render(
      <ConfigProvider locale="en-US">
        <Calendar
          value={new Date(2026, 9, 4)}
          onChange={change}
          minDate={new Date(2026, 9, 1)}
          maxDate={new Date(2026, 9, 31)}
          disabledDate={(date) => date.getDate() === 5}
          cellRender={(date) => (date.getMonth() === 9 && date.getDate() === 6 ? 'Meeting' : null)}
        />
      </ConfigProvider>,
    );
    expect(screen.getByRole('button', { name: '2026-10-05' })).toBeDisabled();
    expect(screen.getByText('Meeting')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '2026-10-06' }));
    expect(change).toHaveBeenLastCalledWith(new Date(2026, 9, 6));
    expect(screen.getByRole('button', { name: '2026-10-04' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    const selected = screen.getByRole('button', { name: '2026-10-04' });
    selected.focus();
    fireEvent.keyDown(selected, { key: 'ArrowRight' });
    expect(screen.getByRole('button', { name: '2026-10-06' })).toHaveFocus();
    rerender(<Calendar value={new Date(2027, 0, 8)} />);
    expect(screen.getByRole('button', { name: '2027-01-08' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
  it('switches to month mode and keeps arrow navigation available', () => {
    const { rerender } = render(<Calendar defaultValue={new Date(2026, 9, 4)} />);
    const selected = screen.getByRole('button', { name: '2026-10-04' });
    selected.focus();
    fireEvent.keyDown(selected, { key: 'ArrowRight' });
    expect(screen.getByRole('button', { name: '2026-10-05' })).toHaveFocus();
    rerender(<Calendar defaultValue={new Date(2026, 9, 4)} mode="month" fullscreen={false} />);
    expect(screen.getByRole('button', { name: '2026-10' })).toBeInTheDocument();
  });
});
