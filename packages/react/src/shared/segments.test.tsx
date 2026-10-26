import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DatePicker } from '../datepicker';
import { DateRangePicker } from '../daterangepicker';

import { parseDateText } from './parse-date';
import { createTemplate, renderSegments, segmentValues } from './segments';

function insertText(input: HTMLInputElement, text: string) {
  const start = input.selectionStart ?? 0;
  const end = input.selectionEnd ?? start;
  fireEvent.input(input, {
    target: { value: input.value.slice(0, start) + text + input.value.slice(end) },
    inputType: 'insertText',
    data: text,
  });
}

describe('segmented picker fields', () => {
  it.each(['date', 'datetime', 'time'] as const)(
    'uses card by default and allows plain panels in %s mode',
    async (picker) => {
      const { rerender } = render(<DatePicker picker={picker} />);
      await userEvent.click(screen.getByRole('combobox'));
      expect(screen.getByRole('dialog').closest('.leaf-picker-panel')).toHaveClass(
        'leaf-picker-panel--card',
      );
      rerender(<DatePicker picker={picker} panelVariant="plain" />);
      expect(screen.getByRole('dialog').closest('.leaf-picker-panel')).not.toHaveClass(
        'leaf-picker-panel--card',
      );
    },
  );
  it.each(['date', 'datetime', 'time'] as const)(
    'uses card by default and allows plain panels for %s ranges',
    async (picker) => {
      const { rerender } = render(
        picker === 'time' ? <DateRangePicker picker="time" /> : <DateRangePicker picker={picker} />,
      );
      await userEvent.click(screen.getByRole('combobox'));
      expect(screen.getByRole('dialog').closest('.leaf-picker-panel')).toHaveClass(
        'leaf-picker-panel--card',
      );
      rerender(
        picker === 'time' ? (
          <DateRangePicker picker="time" panelVariant="plain" />
        ) : (
          <DateRangePicker picker={picker} panelVariant="plain" />
        ),
      );
      expect(screen.getByRole('dialog').closest('.leaf-picker-panel')).not.toHaveClass(
        'leaf-picker-panel--card',
      );
    },
  );
  it('distributes native text input across segments without losing the selection', async () => {
    render(<DatePicker />);
    const input = screen.getByRole('combobox') as HTMLInputElement;
    await userEvent.click(input);
    insertText(input, '20000');
    expect(input).toHaveValue('2000-00-DD');
    expect([input.selectionStart, input.selectionEnd]).toEqual([5, 7]);
    insertText(input, '2');
    expect(input).toHaveValue('2000-02-DD');
    expect([input.selectionStart, input.selectionEnd]).toEqual([8, 10]);
    insertText(input, '29');
    expect(input).toHaveValue('2000-02-29');
    expect(input).toHaveFocus();
  });
  it('follows the final endpoint when one native insertion fills a datetime range', async () => {
    const change = vi.fn();
    render(
      <DateRangePicker
        picker="datetime"
        defaultValue={[new Date(2026, 9, 25, 9), new Date(2026, 9, 31, 18)]}
        onChange={change}
      />,
    );
    const input = screen.getByRole('combobox') as HTMLInputElement;
    await userEvent.click(input);
    await userEvent.keyboard('{Home}');
    insertText(input, '202703150930202703161845');
    expect(input).toHaveValue('2027-03-15 09:30 ~ 2027-03-16 18:45');
    expect(screen.getByRole('button', { name: '2027-03-16' })).toHaveClass(
      'leaf-date-picker__day--selected',
    );
    expect(screen.getByRole('button', { name: '结束' })).toHaveAttribute('aria-pressed', 'true');
    expect(change).not.toHaveBeenCalled();
  });
  it('handles full-width composition once and resumes segmented keyboard input', async () => {
    const change = vi.fn();
    render(<DatePicker onChange={change} />);
    const input = screen.getByRole('combobox') as HTMLInputElement;
    await userEvent.click(input);
    fireEvent.compositionStart(input);
    fireEvent.input(input, {
      target: { value: '２００００' },
      data: '２００００',
      inputType: 'insertCompositionText',
      isComposing: true,
    });
    expect(change).not.toHaveBeenCalled();
    fireEvent.compositionEnd(input, { data: '２００００' });
    fireEvent.input(input, {
      target: { value: '２００００' },
      data: '２００００',
      inputType: 'insertText',
    });
    expect(input).toHaveValue('2000-00-DD');
    expect([input.selectionStart, input.selectionEnd]).toEqual([5, 7]);
    await userEvent.keyboard('229{Enter}');
    expect(change).toHaveBeenCalledExactlyOnceWith(new Date(2000, 1, 29), '2000-02-29');
  });
  it.each(['', '中文'])(
    'ignores canceled or nonnumeric composition (%s) without committing or clearing',
    async (text) => {
      const change = vi.fn();
      render(
        <>
          <DatePicker defaultValue={new Date(2026, 9, 25)} onChange={change} />
          <button type="button">Next</button>
        </>,
      );
      const input = screen.getByRole('combobox');
      await userEvent.click(input);
      await userEvent.keyboard('{Control>}a{/Control}');
      fireEvent.compositionStart(input);
      fireEvent.input(input, {
        target: { value: text },
        data: text,
        inputType: 'insertCompositionText',
        isComposing: true,
      });
      fireEvent.keyDown(input, { key: 'Enter', isComposing: false });
      expect(change).not.toHaveBeenCalled();
      fireEvent.compositionEnd(input, { data: text });
      expect(input).toHaveValue('2026-10-25');
      await userEvent.click(screen.getByRole('button', { name: 'Next' }));
      expect(change).not.toHaveBeenCalled();
    },
  );
  it.each([
    ['date', '2026-02-30', '2026-10-25'],
    ['datetime', '2026-02-30 09:30', '2026-10-25 09:30'],
    ['time', '25:61', '09:30'],
  ] as const)(
    'cancels invalid %s text on blur without submitting a value',
    async (picker, invalid, original) => {
      const change = vi.fn();
      render(
        <form aria-label="Value">
          {picker === 'time' ? (
            <DatePicker picker="time" name="value" defaultValue="09:30" onChange={change} />
          ) : (
            <DatePicker
              picker={picker}
              needConfirm={false}
              name="value"
              defaultValue={new Date(2026, 9, 25, 9, 30)}
              onChange={change}
            />
          )}
          <button type="button">Next</button>
        </form>,
      );
      const input = screen.getByRole('combobox');
      const form = screen.getByRole('form') as HTMLFormElement;
      const committed = new FormData(form).get('value');
      await userEvent.click(input);
      await userEvent.paste(invalid);
      await userEvent.click(screen.getByRole('button', { name: 'Next' }));
      expect(input).toHaveValue(original);
      expect(input).not.toHaveAttribute('aria-invalid', 'true');
      expect(change).not.toHaveBeenCalled();
      expect(new FormData(form).get('value')).toBe(committed);
      await userEvent.click(input);
      expect(input).toHaveValue(original);
      await userEvent.keyboard('{Escape}');
      expect(change).not.toHaveBeenCalled();
    },
  );
  it.each(['date', 'datetime', 'time'] as const)(
    'cancels an invalid %s range on blur',
    async (picker) => {
      const change = vi.fn();
      render(
        <>
          {picker === 'time' ? (
            <DateRangePicker picker="time" defaultValue={['09:30', '18:30']} onChange={change} />
          ) : (
            <DateRangePicker
              picker={picker}
              needConfirm={false}
              defaultValue={[new Date(2026, 9, 25, 9, 30), new Date(2026, 9, 26, 18, 30)]}
              onChange={change}
            />
          )}
          <button type="button">Next</button>
        </>,
      );
      const input = screen.getByRole('combobox') as HTMLInputElement;
      const original = input.value;
      await userEvent.click(input);
      await userEvent.paste(
        picker === 'time'
          ? '09:30 ~ 25:61'
          : picker === 'datetime'
            ? '2026-10-25 09:30 ~ 2026-02-30 18:30'
            : '2026-10-25 ~ 2026-02-30',
      );
      await userEvent.click(screen.getByRole('button', { name: 'Next' }));
      expect(input).toHaveValue(original);
      expect(input).not.toHaveAttribute('aria-invalid', 'true');
      expect(change).not.toHaveBeenCalled();
    },
  );
  it('cancels an incomplete segmented date when Tab leaves the last segment', async () => {
    const change = vi.fn();
    render(
      <>
        <DatePicker onChange={change} />
        <button type="button">Next</button>
      </>,
    );
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    await userEvent.keyboard('20000{End}{Tab}');
    expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus();
    expect(input).toHaveValue('');
    expect(change).not.toHaveBeenCalled();
  });
  it('restores the committed date rather than an earlier panel draft after an invalid edit', async () => {
    const change = vi.fn();
    render(
      <>
        <DatePicker
          picker="datetime"
          needConfirm={false}
          defaultValue={new Date(2026, 9, 25, 9, 30)}
          onChange={change}
        />
        <button type="button">Next</button>
      </>,
    );
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    await userEvent.click(screen.getByRole('button', { name: '2026-10-26' }));
    await userEvent.click(input);
    await userEvent.keyboard('{Home}20260230');
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(input).toHaveValue('2026-10-25 09:30');
    expect(change).not.toHaveBeenCalled();
    await userEvent.click(input);
    expect(screen.getByRole('button', { name: '2026-10-25' })).toHaveClass(
      'leaf-date-picker__day--selected',
    );
  });
  it.each(['bounds', 'disabledDate', 'disabledTime'] as const)(
    'cancels a syntactically valid date rejected by %s',
    async (constraint) => {
      const change = vi.fn();
      render(
        <>
          <DatePicker
            picker={constraint === 'disabledTime' ? 'datetime' : 'date'}
            needConfirm={false}
            defaultValue={new Date(2026, 9, 25)}
            maxDate={constraint === 'bounds' ? new Date(2026, 9, 25) : undefined}
            disabledDate={
              constraint === 'disabledDate' ? (date) => date.getDate() === 26 : undefined
            }
            disabledTime={
              constraint === 'disabledTime' ? (_parts, date) => date.getDate() === 26 : undefined
            }
            onChange={change}
          />
          <button type="button">Next</button>
        </>,
      );
      const input = screen.getByRole('combobox');
      await userEvent.click(input);
      await userEvent.keyboard('{Home}20261026');
      await userEvent.click(screen.getByRole('button', { name: 'Next' }));
      expect(input).toHaveValue(constraint === 'disabledTime' ? '2026-10-25 00:00' : '2026-10-25');
      expect(change).not.toHaveBeenCalled();
    },
  );
  it.each(['bounds', 'disabledTime'] as const)(
    'cancels a time rejected by %s',
    async (constraint) => {
      const change = vi.fn();
      render(
        <>
          <DatePicker
            picker="time"
            defaultValue="09:30"
            maxTime={constraint === 'bounds' ? '10:00' : undefined}
            disabledTime={constraint === 'disabledTime' ? (time) => time.hour === 11 : undefined}
            onChange={change}
          />
          <button type="button">Next</button>
        </>,
      );
      const input = screen.getByRole('combobox');
      await userEvent.click(input);
      await userEvent.keyboard('{Home}1130{Tab}');
      expect(input).toHaveValue('09:30');
      expect(change).not.toHaveBeenCalled();
    },
  );
  it('commits valid native input exactly once when clicking outside', async () => {
    const change = vi.fn();
    render(
      <>
        <DatePicker defaultValue={new Date(2026, 9, 25)} onChange={change} />
        <button type="button">Next</button>
      </>,
    );
    const input = screen.getByRole('combobox') as HTMLInputElement;
    await userEvent.click(input);
    await userEvent.keyboard('{Home}');
    insertText(input, '20261126');
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(change).toHaveBeenCalledExactlyOnceWith(new Date(2026, 10, 26), '2026-11-26');
  });
  it('does not silently replace an invalid final segment with its last digit', async () => {
    const change = vi.fn();
    render(
      <>
        <DatePicker picker="time" defaultValue="09:30" onChange={change} />
        <button type="button">Next</button>
      </>,
    );
    const input = screen.getByRole('combobox') as HTMLInputElement;
    await userEvent.click(input);
    await userEvent.keyboard('{Home}');
    insertText(input, '2360');
    expect(input).toHaveValue('23:60');
    await userEvent.keyboard('{Enter}');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(input).toHaveValue('09:30');
    expect(change).not.toHaveBeenCalled();
  });
  it('does not restore a panel draft after clearing a time value', async () => {
    const change = vi.fn();
    render(<DatePicker picker="time" defaultValue="09:30" onChange={change} />);
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    await userEvent.click(
      within(screen.getByRole('listbox', { name: '小时' })).getByRole('option', { name: '10' }),
    );
    await userEvent.click(input);
    await userEvent.keyboard('{Control>}a{/Control}{Delete}{Tab}');
    expect(change).toHaveBeenCalledExactlyOnceWith(null);
    expect(input).toHaveValue('');
  });
  it('prepares current values when the popup is opened externally', async () => {
    const { rerender } = render(
      <DateRangePicker picker="time" open={false} value={['12:15', '18:45']} />,
    );
    rerender(<DateRangePicker picker="time" open value={['12:15', '18:45']} />);
    const [start, end] = screen.getAllByRole('listbox', { name: '小时' });
    if (!start || !end) throw new Error('Missing time columns');
    expect(within(start).getByRole('option', { name: '12' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(within(end).getByRole('option', { name: '18' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });
  it.each(['date', 'datetime', 'time'] as const)(
    'deletes one segment and clears the entire %s value with select-all',
    async (picker) => {
      const change = vi.fn();
      render(
        picker === 'time' ? (
          <DatePicker picker="time" name="value" defaultValue="09:30" onChange={change} />
        ) : (
          <DatePicker
            picker={picker}
            name="value"
            defaultValue={new Date(2026, 9, 25, 9, 30)}
            onChange={change}
          />
        ),
      );
      const input = screen.getByRole('combobox');
      await userEvent.click(input);
      await userEvent.keyboard('{Home}{Delete}');
      expect(input).toHaveValue(
        picker === 'time' ? 'HH:30' : picker === 'datetime' ? 'YYYY-10-25 09:30' : 'YYYY-10-25',
      );
      expect(change).not.toHaveBeenCalled();
      await userEvent.keyboard('{Control>}a{/Control}{Backspace}');
      expect(input).toHaveValue('');
      expect(change).toHaveBeenCalledOnce();
      expect(document.querySelector('input[name="value"]')).toHaveValue('');
      await userEvent.keyboard('{Escape}');
      expect(input).toHaveValue('');
    },
  );
  it('follows valid typed dates immediately without committing or stealing input focus', async () => {
    const change = vi.fn();
    render(<DatePicker defaultValue={new Date(2026, 9, 25)} onChange={change} />);
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    await userEvent.keyboard('{Home}20270315');
    expect(screen.getByRole('button', { name: '2027-03-15' })).toHaveClass(
      'leaf-date-picker__day--selected',
    );
    expect(input).toHaveFocus();
    expect(change).not.toHaveBeenCalled();
    await userEvent.keyboard('{Escape}');
    expect(input).toHaveValue('2026-10-25');
  });
  it('follows either typed datetime endpoint and confirms a complete typed range', async () => {
    const change = vi.fn();
    render(
      <DateRangePicker
        picker="datetime"
        defaultValue={[new Date(2026, 9, 25, 9), new Date(2026, 9, 31, 18)]}
        onChange={change}
      />,
    );
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    await userEvent.keyboard('{Home}202703150930202703161845');
    expect(screen.getByRole('button', { name: '2027-03-16' })).toHaveClass(
      'leaf-date-picker__day--selected',
    );
    expect(
      within(screen.getByRole('listbox', { name: '小时' })).getByRole('option', { name: '18' }),
    ).toHaveAttribute('aria-selected', 'true');
    expect(change).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: '确定' }));
    expect(change).toHaveBeenCalledExactlyOnceWith(
      [new Date(2027, 2, 15, 9, 30), new Date(2027, 2, 16, 18, 45)],
      ['2027-03-15 09:30', '2027-03-16 18:45'],
    );
  });
  it('types compact digits, space-switches, steps a segment and Tabs out of the field', async () => {
    const change = vi.fn();
    render(
      <>
        <DatePicker picker="time" onChange={change} />
        <button type="button">Next</button>
      </>,
    );
    const input = screen.getByRole('combobox') as HTMLInputElement;
    await userEvent.type(input, '0930');
    expect(input).toHaveValue('09:30');
    expect(input.selectionStart).toBe(3);
    await userEvent.keyboard('{Home}1 45{Enter}');
    expect(change).toHaveBeenLastCalledWith('01:45');
    await userEvent.keyboard('{Home}{ArrowUp}{ArrowRight}{ArrowDown}{Tab}');
    expect(change).toHaveBeenLastCalledWith('02:44');
    expect(input).not.toHaveFocus();
  });
  it('Tabs and Spaces through empty segments and leaves only at the field edges', async () => {
    render(
      <>
        <button type="button">Previous</button>
        <DatePicker />
        <button type="button">Next</button>
      </>,
    );
    const input = screen.getByRole('combobox') as HTMLInputElement;
    await userEvent.click(input);
    await userEvent.keyboard('2026');
    expect([input.selectionStart, input.selectionEnd]).toEqual([5, 7]);
    await userEvent.keyboard('{Tab}');
    expect(input).toHaveFocus();
    expect([input.selectionStart, input.selectionEnd]).toEqual([8, 10]);
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
    expect([input.selectionStart, input.selectionEnd]).toEqual([5, 7]);
    await userEvent.keyboard(' ');
    expect([input.selectionStart, input.selectionEnd]).toEqual([8, 10]);
    await userEvent.keyboard(' ');
    expect([input.selectionStart, input.selectionEnd]).toEqual([8, 10]);
    await userEvent.keyboard('{Tab}');
    expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus();
    await userEvent.click(input);
    await userEvent.keyboard('{Home}{Shift>}{Tab}{/Shift}');
    expect(screen.getByRole('button', { name: 'Previous' })).toHaveFocus();
  });
  it('selects the next segment immediately after completing hours, including on an existing value', async () => {
    render(<DatePicker picker="time" defaultValue="09:30" />);
    const input = screen.getByRole('combobox') as HTMLInputElement;
    await userEvent.click(input);
    await userEvent.keyboard('{Home}14');
    expect(input).toHaveValue('14:30');
    expect([input.selectionStart, input.selectionEnd]).toEqual([3, 5]);
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}1{Tab}');
    expect(input).toHaveValue('01:30');
    expect([input.selectionStart, input.selectionEnd]).toEqual([3, 5]);
  });
  it('Tabs across both datetime endpoints without committing or returning to the start', async () => {
    const change = vi.fn();
    render(
      <>
        <DateRangePicker
          picker="datetime"
          defaultValue={[new Date(2026, 9, 25, 9), new Date(2026, 9, 31, 18)]}
          onChange={change}
        />
        <button type="button">Next</button>
      </>,
    );
    const input = screen.getByRole('combobox') as HTMLInputElement;
    await userEvent.click(input);
    await userEvent.keyboard('{Home}{Tab}{Tab}{Tab}{Tab}{Tab}');
    expect(input).toHaveFocus();
    expect([input.selectionStart, input.selectionEnd]).toEqual([19, 23]);
    expect(screen.getByRole('button', { name: '结束' })).toHaveAttribute('aria-pressed', 'true');
    expect(change).not.toHaveBeenCalled();
    await userEvent.keyboard('{End}{Tab}');
    expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus();
    expect(change).not.toHaveBeenCalled();
  });
  it('rejects an impossible date, preserves it for correction and Escape restores the value', async () => {
    const change = vi.fn();
    render(<DatePicker defaultValue={new Date(2026, 9, 25)} onChange={change} />);
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    await userEvent.keyboard('{Control>}a{/Control}20260230{Enter}');
    expect(change).not.toHaveBeenCalled();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    await userEvent.keyboard('{Escape}');
    expect(input).toHaveValue('2026-10-25');
    await userEvent.keyboard('{Home}20261026{Enter}');
    expect(change).toHaveBeenLastCalledWith(new Date(2026, 9, 26), '2026-10-26');
  });
  it('opens the calendar explicitly and edits time alongside the calendar', async () => {
    const change = vi.fn();
    render(
      <DatePicker
        picker="datetime"
        defaultValue={new Date(2026, 9, 25, 9, 30)}
        onChange={change}
      />,
    );
    const input = screen.getByRole('combobox') as HTMLInputElement;
    await userEvent.click(input);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
    expect(screen.getAllByRole('listbox')).toHaveLength(2);
    await userEvent.click(screen.getByRole('button', { name: '2026-10-26' }));
    await userEvent.click(input);
    await userEvent.keyboard('{Home}{ArrowRight}{ArrowRight}{ArrowRight}1445{Enter}');
    expect(change).toHaveBeenLastCalledWith(new Date(2026, 9, 26, 14, 45), '2026-10-26 14:45');
  });
  it('auto-advances from the start group to the end group', async () => {
    const change = vi.fn();
    render(<DateRangePicker onChange={change} />);
    await userEvent.type(screen.getByRole('combobox'), '2026102520261031{Enter}');
    expect(change).toHaveBeenCalledWith(
      [new Date(2026, 9, 25), new Date(2026, 9, 31)],
      ['2026-10-25', '2026-10-31'],
    );
  });
  it('pastes the entire value using the existing parser, including localized periods', async () => {
    const change = vi.fn();
    render(<DatePicker picker="time" use12Hours onChange={change} />);
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    await userEvent.paste('11:25 下午');
    await userEvent.keyboard('{Enter}');
    expect(change).toHaveBeenCalledWith('23:25');
  });
  it('keeps form reset and needConfirm behavior, including an uncommitted draft', async () => {
    const change = vi.fn();
    render(
      <form aria-label="Times">
        <DatePicker picker="time" name="time" needConfirm defaultValue="09:00" onChange={change} />
        <button type="reset">Reset</button>
        <button type="button">Next</button>
      </form>,
    );
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    await userEvent.keyboard('{Home}1030');
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(input).toHaveValue('09:00');
    expect(change).not.toHaveBeenCalled();
    await userEvent.click(input);
    await userEvent.keyboard('{Home}1030{Enter}');
    expect(new FormData(screen.getByRole('form') as HTMLFormElement).get('time')).toBe('10:30');
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(input).toHaveValue('09:00');
    await userEvent.click(input);
    await userEvent.keyboard('{Home}1145');
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(input).toHaveValue('09:00');
  });
  it('supports custom segment order', async () => {
    const change = vi.fn();
    render(<DatePicker format="DD/MM/YYYY" onChange={change} />);
    await userEvent.type(screen.getByRole('combobox'), '25102026{Enter}');
    expect(change).toHaveBeenCalledWith(new Date(2026, 9, 25), '25/10/2026');
  });
  it('leaves function formats as free-text fields with their custom parser', async () => {
    const change = vi.fn();
    render(
      <DatePicker
        format={(date) => `day ${date.getDate()}`}
        parse={(text) => (text === 'day 25' ? new Date(2026, 9, 25) : null)}
        onChange={change}
      />,
    );
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'day 25{Enter}');
    expect(change).toHaveBeenCalledWith(new Date(2026, 9, 25), 'day 25');
    expect(input.closest('[data-segmented]')).toBeNull();
  });
  it('commits a calendar draft with Enter in confirmation mode', async () => {
    const change = vi.fn();
    render(
      <DatePicker
        picker="datetime"
        needConfirm
        defaultValue={new Date(2026, 9, 25, 9, 30)}
        onChange={change}
      />,
    );
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    await userEvent.click(screen.getByRole('button', { name: '2026-10-26' }));
    expect(change).not.toHaveBeenCalled();
    await userEvent.click(input);
    await userEvent.keyboard('{Enter}');
    expect(change).toHaveBeenCalledExactlyOnceWith(
      new Date(2026, 9, 26, 9, 30),
      '2026-10-26 09:30',
    );
  });
  it('normalizes full-width digits', async () => {
    const change = vi.fn();
    render(<DatePicker picker="time" onChange={change} />);
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    for (const key of '０９３０') fireEvent.keyDown(input, { key });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(change).toHaveBeenCalledWith('09:30');
  });
});

describe('segment date model', () => {
  it('round-trips 12-hour midnight and noon and rejects invalid leap days', () => {
    const template = createTemplate([{ pattern: 'YYYY-MM-DD hh:mm:ss A', internal: true }]);
    for (const hour of [0, 12, 23]) {
      const date = new Date(2024, 1, 29, hour, 30, 15);
      const text = renderSegments(template, segmentValues(template, [date]), {
        placeholders: {},
        periods: ['AM', 'PM'],
      }).text;
      expect(parseDateText(text, 'datetime')).toEqual(date);
    }
    expect(parseDateText('2026-02-29 12:00:00 AM', 'datetime')).toBeNull();
  });
  it('round-trips ISO week boundaries independently from the local week start', () => {
    const template = createTemplate([{ pattern: 'YYYY-[W]WW', internal: true }]);
    const date = new Date(2025, 11, 28);
    const values = segmentValues(template, [date], 0);
    expect(values).toEqual([2026, 1]);
    const text = renderSegments(template, values, { placeholders: {}, periods: ['AM', 'PM'] }).text;
    expect(parseDateText(text, 'week', undefined, 0)).toEqual(date);
  });
});
