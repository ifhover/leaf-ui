import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { Calendar, ConfigProvider } from '../index';

const day = (name: string) => screen.getByRole('button', { name });
const enUS = (node: React.ReactNode) => <ConfigProvider locale="en-US">{node}</ConfigProvider>;

describe('Calendar', () => {
  it('renders an accessible month grid with localized headers and full-date names', () => {
    render(enUS(<Calendar defaultValue={new Date(2026, 9, 4)} />));
    const grid = screen.getByRole('grid', { name: 'October 2026' });
    expect(within(grid).getAllByRole('columnheader')).toHaveLength(7);
    expect(within(grid).getAllByRole('columnheader')[0]).toHaveAccessibleName('Monday');
    expect(within(grid).getAllByRole('row')).toHaveLength(7);
    const selected = day('Sunday, October 4, 2026');
    expect(selected.closest('[role="gridcell"]')).toHaveAttribute('aria-selected', 'true');
    expect(selected).toHaveAttribute('tabindex', '0');
    expect(grid.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
  });

  it('selects days, renders described cell content and respects disabled dates', () => {
    const change = vi.fn();
    render(
      enUS(
        <Calendar
          defaultValue={new Date(2026, 9, 4)}
          onChange={change}
          minDate={new Date(2026, 9, 2)}
          maxDate={new Date(2026, 9, 30)}
          disabledDate={(date) => date.getDate() === 5}
          cellRender={(date) => (date.getMonth() === 9 && date.getDate() === 6 ? 'Meeting' : null)}
        />,
      ),
    );
    expect(day('Monday, October 5, 2026')).toBeDisabled();
    expect(day('Thursday, October 1, 2026')).toBeDisabled();
    expect(day('Saturday, October 31, 2026')).toBeDisabled();
    const meeting = day('Tuesday, October 6, 2026');
    expect(meeting).toHaveAccessibleDescription('Meeting');
    fireEvent.click(meeting);
    expect(change).toHaveBeenLastCalledWith(new Date(2026, 9, 6));
    expect(meeting.closest('[role="gridcell"]')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('button', { name: 'Previous month' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next month' })).toBeDisabled();
  });

  it('moves focus with arrows, skips disabled days and pages months', () => {
    const visible = vi.fn();
    render(
      enUS(
        <Calendar
          defaultValue={new Date(2026, 9, 4)}
          onVisibleChange={visible}
          disabledDate={(date) => date.getDate() === 5}
        />,
      ),
    );
    const start = day('Sunday, October 4, 2026');
    start.focus();
    fireEvent.keyDown(start, { key: 'ArrowRight' });
    expect(day('Tuesday, October 6, 2026')).toHaveFocus();
    fireEvent.keyDown(document.activeElement as Element, { key: 'Home' });
    expect(day('Monday, October 5, 2026')).not.toHaveFocus();
    expect(day('Tuesday, October 6, 2026')).toHaveFocus();
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowDown' });
    expect(day('Tuesday, October 13, 2026')).toHaveFocus();
    fireEvent.keyDown(document.activeElement as Element, { key: 'PageDown' });
    expect(day('Friday, November 13, 2026')).toHaveFocus();
    expect(visible).toHaveBeenLastCalledWith(new Date(2026, 10, 1));
    expect(screen.getByRole('grid', { name: 'November 2026' })).toBeInTheDocument();
    fireEvent.keyDown(document.activeElement as Element, { key: 'PageUp', shiftKey: true });
    expect(day('Thursday, November 13, 2025')).toHaveFocus();
  });

  it('mirrors horizontal arrows in RTL', () => {
    render(
      <ConfigProvider locale="en-US" direction="rtl">
        <Calendar defaultValue={new Date(2026, 9, 14)} />
      </ConfigProvider>,
    );
    const start = day('Wednesday, October 14, 2026');
    start.focus();
    fireEvent.keyDown(start, { key: 'ArrowLeft' });
    expect(day('Thursday, October 15, 2026')).toHaveFocus();
  });

  it('navigates with the toolbar and returns to today', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 20, 9));
    try {
      render(enUS(<Calendar defaultValue={new Date(2026, 5, 3)} />));
      expect(screen.getByRole('grid', { name: 'June 2026' })).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
      expect(screen.getByRole('grid', { name: 'July 2026' })).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Today' }));
      expect(screen.getByRole('grid', { name: 'October 2026' })).toBeInTheDocument();
      expect(day('Tuesday, October 20, 2026')).toHaveAttribute('aria-current', 'date');
      expect(day('Tuesday, October 20, 2026')).toHaveAttribute('tabindex', '0');
    } finally {
      vi.useRealTimers();
    }
  });

  it('switches the full calendar between month and year views', () => {
    render(enUS(<Calendar defaultValue={new Date(2026, 9, 4)} />));
    const yearToggle = screen.getByRole('button', { name: 'Year' });
    expect(screen.getByRole('button', { name: 'Month' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(yearToggle);
    expect(yearToggle).toHaveAttribute('aria-pressed', 'true');
    const months = screen.getByRole('group', { name: '2026' });
    expect(within(months).getAllByRole('button')).toHaveLength(12);
    fireEvent.click(screen.getByRole('button', { name: 'Next year' }));
    expect(screen.getByRole('group', { name: '2027' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'March 2027' }));
    expect(screen.getByRole('grid', { name: 'March 2027' })).toBeInTheDocument();
    expect(day('Thursday, March 4, 2027')).toHaveFocus();
  });

  it('opens the compact month picker from its title', () => {
    render(enUS(<Calendar fullscreen={false} defaultValue={new Date(2026, 9, 4)} />));
    expect(screen.queryByRole('button', { name: 'Today' })).not.toBeInTheDocument();
    const title = screen.getByRole('button', { name: 'October 2026' });
    expect(title).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(title);
    expect(screen.getByRole('button', { name: '2026' })).toHaveAttribute('aria-expanded', 'true');
    const october = screen.getByRole('button', { name: 'October 2026' });
    expect(october).toHaveAttribute('tabindex', '0');
    october.focus();
    fireEvent.keyDown(october, { key: 'ArrowDown' });
    expect(screen.getByRole('button', { name: 'January 2027' })).toHaveFocus();
    fireEvent.click(document.activeElement as Element);
    expect(screen.getByRole('grid', { name: 'January 2027' })).toBeInTheDocument();
  });

  it('chooses months in month mode', () => {
    const change = vi.fn();
    render(
      enUS(
        <Calendar
          mode="month"
          defaultValue={new Date(2026, 9, 1)}
          onChange={change}
          disabledDate={(date) => date.getMonth() === 11}
        />,
      ),
    );
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Year' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'October 2026' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'December 2026' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'March 2026' }));
    expect(change).toHaveBeenLastCalledWith(new Date(2026, 2, 1));
    expect(screen.getByRole('button', { name: 'March 2026' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('follows controlled value and visible month', () => {
    const { rerender } = render(enUS(<Calendar value={new Date(2026, 9, 4)} />));
    rerender(enUS(<Calendar value={new Date(2027, 0, 8)} />));
    expect(screen.getByRole('grid', { name: 'January 2027' })).toBeInTheDocument();
    expect(day('Friday, January 8, 2027').closest('[role="gridcell"]')).toHaveAttribute(
      'aria-selected',
      'true',
    );
    const visible = vi.fn();
    rerender(enUS(<Calendar visibleDate={new Date(2026, 1, 1)} onVisibleChange={visible} />));
    fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
    expect(visible).toHaveBeenLastCalledWith(new Date(2026, 2, 1));
    expect(screen.getByRole('grid', { name: 'February 2026' })).toBeInTheDocument();
    act(() => {
      rerender(enUS(<Calendar visibleDate={new Date(2026, 2, 1)} onVisibleChange={visible} />));
    });
    expect(screen.getByRole('grid', { name: 'March 2026' })).toBeInTheDocument();
  });

  it('honors the configured week start and renders on the server', () => {
    render(
      <ConfigProvider locale="en-US" weekStartsOn={0}>
        <Calendar defaultValue={new Date(2026, 9, 4)} />
      </ConfigProvider>,
    );
    expect(screen.getAllByRole('columnheader')[0]).toHaveAccessibleName('Sunday');
    const html = renderToString(enUS(<Calendar defaultValue={new Date(2026, 9, 4)} />));
    expect(html).toContain('leaf-calendar-view--full');
    expect(html).toContain('October');
  });
});
