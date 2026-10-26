import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from '../config-provider';
import { DateRangePicker } from '../daterangepicker/daterangepicker';

describe('DateRangePicker', () => {
  it('edits both endpoints without switching views and retains native values and reset', async () => {
    const change = vi.fn();
    const { container } = render(
      <ConfigProvider locale="en-US">
        <form>
          <DateRangePicker
            picker="time"
            name="hours"
            defaultValue={['09:00', '18:00']}
            minuteStep={15}
            onChange={change}
          />
        </form>
      </ConfigProvider>,
    );
    await userEvent.click(screen.getByRole('combobox'));
    const start = within(screen.getByRole('group', { name: 'Start' }));
    const end = within(screen.getByRole('group', { name: 'End' }));
    await userEvent.click(
      within(start.getByRole('listbox', { name: 'Hours' })).getByRole('option', { name: '10' }),
    );
    await userEvent.click(
      within(start.getByRole('listbox', { name: 'Minutes' })).getByRole('option', { name: '15' }),
    );
    await userEvent.click(
      within(end.getByRole('listbox', { name: 'Hours' })).getByRole('option', { name: '11' }),
    );
    await userEvent.click(
      within(end.getByRole('listbox', { name: 'Minutes' })).getByRole('option', { name: '45' }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'OK' }));
    expect(change).toHaveBeenLastCalledWith(['10:15', '11:45']);
    const form = container.querySelector('form');
    expect(form).not.toBeNull();
    expect(new FormData(form ?? undefined).get('hours')).toBe('10:15/11:45');
    if (form) fireEvent.reset(form);
    await waitFor(() => expect(screen.getByRole('combobox')).toHaveValue('09:00 ~ 18:00'));
  });
  it('keeps endpoint-specific disabled times and invalid ordering enforced', async () => {
    render(
      <ConfigProvider locale="en-US">
        <DateRangePicker
          picker="time"
          defaultValue={['09:00', '18:00']}
          disabledTime={(time, position) => position === 'end' && time.hour === 11}
        />
      </ConfigProvider>,
    );
    await userEvent.click(screen.getByRole('combobox'));
    const start = within(screen.getByRole('group', { name: 'Start' }));
    const end = within(screen.getByRole('group', { name: 'End' }));
    const startSlots = within(start.getByRole('listbox', { name: 'Hours' }));
    const endSlots = within(end.getByRole('listbox', { name: 'Hours' }));
    expect(endSlots.getByRole('option', { name: '11', hidden: true })).toBeDisabled();
    expect(startSlots.getByRole('option', { name: '11', hidden: true })).toBeEnabled();
    await userEvent.click(startSlots.getByRole('option', { name: '22', hidden: true }));
    expect(screen.getByRole('button', { name: 'OK' })).toBeDisabled();
    await userEvent.click(endSlots.getByRole('option', { name: '23', hidden: true }));
    expect(screen.getByRole('button', { name: 'OK' })).toBeEnabled();
  });
});
