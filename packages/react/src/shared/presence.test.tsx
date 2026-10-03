import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { Select } from '../select';

afterEach(() => vi.useRealTimers());
it('keeps a closing panel inert until its animation completes, and cancels removal on reopen', async () => {
  render(<Select aria-label="Choice" options={[{ value: 'a', label: 'Alpha' }]} />);
  await userEvent.click(screen.getByRole('combobox'));
  const panel = screen.getByRole('listbox');
  panel.style.animationDuration = '160ms';
  vi.useFakeTimers();
  fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' });
  expect(panel).toHaveAttribute('data-state', 'closing');
  expect(panel).toHaveAttribute('inert');
  expect(screen.queryByRole('listbox')).toBeNull();
  act(() => vi.advanceTimersByTime(80));
  fireEvent.click(screen.getByRole('combobox'));
  act(() => vi.advanceTimersByTime(200));
  expect(screen.getByRole('listbox')).toBe(panel);
  fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' });
  fireEvent.animationEnd(panel);
  expect(panel).not.toBeInTheDocument();
});
