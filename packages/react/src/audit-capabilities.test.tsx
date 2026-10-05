import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { createRef, StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Toolbar } from './appbar';
import { AutoComplete } from './autocomplete';
import { Carousel, type CarouselHandle } from './carousel';
import { Cascader, mapCascaderOptions } from './cascader';
import { CheckboxGroup } from './checkbox';
import { ColorPicker } from './colorpicker';
import { CommandPalette } from './commandpalette';
import { ConfigProvider } from './config-provider';
import { colorContrast } from './config-provider/helpers';
import { DatePicker } from './datepicker';
import { DateRangePicker } from './daterangepicker';
import { Form, FormField } from './form';
import { useFormValidation } from './form/validation';
import { Input } from './input';
import { InputNumber } from './inputnumber';
import { List, ListItem } from './list';
import { Mentions } from './mentions';
import { formatPickerDate, parsePickerDate } from './shared/date-format';
import { Splitter } from './splitter';
import { Countdown } from './statistic';
import { TimePicker } from './timepicker';
import { Tour } from './tour';
import { Text } from './typography';
import { Upload, type UploadHandle } from './upload';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('audit selection, date and native form capabilities', () => {
  it('preserves literals and rejects impossible dates in custom formats', () => {
    const date = new Date(2026, 9, 5);
    expect(formatPickerDate(date, 'YYYY-[Q]Q', () => '')).toBe('2026-Q4');
    const quarter = parsePickerDate('2026-Q4', 'YYYY-[Q]Q', () => null);
    expect(quarter?.getFullYear()).toBe(2026);
    expect(quarter?.getMonth()).toBe(9);
    expect(parsePickerDate('31/02/2026', 'DD/MM/YYYY', () => null)).toBeNull();
  });
  it('keeps a read-only color value locked even with a controlled-open request', async () => {
    const change = vi.fn();
    render(<ColorPicker defaultValue="#20834a" readOnly open allowClear onChange={change} />);
    await userEvent.click(screen.getByRole('button', { name: '选择颜色' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '清除颜色' })).not.toBeInTheDocument();
    expect(change).not.toHaveBeenCalled();
  });
  it('keeps gradient fields labelled, forwards events and clears with native reset', async () => {
    const change = vi.fn();
    const click = vi.fn();
    const { container } = render(
      <Form>
        <FormField label="Brand" required>
          <ColorPicker name="brand" mode="gradient" allowClear onChange={change} onClick={click} />
        </FormField>
        <button type="reset">Reset gradient</button>
      </Form>,
    );
    const trigger = screen.getByRole('button', { name: 'Brand' });
    await userEvent.click(trigger);
    expect(click).toHaveBeenCalledOnce();
    await userEvent.keyboard('{Escape}');
    await userEvent.click(screen.getByRole('button', { name: '清除颜色' }));
    expect(change).toHaveBeenLastCalledWith('');
    const form = container.querySelector('form') as HTMLFormElement;
    expect(form.checkValidity()).toBe(false);
    await userEvent.click(screen.getByRole('button', { name: 'Reset gradient' }));
    expect(new FormData(form).get('brand')).toMatch(/^linear-gradient/);
    expect(form.checkValidity()).toBe(true);
  });
  it('focuses a custom field trigger when asynchronous validation reports its name', async () => {
    function Validated() {
      const validation = useFormValidation({ validate: () => ({ color: 'Choose another color' }) });
      return (
        <Form onSubmit={validation.handleSubmit}>
          <FormField label="Color" error={validation.errors.color}>
            <ColorPicker name="color" />
          </FormField>
          <button type="submit">Save</button>
        </Form>
      );
    }
    render(<Validated />);
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.getByRole('button', { name: 'Color' })).toHaveFocus();
  });
  it('respects noValidate when an application supplies schema validation', async () => {
    const validate = vi.fn(() => ({ email: 'Schema error' }));
    function Validated() {
      const validation = useFormValidation({ validate });
      return (
        <Form noValidate onSubmit={validation.handleSubmit}>
          <FormField label="Email" error={validation.errors.email}>
            <Input type="email" name="email" defaultValue="invalid" />
          </FormField>
          <button type="submit">Validate schema</button>
        </Form>
      );
    }
    render(<Validated />);
    await userEvent.click(screen.getByRole('button', { name: 'Validate schema' }));
    expect(validate).toHaveBeenCalledOnce();
    expect(screen.getByText('Schema error')).toBeInTheDocument();
  });
  it('dismisses a nested color popup before its gradient editor', async () => {
    render(
      <ConfigProvider locale="en-US">
        <ColorPicker mode="gradient" />
      </ConfigProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Choose a color' }));
    await userEvent.click(
      screen.getAllByRole('button', { name: 'Choose a color' })[1] as HTMLElement,
    );
    expect(screen.getAllByRole('dialog')).toHaveLength(2);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.getAllByRole('dialog')).toHaveLength(1));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
  it('keeps a server-supplied countdown stable across server/client clock differences', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-06T00:00:00Z'));
    const value = Date.now() + 3600000;
    const server = renderToString(<Countdown value={value} initialRemaining={3600000} />);
    vi.advanceTimersByTime(2345);
    expect(renderToString(<Countdown value={value} initialRemaining={3600000} />)).toBe(server);
    expect(server).toContain('01:00:00');
  });
  it('searches and selects several Cascader paths without closing the panel', async () => {
    const change = vi.fn();
    render(
      <Cascader
        multiple
        showSearch
        aria-label="Area"
        options={mapCascaderOptions(
          [
            {
              id: 'a',
              name: 'Asia',
              nodes: [
                { id: 't', name: 'Taipei' },
                { id: 's', name: 'Seoul' },
              ],
            },
          ],
          { value: 'id', label: 'name', children: 'nodes' },
        )}
        onChange={change}
      />,
    );
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.type(screen.getByRole('textbox'), 'Taipei');
    await userEvent.click(screen.getByRole('option', { name: /Taipei/ }));
    expect(change).toHaveBeenLastCalledWith([['a', 't']], expect.any(Array));
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
    await userEvent.clear(screen.getByRole('textbox'));
    await userEvent.type(screen.getByRole('textbox'), 'Seoul');
    await userEvent.click(screen.getByRole('option', { name: /Seoul/ }));
    expect(change).toHaveBeenLastCalledWith(
      [
        ['a', 't'],
        ['a', 's'],
      ],
      expect.any(Array),
    );
  });
  it('keeps exact decimals through stepping, formatted display, FormData and reset', async () => {
    render(
      <form aria-label="Money">
        <InputNumber
          name="amount"
          aria-label="Amount"
          stringMode
          defaultValue="9007199254740993.12"
          step="0.01"
          grouping
          precision={2}
        />
        <button type="reset">Reset</button>
      </form>,
    );
    const form = screen.getByRole('form') as HTMLFormElement;
    await userEvent.click(screen.getByRole('button', { name: '增加数值' }));
    expect(new FormData(form).get('amount')).toBe('9007199254740993.13');
    expect(screen.getByRole('spinbutton')).toHaveValue('9,007,199,254,740,993.13');
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    await waitFor(() => expect(new FormData(form).get('amount')).toBe('9007199254740993.12'));
  });
  it('shows AutoComplete loading, error and grouped rich suggestions', async () => {
    const options = [
      {
        label: 'Teams',
        options: [{ value: 'leaf', label: <strong>Leaf team</strong>, searchLabel: 'Leaf' }],
      },
    ];
    const { rerender } = render(<AutoComplete options={options} defaultOpen loading />);
    expect(await screen.findByText('Teams')).toBeInTheDocument();
    rerender(<AutoComplete options={[]} defaultOpen loading />);
    expect(await screen.findByText('处理中')).toBeInTheDocument();
    rerender(<AutoComplete options={[]} defaultOpen errorContent="Retry connection" />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Retry connection');
  });
  it('applies format, presets, controlled panels and multiple date selection', async () => {
    const change = vi.fn();
    render(<DatePicker multiple format="DD/MM/YYYY" onChange={change} aria-label="Dates" />);
    const input = screen.getByRole('combobox');
    await userEvent.type(input, '05/10/2026, 06/10/2026{Enter}');
    expect(change.mock.lastCall?.[0]).toHaveLength(2);
    expect(change.mock.lastCall?.[1]).toEqual(['05/10/2026', '06/10/2026']);
  });
  it('disables time options and blocks the same values when entered as text', async () => {
    const change = vi.fn();
    render(
      <TimePicker
        defaultValue="09:00"
        disabledTime={(time) => time.hour === 10}
        onChange={change}
      />,
    );
    await userEvent.click(screen.getByRole('combobox'));
    expect(
      within(screen.getByRole('listbox', { name: '小时' })).getByRole('option', { name: '10' }),
    ).toBeDisabled();
    await userEvent.clear(screen.getByRole('combobox'));
    await userEvent.type(screen.getByRole('combobox'), '10:00{Enter}');
    expect(change).not.toHaveBeenCalled();
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
  });
  it('supports open range endpoints through an explicitly allowed preset', async () => {
    const change = vi.fn();
    render(
      <DateRangePicker
        allowEmpty={[false, true]}
        presets={[{ label: 'From October', value: [new Date(2026, 9, 1), null] }]}
        onChange={change}
      />,
    );
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('button', { name: 'From October' }));
    expect(change.mock.lastCall?.[0]).toEqual([new Date(2026, 9, 1), null]);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
  });
  it('starts manual uploads with a concurrency ceiling and cancels on form reset', async () => {
    const ref = createRef<UploadHandle>();
    const requests: {
      name: string;
      signal: AbortSignal;
      resolve: (result: { url: string }) => void;
    }[] = [];
    const { container } = render(
      <form aria-label="Files">
        <Upload
          ref={ref}
          multiple
          autoUpload={false}
          concurrency={1}
          customRequest={({ file, signal }) =>
            new Promise((resolve) => requests.push({ name: file.name, signal, resolve }))
          }
        />
        <button type="reset">Reset files</button>
      </form>,
    );
    await userEvent.upload(container.querySelector('input[type=file]') as HTMLInputElement, [
      new File(['a'], 'a.txt'),
      new File(['b'], 'b.txt'),
    ]);
    await screen.findByText('b.txt');
    expect(requests).toHaveLength(0);
    act(() => ref.current?.upload());
    expect(requests).toHaveLength(1);
    await act(async () => requests[0]?.resolve({ url: '/a.txt' }));
    await waitFor(() => expect(requests).toHaveLength(2));
    await userEvent.click(screen.getByRole('button', { name: 'Reset files' }));
    await waitFor(() => expect(requests[1]?.signal.aborted).toBe(true));
    expect(screen.queryByText('b.txt')).not.toBeInTheDocument();
  });
  it('ignores superseded asynchronous validation and clears errors on reset', async () => {
    const results: ((value: Record<string, string>) => void)[] = [];
    const submit = vi.fn();
    function Example() {
      const validation = useFormValidation({
        validate: () => new Promise((resolve) => results.push(resolve)),
        onSubmit: submit,
      });
      return (
        <Form onSubmit={validation.handleSubmit} onReset={validation.handleReset}>
          <FormField label="Name" error={validation.errors.name}>
            <Input name="name" />
          </FormField>
          <button type="submit">Submit</button>
          <button type="reset">Reset validation</button>
        </Form>
      );
    }
    render(<Example />);
    await userEvent.click(screen.getByText('Submit'));
    await userEvent.click(screen.getByText('Submit'));
    await act(async () => results[0]?.({ name: 'Old error' }));
    expect(screen.queryByText('Old error')).not.toBeInTheDocument();
    await act(async () => results[1]?.({ name: 'Required name' }));
    expect(screen.getByText('Required name')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Reset validation'));
    await waitFor(() => expect(screen.queryByText('Required name')).not.toBeInTheDocument());
    expect(submit).not.toHaveBeenCalled();
  });
});

describe('new content and interaction families', () => {
  it('uses valid list markup when renderItem returns ListItem', () => {
    const { container } = render(
      <List
        items={[{ key: 'a', title: 'Ada' }]}
        itemKey={(item) => item.key}
        renderItem={(item) => <ListItem title={item.title} description="Maintainer" />}
      />,
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(container.querySelector('li li')).toBeNull();
  });
  it('commits an edit once and cancels with Escape', async () => {
    const change = vi.fn();
    render(<Text editable={{ onChange: change }}>Initial</Text>);
    await userEvent.click(screen.getByRole('button', { name: '编辑文本' }));
    await userEvent.clear(screen.getByRole('textbox'));
    await userEvent.type(screen.getByRole('textbox'), 'Edited{Enter}');
    expect(change).toHaveBeenCalledExactlyOnceWith('Edited');
    await userEvent.click(screen.getByRole('button', { name: '编辑文本' }));
    await userEvent.type(screen.getByRole('textbox'), 'Cancelled{Escape}');
    expect(change).toHaveBeenCalledTimes(1);
  });
  it('keeps inactive carousel controls out of the tab order and handles RTL arrows', async () => {
    const ref = createRef<CarouselHandle>();
    render(
      <ConfigProvider direction="rtl">
        <Carousel ref={ref}>
          <button type="button">First</button>
          <button type="button">Second</button>
          <button type="button">Third</button>
        </Carousel>
      </ConfigProvider>,
    );
    act(() => ref.current?.goTo(1));
    expect(screen.getByRole('button', { name: 'Second' }).closest('fieldset')).not.toHaveAttribute(
      'inert',
    );
    expect(
      screen.getByRole('button', { name: 'First', hidden: true }).closest('fieldset'),
    ).toHaveAttribute('inert');
    screen.getByRole('region').focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(screen.getByRole('button', { name: 'Third' })).toBeInTheDocument();
  });
  it('clamps keyboard resizing and restores a collapsed panel', async () => {
    const resize = vi.fn();
    render(
      <Splitter
        defaultSizes={[40, 60]}
        onResize={resize}
        panels={[
          { key: 'left', min: 30, max: 44, collapsible: true, children: 'Left' },
          { key: 'right', children: 'Right' },
        ]}
      />,
    );
    const handle = screen.getByRole('separator');
    handle.focus();
    await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}');
    expect(resize).toHaveBeenLastCalledWith([44, 56]);
    await userEvent.keyboard('{Enter}');
    expect(resize).toHaveBeenLastCalledWith([0, 100]);
    await userEvent.keyboard('{Enter}');
    expect(resize).toHaveBeenLastCalledWith([44, 56]);
  });
  it('inserts mentions at the caret and preserves text that follows it', async () => {
    render(
      <Mentions
        aria-label="Comment"
        defaultValue="Hello @ad suffix"
        options={[{ value: 'ada', label: 'Ada' }]}
      />,
    );
    const input = screen.getByRole('combobox') as HTMLTextAreaElement;
    input.focus();
    input.setSelectionRange(9, 9);
    fireEvent.select(input);
    fireEvent.click(input);
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(input.value).toBe('Hello @ada  suffix');
  });
  it('retains a failing command with an error and prevents duplicate asynchronous actions', async () => {
    let reject: (reason: Error) => void = () => {};
    const select = vi.fn(
      () =>
        new Promise<void>((_resolve, fail) => {
          reject = fail;
        }),
    );
    render(
      <CommandPalette defaultOpen items={[{ key: 'save', label: 'Save', onSelect: select }]} />,
    );
    const option = await screen.findByRole('option', { name: 'Save' });
    fireEvent.click(option);
    fireEvent.click(option);
    expect(select).toHaveBeenCalledTimes(1);
    await act(async () => reject(new Error('Offline')));
    expect(screen.getByRole('alert')).toHaveTextContent('Offline');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
  it('ignores an old command completion after the palette is reopened', async () => {
    let finish = () => {};
    const complete = vi.fn();
    const items = [
      {
        key: 'save',
        label: 'Save',
        onSelect: () =>
          new Promise<void>((resolve) => {
            finish = resolve;
          }),
      },
    ];
    const { rerender } = render(<CommandPalette open items={items} onSelect={complete} />);
    await userEvent.click(await screen.findByRole('option', { name: 'Save' }));
    rerender(<CommandPalette open={false} items={items} onSelect={complete} />);
    rerender(<CommandPalette open items={items} onSelect={complete} />);
    await act(async () => finish());
    expect(complete).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Save' })).toBeEnabled();
  });
  it('moves toolbar focus in RTL while leaving editable fields their arrow keys', async () => {
    render(
      <ConfigProvider direction="rtl">
        <Toolbar aria-label="Actions">
          <button type="button">First action</button>
          <button type="button" disabled>
            Unavailable
          </button>
          <button type="button">Second action</button>
          <Input aria-label="Query" defaultValue="abc" />
        </Toolbar>
      </ConfigProvider>,
    );
    screen.getByRole('button', { name: 'First action' }).focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(screen.getByRole('button', { name: 'Second action' })).toHaveFocus();
    screen.getByRole('textbox', { name: 'Query' }).focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(screen.getByRole('textbox', { name: 'Query' })).toHaveFocus();
  });
  it('finishes a countdown once even under StrictMode and stops its timer', () => {
    vi.useFakeTimers();
    const finish = vi.fn();
    render(
      <StrictMode>
        <Countdown value={Date.now() + 1000} onFinish={finish} />
      </StrictMode>,
    );
    act(() => vi.advanceTimersByTime(4000));
    expect(finish).toHaveBeenCalledTimes(1);
    expect(screen.getByText('00:00:00')).toBeInTheDocument();
    expect(vi.getTimerCount()).toBe(0);
  });
  it('focuses a centered tour and restores focus after Escape', async () => {
    const close = vi.fn();
    const { rerender } = render(
      <>
        <button type="button">Launch</button>
        <Tour open={false} steps={[{ title: 'Welcome', description: 'A tour' }]} onClose={close} />
      </>,
    );
    screen.getByText('Launch').focus();
    rerender(
      <>
        <button type="button">Launch</button>
        <Tour open steps={[{ title: 'Welcome', description: 'A tour' }]} onClose={close} />
      </>,
    );
    const dialog = await screen.findByRole('dialog');
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
    await userEvent.keyboard('{Escape}');
    expect(close).toHaveBeenCalledOnce();
    rerender(
      <>
        <button type="button">Launch</button>
        <Tour open={false} steps={[{ title: 'Welcome' }]} onClose={close} />
      </>,
    );
    expect(screen.getByText('Launch')).toHaveFocus();
  });
  it('provides complete traditional Chinese and alpha-aware contrast ratios', () => {
    render(
      <ConfigProvider locale="zh-TW">
        <Input type="password" />
        <Upload />
      </ConfigProvider>,
    );
    expect(screen.getByRole('button', { name: '顯示密碼' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '選擇檔案' })).toBeInTheDocument();
    expect(colorContrast('#000', '#fff')).toBeCloseTo(21, 2);
    expect(colorContrast('rgba(0,0,0,0)', '#fff')).toBeCloseTo(1, 2);
  });
  it('passes accessible names, relationships and roles for compound fields and content', async () => {
    const { container } = render(
      <main>
        <Form>
          <FormField label="Teams" required>
            <CheckboxGroup
              name="teams"
              options={['Design', 'Engineering']}
              defaultValue={['Design']}
            />
          </FormField>
        </Form>
        <List
          items={['Ada']}
          itemKey={(item) => item}
          renderItem={(item) => <ListItem title={item} />}
        />
      </main>,
    );
    const result = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } });
    expect(
      result.violations.map((violation) => `${violation.id}: ${violation.description}`),
    ).toEqual([]);
  });
});
