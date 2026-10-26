import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DatePicker } from '../datepicker/datepicker';

const option = (unit: string, name: string) =>
  within(screen.getByRole('listbox', { name: unit })).getByRole('option', { name });
describe('DatePicker time mode', () => {
  it('allows changing period when only a different hour in that period is available', async () => {
    const change = vi.fn();
    render(
      <DatePicker
        picker="time"
        use12Hours
        defaultValue="09:30"
        minTime="09:00"
        maxTime="17:00"
        onChange={change}
      />,
    );
    await userEvent.click(screen.getByRole('combobox'));
    const period = option('时段', '下午');
    expect(period).toBeEnabled();
    await userEvent.click(period);
    await userEvent.click(screen.getByRole('button', { name: '确定' }));
    expect(change).toHaveBeenCalledExactlyOnceWith('12:30');
  });
  it('validates the submitted precision rather than hidden pasted seconds', async () => {
    const change = vi.fn();
    render(<DatePicker picker="time" minTime="09:00:30" onChange={change} />);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.paste('09:00:45');
    await userEvent.keyboard('{Enter}');
    expect(change).not.toHaveBeenCalled();
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
  });
  it('uses hour/minute columns and retains an off-step minute', async () => {
    const change = vi.fn();
    render(
      <DatePicker
        picker="time"
        defaultValue="08:07"
        minuteStep={15}
        disabledTime={(time) => time.minute === 15}
        onChange={change}
      />,
    );
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getAllByRole('listbox')).toHaveLength(2);
    option('分钟', '07').focus();
    fireEvent.keyDown(option('分钟', '07'), { key: 'ArrowDown' });
    expect(option('分钟', '15')).toBeDisabled();
    expect(option('分钟', '30')).toHaveFocus();
    expect(change).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: '确定' }));
    expect(change).toHaveBeenCalledExactlyOnceWith('08:30');
  });
  it('keeps panel drafts out of FormData and supports localized periods', async () => {
    const change = vi.fn();
    render(
      <form aria-label="Times">
        <DatePicker
          picker="time"
          name="time"
          use12Hours
          needConfirm
          defaultValue="09:00"
          onChange={change}
        />
      </form>,
    );
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    await userEvent.keyboard('{Control>}a{/Control}1125p');
    expect(input).toHaveValue('11:25 下午');
    expect(new FormData(screen.getByRole('form') as HTMLFormElement).get('time')).toBe('09:00');
    await userEvent.keyboard('{Enter}');
    expect(change).toHaveBeenCalledWith('23:25');
  });
  it.each([
    ['00:05:30', '12:05:30'],
    ['12:05:30', '00:05:30'],
  ])('steps the period at noon and midnight (%s)', async (initial, result) => {
    const change = vi.fn();
    render(
      <DatePicker picker="time" use12Hours showSeconds defaultValue={initial} onChange={change} />,
    );
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getAllByRole('listbox')).toHaveLength(4);
    await userEvent.keyboard('{End}{ArrowUp}{Enter}');
    expect(change).toHaveBeenCalledWith(result);
  });
  it('updates hours and minutes without closing until confirmation', async () => {
    const change = vi.fn();
    render(<DatePicker picker="time" defaultValue="09:00" onChange={change} />);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(option('小时', '14'));
    await userEvent.click(option('分钟', '30'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(change).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: '确定' }));
    expect(change).toHaveBeenCalledExactlyOnceWith('14:30');
  });
  it('enters the panel with Alt+Down and uses roving focus', async () => {
    render(<DatePicker picker="time" defaultValue="08:07" minuteStep={15} />);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
    expect(option('小时', '08')).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(option('小时', '09')).toHaveFocus();
    await userEvent.click(screen.getByRole('button', { name: '确定' }));
    expect(screen.getByRole('combobox')).toHaveValue('09:07');
  });
  it('commits a changed panel draft on dismiss but not an untouched panel', async () => {
    const change = vi.fn();
    render(
      <>
        <DatePicker picker="time" defaultValue="08:00" onChange={change} />
        <button type="button">Outside</button>
      </>,
    );
    const outside = screen.getByRole('button', { name: 'Outside' });
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(outside);
    expect(change).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(option('小时', '14'));
    await userEvent.click(outside);
    expect(change).toHaveBeenCalledExactlyOnceWith('14:00');
  });
  it.each(['escape', 'outside'])('discards needConfirm drafts on %s', async (reason) => {
    const change = vi.fn();
    render(
      <>
        <DatePicker picker="time" defaultValue="08:00" needConfirm onChange={change} />
        <button type="button">Outside</button>
      </>,
    );
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(option('小时', '16'));
    if (reason === 'escape') await userEvent.keyboard('{Escape}');
    else await userEvent.click(screen.getByRole('button', { name: 'Outside' }));
    expect(change).not.toHaveBeenCalled();
    expect(screen.getByRole('combobox')).toHaveValue('08:00');
  });
  it('keeps partially available hours selectable and enforces inclusive bounds', async () => {
    const change = vi.fn();
    render(
      <DatePicker
        picker="time"
        defaultValue="10:15"
        minTime="09:30"
        maxTime="18:00"
        disabledTime={(time) => time.hour === 10 && time.minute < 30}
        onChange={change}
      />,
    );
    await userEvent.click(screen.getByRole('combobox'));
    expect(option('小时', '08')).toBeDisabled();
    expect(option('小时', '09')).toBeEnabled();
    expect(option('小时', '10')).toBeEnabled();
    await userEvent.click(option('小时', '10'));
    expect(option('分钟', '29')).toBeDisabled();
    expect(option('分钟', '30')).toBeEnabled();
    await userEvent.click(option('小时', '18'));
    expect(option('分钟', '00')).toBeEnabled();
    expect(option('分钟', '01')).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: '确定' }));
    expect(change).toHaveBeenCalledWith('18:00');
  });
  it('accepts lenient paste and rejects invalid input without changing the value', async () => {
    const change = vi.fn();
    render(<DatePicker picker="time" defaultValue="08:00" onChange={change} />);
    const input = screen.getByRole('combobox');
    for (const [text, result] of [
      ['930', '09:30'],
      ['９：４５', '09:45'],
      ['21时5分', '21:05'],
      ['7.15', '07:15'],
    ]) {
      await userEvent.click(input);
      await userEvent.paste(text);
      await userEvent.keyboard('{Enter}');
      expect(change).toHaveBeenLastCalledWith(result);
    }
    change.mockClear();
    await userEvent.click(input);
    await userEvent.paste('25:99');
    await userEvent.keyboard('{Enter}');
    expect(change).not.toHaveBeenCalled();
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
  it('normalizes invalid steps and blocks disabled interaction', async () => {
    const { rerender } = render(<DatePicker picker="time" minuteStep={0} />);
    await userEvent.click(screen.getByRole('combobox'));
    expect(
      within(screen.getByRole('listbox', { name: '分钟' })).getAllByRole('option'),
    ).toHaveLength(60);
    rerender(<DatePicker picker="time" disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
