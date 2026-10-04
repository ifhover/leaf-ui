import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CheckboxGroup,
  ConfigProvider,
  DatePicker,
  Form,
  FormErrorSummary,
  FormField,
  FormList,
  Input,
  InputMask,
  InputOTP,
  InputSearch,
  Menu,
  Segmented,
  Select,
  Tabs,
  Textarea,
  Transfer,
  Tree,
  type TreeNode,
} from './index';
import { moveTreeNode } from './tree/move';

afterEach(() => vi.restoreAllMocks());
describe('Extended inputs and form integration', () => {
  it('pastes formatted OTP text, completes once, and completes again after a native reset', async () => {
    const done = vi.fn();
    const { container } = render(
      <form>
        <InputOTP aria-label="Code" name="code" onComplete={done} />
        <button type="reset">Reset</button>
      </form>,
    );
    const input = screen.getByRole('textbox');
    await userEvent.click(input);
    await userEvent.paste('12-34 56');
    expect(input).toHaveValue('123456');
    expect(done).toHaveBeenCalledExactlyOnceWith('123456');
    expect(new FormData(container.querySelector('form') as HTMLFormElement).get('code')).toBe(
      '123456',
    );
    await userEvent.click(screen.getByText('Reset'));
    await waitFor(() => expect(input).toHaveValue(''));
    await userEvent.click(input);
    await userEvent.paste('123456');
    expect(done).toHaveBeenCalledTimes(2);
  });
  it('does not change read-only OTP when pasted into', async () => {
    const change = vi.fn();
    render(<InputOTP readOnly defaultValue="12" onChange={change} />);
    await userEvent.click(screen.getByRole('textbox'));
    await userEvent.paste('999999');
    expect(screen.getByRole('textbox')).toHaveValue('12');
    expect(change).not.toHaveBeenCalled();
  });
  it('formats mask typing, reports raw values, clears and resets to the initial raw value', async () => {
    const change = vi.fn();
    const { container } = render(
      <form>
        <InputMask
          aria-label="Phone"
          mask="000-000"
          unmask
          name="phone"
          defaultValue="123"
          allowClear
          onChange={change}
        />
        <button type="reset">Reset</button>
      </form>,
    );
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('123');
    await userEvent.type(input, '456');
    expect(input).toHaveValue('123-456');
    expect(change).toHaveBeenLastCalledWith('123456', '123-456');
    expect(new FormData(container.querySelector('form') as HTMLFormElement).get('phone')).toBe(
      '123-456',
    );
    await userEvent.click(screen.getByRole('button', { name: '清除输入' }));
    expect(input).toHaveValue('');
    await userEvent.click(screen.getByText('Reset'));
    await waitFor(() => expect(input).toHaveValue('123'));
  });
  it('synchronizes a controlled mask without firing user change callbacks', () => {
    const change = vi.fn();
    const { rerender } = render(
      <InputMask mask="000-000" unmask value="123456" onChange={change} />,
    );
    expect(screen.getByRole('textbox')).toHaveValue('123-456');
    rerender(<InputMask mask="000-000" unmask value="654321" onChange={change} />);
    expect(screen.getByRole('textbox')).toHaveValue('654-321');
    expect(change).not.toHaveBeenCalled();
  });
  it('restores a controlled mask value when the parent declines an edit', async () => {
    const change = vi.fn();
    render(<InputMask mask="0000" unmask value="12" onChange={change} />);
    await userEvent.type(screen.getByRole('textbox'), '3');
    expect(change).toHaveBeenLastCalledWith('123', '123');
    expect(screen.getByRole('textbox')).toHaveValue('12');
  });
  it('skips disabled segmented options by keyboard and submits the selected value', async () => {
    const { container } = render(
      <form>
        <Segmented
          name="view"
          options={['Daily', { value: 'weekly', label: 'Weekly', disabled: true }, 'Monthly']}
        />
      </form>,
    );
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Monthly' })).toHaveFocus();
    expect(new FormData(container.querySelector('form') as HTMLFormElement).get('view')).toBe(
      'Monthly',
    );
    fireEvent.reset(container.querySelector('form') as HTMLFormElement);
    await waitFor(() =>
      expect(screen.getByRole('radio', { name: 'Daily' })).toHaveAttribute('aria-checked', 'true'),
    );
  });
  it('enforces CheckboxGroup limits while retaining checked values in native submission', async () => {
    const { container } = render(
      <form>
        <CheckboxGroup
          name="choice"
          options={['A', 'B', 'C']}
          defaultValue={['A']}
          minCount={1}
          maxCount={2}
        />
      </form>,
    );
    await userEvent.click(screen.getByRole('checkbox', { name: 'A' }));
    expect(screen.getByRole('checkbox', { name: 'A' })).toBeChecked();
    await userEvent.click(screen.getByRole('checkbox', { name: 'B' }));
    await userEvent.click(screen.getByRole('checkbox', { name: 'C' }));
    expect(screen.getByRole('checkbox', { name: 'C' })).not.toBeChecked();
    expect(
      new FormData(container.querySelector('form') as HTMLFormElement).getAll('choice'),
    ).toEqual(['A', 'B']);
  });
  it('searches once with Enter and respects a prevented Enter event', async () => {
    const search = vi.fn();
    const { rerender } = render(<InputSearch aria-label="Search" onSearch={search} />);
    await userEvent.type(screen.getByRole('textbox'), 'leaf{Enter}');
    expect(search).toHaveBeenCalledExactlyOnceWith('leaf');
    rerender(<InputSearch onSearch={search} onPressEnter={(event) => event.preventDefault()} />);
    await userEvent.keyboard('{Enter}');
    expect(search).toHaveBeenCalledTimes(1);
  });
  it('creates a new grouped Select option and can select it again after clearing', async () => {
    const create = vi.fn(),
      change = vi.fn();
    render(
      <Select
        showSearch
        allowCreate
        allowClear
        options={[{ label: 'Team', options: [{ value: 'a', label: 'Alpha' }] }]}
        onCreate={create}
        onChange={change}
      />,
    );
    await userEvent.type(screen.getByRole('combobox'), 'Beta');
    await userEvent.keyboard('{Enter}');
    expect(create).toHaveBeenCalledExactlyOnceWith({ value: 'Beta', label: 'Beta' });
    expect(change).toHaveBeenLastCalledWith('Beta', { value: 'Beta', label: 'Beta' });
    await userEvent.click(screen.getByRole('button', { name: '清除选择' }));
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('option', { name: 'Beta' })).toBeInTheDocument();
    expect(create).toHaveBeenCalledOnce();
  });
  it('commits quarter input and rejects an invalid quarter', async () => {
    const change = vi.fn();
    render(<DatePicker picker="quarter" onChange={change} />);
    const input = screen.getByRole('combobox');
    await userEvent.type(input, '2026-Q2{Enter}');
    expect(change).toHaveBeenLastCalledWith(new Date(2026, 3, 1), '2026-Q2');
    await userEvent.clear(input);
    await userEvent.type(input, '2026-Q5{Enter}');
    expect(change).toHaveBeenCalledOnce();
  });
  it('counts textarea characters and restores the count after reset', async () => {
    const { container } = render(
      <form>
        <Textarea showCount maxLength={10} defaultValue="abc" />
      </form>,
    );
    expect(screen.getByText('3 / 10')).toBeInTheDocument();
    await userEvent.type(screen.getByRole('textbox'), 'de');
    expect(screen.getByText('5 / 10')).toBeInTheDocument();
    fireEvent.reset(container.querySelector('form') as HTMLFormElement);
    await waitFor(() => expect(screen.getByText('3 / 10')).toBeInTheDocument());
  });
  it('moves only enabled Transfer items and resets its submitted value', async () => {
    const { container } = render(
      <ConfigProvider locale="en-US">
        <form>
          <Transfer
            name="people"
            items={[
              { key: 'a', label: 'Ada' },
              { key: 'b', label: 'Ben', disabled: true },
            ]}
          />
        </form>
      </ConfigProvider>,
    );
    await userEvent.click(
      screen.getAllByRole('checkbox', { name: 'Select all visible items' })[0] as HTMLElement,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Move to selected' }));
    expect(
      within(screen.getByRole('region', { name: /Selected/ })).getByText('Ada'),
    ).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Ben' })).toBeDisabled();
    expect(new FormData(container.querySelector('form') as HTMLFormElement).get('people')).toBe(
      '["a"]',
    );
    fireEvent.reset(container.querySelector('form') as HTMLFormElement);
    await waitFor(() =>
      expect(new FormData(container.querySelector('form') as HTMLFormElement).get('people')).toBe(
        '',
      ),
    );
  });
  it('preserves field DOM and values when FormList moves rows, and resets the list', async () => {
    function Demo() {
      return (
        <Form>
          <FormList name="contacts" defaultValue={['Ada', 'Ben']}>
            {(fields, ops) => (
              <>
                {fields.map((field) => (
                  <Input
                    key={field.key}
                    aria-label={field.key}
                    name={field.name}
                    value={field.value}
                    onChange={(e) => ops.update(field.index, e.target.value)}
                  />
                ))}
                <button type="button" onClick={() => ops.move(0, 1)}>
                  Move
                </button>
                <button type="button" onClick={() => ops.add('Cara')}>
                  Add
                </button>
                <button type="reset">Reset</button>
              </>
            )}
          </FormList>
        </Form>
      );
    }
    render(<Demo />);
    const original = screen.getAllByRole('textbox')[0];
    await userEvent.click(screen.getByText('Move'));
    expect(screen.getAllByRole('textbox')[1]).toBe(original);
    await userEvent.click(screen.getByText('Add'));
    expect(screen.getAllByRole('textbox')).toHaveLength(3);
    await userEvent.click(screen.getByText('Reset'));
    await waitFor(() => expect(screen.getAllByRole('textbox')).toHaveLength(2));
    expect(screen.getAllByRole('textbox')[0]).toHaveValue('Ada');
  });
  it('collects field errors and focuses the linked control from the summary', async () => {
    render(
      <Form>
        <FormErrorSummary />
        <FormField label="Email" error="Invalid address">
          <Input />
        </FormField>
      </Form>,
    );
    const summary = screen.getAllByRole('alert').find((node) => node.querySelector('button'));
    expect(summary).toBeDefined();
    await userEvent.click(within(summary as HTMLElement).getByRole('button'));
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveFocus();
  });
  it('adds Tabs without selecting or removing the current tab', async () => {
    function Demo() {
      const [items, setItems] = useState([{ key: 'a', label: 'A', children: 'Content A' }]);
      return (
        <Tabs
          items={items}
          onAdd={() => setItems([...items, { key: 'b', label: 'B', children: 'Content B' }])}
        />
      );
    }
    render(
      <ConfigProvider locale="en-US">
        <Demo />
      </ConfigProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Add tab' }));
    expect(screen.getAllByRole('tab')).toHaveLength(2);
    expect(screen.getByRole('tab', { name: 'A' })).toHaveAttribute('aria-selected', 'true');
  });
  it('uses left/right keys for inline Menu hierarchy navigation', async () => {
    render(
      <Menu
        mode="inline"
        items={[
          { key: 'parent', label: 'Projects', children: [{ key: 'child', label: 'Design' }] },
          { key: 'other', label: 'Settings' },
        ]}
      />,
    );
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('menuitem', { name: 'Projects' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Design' })).toHaveFocus());
    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Projects' })).toHaveFocus());
    await userEvent.keyboard('{ArrowLeft}');
    expect(screen.queryByRole('menuitem', { name: 'Design' })).toBeNull();
  });
  it('loads initially expanded Tree children without duplicating requests', async () => {
    const load = vi.fn(async (_node: TreeNode, _signal: AbortSignal) => [
      { key: 'child', title: 'Loaded child' },
    ]);
    render(
      <Tree
        data={[{ key: 'root', title: 'Root', isLeaf: false }]}
        defaultExpandedKeys={['root']}
        loadData={load}
      />,
    );
    expect(await screen.findByText('Loaded child')).toBeInTheDocument();
    expect(load).toHaveBeenCalledOnce();
  });
  it('rejects tree cycles and returns immutable reordered data', () => {
    const data = [
      { key: 'a', title: 'A', children: [{ key: 'b', title: 'B' }] },
      { key: 'c', title: 'C' },
    ];
    expect(moveTreeNode(data, 'a', 'b', 'inside')).toBeNull();
    const moved = moveTreeNode(data, 'b', 'c', 'inside');
    expect(moved?.[1]?.children?.[0]?.key).toBe('b');
    expect(data[0]?.children).toHaveLength(1);
  });
});
