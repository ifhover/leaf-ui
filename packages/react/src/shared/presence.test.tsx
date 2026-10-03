import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { Select } from '../select';

afterEach(() => vi.useRealTimers());
it('preserves the last list contents and position during a selection transition', async () => {
  render(
    <Select
      showSearch
      aria-label="Choice"
      options={[
        { value: 'a', label: 'Alpha' },
        { value: 'b', label: 'Beta' },
      ]}
    />,
  );
  await userEvent.click(screen.getByRole('combobox'));
  await userEvent.type(screen.getByRole('combobox'), 'Al');
  const panel = screen.getByRole('listbox');
  panel.style.transitionDuration = '160ms';
  const position = panel.style.transform;
  await userEvent.click(screen.getByRole('option', { name: 'Alpha' }));
  expect(panel).toHaveAttribute('data-state', 'closing');
  expect(panel.textContent).toBe('Alpha');
  expect(panel.style.transform).toBe(position);
  expect(panel).toHaveAttribute('inert');
  fireEvent.transitionEnd(panel, { propertyName: 'opacity' });
  expect(panel).not.toBeInTheDocument();
});
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
