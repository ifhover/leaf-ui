import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConfigProvider, TreeSelect, type TreeSelectOption } from '../index';

const options: readonly TreeSelectOption[] = [
  {
    value: 'team',
    label: 'Team',
    selectable: false,
    children: [
      { value: 'design', label: 'Design' },
      { value: 'code', label: 'Code' },
      { value: 'locked', label: 'Locked', disabled: true },
    ],
  },
];
describe('TreeSelect', () => {
  it('searches, selects a value and restores focus without a native popup', async () => {
    const change = vi.fn();
    render(
      <ConfigProvider locale="en-US">
        <TreeSelect options={options} onChange={change} aria-label="Team picker" />
      </ConfigProvider>,
    );
    const input = screen.getByRole('combobox', { name: 'Team picker' });
    await userEvent.type(input, 'Code');
    expect(screen.queryByRole('treeitem', { name: 'Design' })).toBeNull();
    await userEvent.click(screen.getByText('Code'));
    expect(change).toHaveBeenLastCalledWith('code');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).toHaveFocus();
    expect(input).toHaveValue('Code');
    await userEvent.click(input);
    expect(input).toHaveValue('Code');
    await userEvent.type(input, 'Design');
    await userEvent.click(screen.getByText('Design'));
    expect(input).toHaveValue('Design');
    expect(change).toHaveBeenLastCalledWith('design');
  });
  it('submits checked leaves as repeated values and responds to form reset', async () => {
    const { container } = render(
      <ConfigProvider locale="en-US">
        <form>
          <TreeSelect options={options} treeCheckable name="teams" defaultExpandAll />
        </form>
      </ConfigProvider>,
    );
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('checkbox', { name: 'Team' }));
    const form = container.querySelector('form') as HTMLFormElement;
    expect(new FormData(form).getAll('teams')).toEqual(['design', 'code']);
    fireEvent.reset(form);
    await waitFor(() => expect(new FormData(form).getAll('teams')).toEqual(['']));
  });
  it('keeps disabled selected values on clear and cannot open when disabled', async () => {
    const change = vi.fn();
    const { rerender } = render(
      <ConfigProvider locale="en-US">
        <TreeSelect
          options={options}
          multiple
          defaultValue={['design', 'locked']}
          onChange={change}
        />
      </ConfigProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Clear selection' }));
    expect(change).toHaveBeenLastCalledWith(['locked']);
    rerender(<TreeSelect options={options} disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
  });

  it('remembers expansion after selection and after closing the popup', async () => {
    const expand = vi.fn();
    render(
      <ConfigProvider locale="en-US">
        <TreeSelect options={options} onExpand={expand} />
      </ConfigProvider>,
    );
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    await userEvent.click(screen.getByText('Team'));
    expect(expand).toHaveBeenLastCalledWith(['team']);
    await userEvent.click(screen.getByText('Design'));
    await waitFor(() => expect(screen.queryByRole('tree')).toBeNull());
    await userEvent.click(input);
    expect(screen.getByRole('treeitem', { name: 'Team' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Code')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Collapse Team' }));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('tree')).toBeNull());
    await userEvent.click(input);
    expect(screen.getByRole('treeitem', { name: 'Team' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    await userEvent.type(input, 'Code');
    expect(screen.getByText('Code')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('tree')).toBeNull());
    await userEvent.click(input);
    expect(screen.getByRole('treeitem', { name: 'Team' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('keeps loaded branches expanded without requesting them again on reopen', async () => {
    const lazyOptions = [{ value: 'remote', label: 'Remote', isLeaf: false }];
    const load = vi
      .fn()
      .mockResolvedValue([{ value: 'child', label: 'Loaded child', isLeaf: true }]);
    render(
      <ConfigProvider locale="en-US">
        <TreeSelect options={lazyOptions} loadData={load} />
      </ConfigProvider>,
    );
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    await userEvent.click(screen.getByRole('button', { name: 'Expand Remote' }));
    expect(await screen.findByText('Loaded child')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('tree')).toBeNull());
    await userEvent.click(input);
    expect(screen.getByRole('treeitem', { name: 'Remote' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(await screen.findByText('Loaded child')).toBeVisible();
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('keeps controlled expansion authoritative and supports checking whole rows with Enter', async () => {
    const change = vi.fn();
    const expand = vi.fn();
    const { rerender, container } = render(
      <ConfigProvider locale="en-US">
        <TreeSelect
          options={options}
          treeCheckable
          treeExpandedKeys={[]}
          onExpand={expand}
          onChange={change}
        />
      </ConfigProvider>,
    );
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('button', { name: 'Expand Team' }));
    expect(expand).toHaveBeenLastCalledWith(['team']);
    expect(screen.getByRole('treeitem', { name: 'Team' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    rerender(
      <ConfigProvider locale="en-US">
        <TreeSelect options={options} treeCheckable treeExpandedKeys={['team']} onChange={change} />
      </ConfigProvider>,
    );
    await userEvent.click(screen.getByText('Code'));
    expect(change).toHaveBeenLastCalledWith(['code']);
    await userEvent.keyboard('{Enter}');
    expect(change).toHaveBeenLastCalledWith([]);
    await userEvent.click(screen.getByText('Locked'));
    expect(change).toHaveBeenCalledTimes(2);
    await userEvent.click(screen.getByText('Design'));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('tree')).toBeNull());
    await userEvent.click(screen.getByRole('button', { name: 'Remove Design' }));
    expect(screen.getByRole('combobox')).toHaveFocus();
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
    // Padding belongs to the trigger, not only the text input.
    await userEvent.click(container.querySelector('.leaf-tree-select') as HTMLElement);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
  });
});
