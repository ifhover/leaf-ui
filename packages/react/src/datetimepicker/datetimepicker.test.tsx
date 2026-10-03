import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { ConfigProvider } from '../config-provider';
import { DateTimePicker } from './datetimepicker';

it('combines a date with hours, minutes and seconds and honors exact bounds', async () => {
  const change = vi.fn();
  render(
    <ConfigProvider locale="en-US">
      <DateTimePicker
        aria-label="Date and time"
        defaultValue={new Date(2026, 9, 3, 12)}
        minDate={new Date(2026, 9, 3, 12)}
        maxDate={new Date(2026, 9, 3, 13)}
        onChange={change}
      />
    </ConfigProvider>,
  );
  await userEvent.click(screen.getByRole('combobox'));
  await userEvent.click(screen.getByRole('button', { name: 'Choose time' }));
  expect(
    within(screen.getByRole('listbox', { name: 'Hours' })).getByRole('option', { name: '12' }),
  ).toHaveFocus();
  await userEvent.click(
    within(screen.getByRole('listbox', { name: 'Hours' })).getByRole('option', { name: '11' }),
  );
  expect(screen.getByRole('button', { name: 'OK' })).toBeDisabled();
  await userEvent.click(
    within(screen.getByRole('listbox', { name: 'Hours' })).getByRole('option', { name: '12' }),
  );
  await userEvent.click(
    within(screen.getByRole('listbox', { name: 'Minutes' })).getByRole('option', { name: '15' }),
  );
  await userEvent.click(
    within(screen.getByRole('listbox', { name: 'Seconds' })).getByRole('option', { name: '30' }),
  );
  await userEvent.click(screen.getByRole('button', { name: 'Choose date' }));
  expect(screen.getByRole('button', { name: '2026-10-03' })).toHaveFocus();
  await userEvent.click(screen.getByRole('button', { name: 'OK' }));
  expect(change.mock.calls[0]?.[1]).toBe('2026-10-03 12:15:30');
});
