import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  CheckboxGroup,
  DatePicker,
  Form,
  FormField,
  Input,
  Select,
  Transfer,
  Tree,
  TreeSelect,
  Upload,
} from './index';

describe('Compound field and remote-data regressions', () => {
  it('Select readOnly blocks clear actions as well as option selection', async () => {
    const change = vi.fn();
    render(
      <Select
        readOnly
        allowClear
        defaultValue="a"
        options={[{ value: 'a', label: 'Alice' }]}
        onChange={change}
        aria-label="person"
      />,
    );
    expect(screen.queryByRole('button', { name: '清除选择' })).toBeNull();
    expect(change).not.toHaveBeenCalled();
  });
  it('Select readOnly blocks multiple tag removal', async () => {
    const change = vi.fn();
    render(
      <Select
        readOnly
        multiple
        defaultValue={['a']}
        options={[{ value: 'a', label: 'Alice' }]}
        onChange={change}
        aria-label="person"
      />,
    );
    expect(screen.queryByRole('button', { name: '移除 Alice' })).toBeNull();
    expect(change).not.toHaveBeenCalled();
  });
  it('TreeSelect readOnly blocks tree selection', async () => {
    const change = vi.fn();
    render(
      <TreeSelect
        readOnly
        options={[{ value: 'a', label: 'Alice' }]}
        onChange={change}
        aria-label="tree"
      />,
    );
    await userEvent.click(screen.getByRole('combobox', { name: 'tree' }));
    expect(screen.queryByRole('tree')).toBeNull();
    expect(change).not.toHaveBeenCalled();
  });
  it('DatePicker readOnly blocks clearing a value', async () => {
    const change = vi.fn();
    render(
      <DatePicker
        readOnly
        defaultValue={new Date(2026, 9, 5)}
        onChange={change}
        aria-label="date"
      />,
    );
    expect(screen.queryByRole('button', { name: '清除日期' })).toBeNull();
    expect(change).not.toHaveBeenCalled();
  });
  it('Form disabled reaches inputs directly inside the form', () => {
    render(
      <Form disabled>
        <Input aria-label="name" />
      </Form>,
    );
    expect(screen.getByRole('textbox', { name: 'name' })).toBeDisabled();
  });
  it('Form disabled reaches Upload inside FormField', () => {
    const { container } = render(
      <Form disabled>
        <FormField label="attachment">
          <Upload />
        </FormField>
      </Form>,
    );
    expect(container.querySelector('input[type="file"]')).toBeDisabled();
  });
  it('Form disabled reaches Transfer actions inside FormField', async () => {
    const change = vi.fn();
    render(
      <Form disabled>
        <FormField label="people">
          <Transfer items={[{ key: 'a', label: 'Alice' }]} selectedKeys={['a']} onChange={change} />
        </FormField>
      </Form>,
    );
    const move = screen.getByRole('button', { name: '移至已选' });
    await userEvent.click(move);
    expect(change).not.toHaveBeenCalled();
  });
  it('Control: empty Transfer in required FormField is invalid', () => {
    const { container } = render(
      <Form>
        <FormField label="people" required>
          <Transfer name="people" items={[{ key: 'a', label: 'Alice' }]} />
        </FormField>
      </Form>,
    );
    expect(container.querySelector('form')?.checkValidity()).toBe(false);
  });
  it('Select keeps the selected label after remote search replaces options', () => {
    const { rerender } = render(
      <Select defaultValue="a" options={[{ value: 'a', label: 'Alice' }]} aria-label="person" />,
    );
    expect(screen.getByRole('combobox', { name: 'person' })).toHaveValue('Alice');
    rerender(
      <Select defaultValue="a" options={[{ value: 'b', label: 'Bob' }]} aria-label="person" />,
    );
    expect(screen.getByRole('combobox', { name: 'person' })).toHaveValue('Alice');
  });
  it('Tree reloads lazy children after changing data source with reused node keys', async () => {
    const first = vi.fn(async () => [{ key: 'old', title: 'Old children' }]);
    const second = vi.fn(async () => [{ key: 'new', title: 'New children' }]);
    const { rerender } = render(
      <Tree
        data={[{ key: 'root', title: 'First source' }]}
        defaultExpandedKeys={['root']}
        loadData={first}
      />,
    );
    await screen.findByRole('treeitem', { name: 'Old children' });
    rerender(
      <Tree
        data={[{ key: 'root', title: 'Second source' }]}
        defaultExpandedKeys={['root']}
        loadData={second}
      />,
    );
    await waitFor(() => expect(second).toHaveBeenCalled(), { timeout: 500 });
    expect(screen.queryByRole('treeitem', { name: 'Old children' })).toBeNull();
  });
  it('FormField required CheckboxGroup accepts one selected option', () => {
    const { container } = render(
      <Form>
        <FormField label="choices" required>
          <CheckboxGroup name="choices" options={['Alice', 'Bob']} defaultValue={['Alice']} />
        </FormField>
      </Form>,
    );
    expect(container.querySelector('form')?.checkValidity()).toBe(true);
  });
  it('CheckboxGroup uses unique ids under FormField', () => {
    const { container } = render(
      <Form>
        <FormField label="choices">
          <CheckboxGroup options={['Alice', 'Bob']} />
        </FormField>
      </Form>,
    );
    const ids = Array.from(container.querySelectorAll('input[type="checkbox"]'))
      .map((n) => n.id)
      .filter(Boolean);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('FormField required Transfer accepts a nonempty target value', () => {
    const { container } = render(
      <Form>
        <FormField label="people" required>
          <Transfer
            name="people"
            items={[
              { key: 'a', label: 'Alice' },
              { key: 'b', label: 'Bob' },
            ]}
            defaultValue={['a']}
          />
        </FormField>
      </Form>,
    );
    expect(container.querySelector('form')?.checkValidity()).toBe(true);
  });
  it('Control: Input inside disabled FormField is disabled', () => {
    render(
      <Form disabled>
        <FormField label="name">
          <Input />
        </FormField>
      </Form>,
    );
    expect(screen.getByRole('textbox', { name: 'name' })).toBeDisabled();
  });
});
