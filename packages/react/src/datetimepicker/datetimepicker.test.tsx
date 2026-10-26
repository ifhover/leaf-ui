import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { ConfigProvider } from '../config-provider';
import { DatePicker } from '../datepicker/datepicker';

it('keeps times in the field and enforces bounds at second precision', async () => {
  const change = vi.fn();
  render(
    <ConfigProvider locale="en-US">
      <DatePicker
        picker="datetime"
        showSeconds
        defaultValue={new Date(2026, 9, 3, 12)}
        minDate={new Date(2026, 9, 3, 12)}
        maxDate={new Date(2026, 9, 3, 13)}
        onChange={change}
      />
    </ConfigProvider>,
  );
  const input = screen.getByRole('combobox');
  await userEvent.click(input);
  expect(screen.getByRole('button', { name: '2026-10-03' })).toBeInTheDocument();
  expect(screen.getAllByRole('listbox')).toHaveLength(3);
  await userEvent.keyboard('{Home}{ArrowRight}{ArrowRight}{ArrowRight}121530{Enter}');
  expect(change).toHaveBeenCalledWith(new Date(2026, 9, 3, 12, 15, 30), '2026-10-03 12:15:30');
  await userEvent.keyboard('{Home}{ArrowRight}{ArrowRight}{ArrowRight}140000{Enter}');
  expect(change).toHaveBeenCalledOnce();
  expect(input).toHaveAttribute('aria-invalid', 'true');
});

it('keeps the calendar and time columns together until OK, without Now or a preview', async () => {
  const change = vi.fn();
  render(
    <ConfigProvider locale="en-US">
      <DatePicker picker="datetime" defaultValue={new Date(2026, 9, 3, 9, 30)} onChange={change} />
    </ConfigProvider>,
  );
  const input = screen.getByRole('combobox');
  await userEvent.click(input);
  await userEvent.click(screen.getByRole('button', { name: '2026-10-08' }));
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Now' })).toBeNull();
  expect(document.querySelector('.leaf-picker-footer__preview')).toBeNull();
  await userEvent.click(
    within(screen.getByRole('listbox', { name: 'Hours' })).getByRole('option', { name: '14' }),
  );
  expect(change).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole('button', { name: 'OK' }));
  expect(change).toHaveBeenCalledExactlyOnceWith(new Date(2026, 9, 8, 14, 30), '2026-10-08 14:30');
  expect(input).toHaveFocus();
});

it('discards the draft on Escape and when confirmation is required', async () => {
  const change = vi.fn();
  render(
    <ConfigProvider locale="en-US">
      <DatePicker
        picker="datetime"
        aria-label="Date and time"
        needConfirm
        defaultValue={new Date(2026, 9, 3, 9, 30)}
        onChange={change}
      />
      <button type="button">Outside</button>
    </ConfigProvider>,
  );
  const input = screen.getByRole('combobox');
  await userEvent.click(input);
  await userEvent.click(screen.getByRole('button', { name: '2026-10-08' }));
  await userEvent.keyboard('{Escape}');
  await userEvent.click(input);
  await userEvent.click(screen.getByRole('button', { name: '2026-10-09' }));
  await userEvent.click(screen.getByRole('button', { name: 'Outside' }));
  expect(change).not.toHaveBeenCalled();
  expect(input).toHaveValue('2026-10-03 09:30');
});
