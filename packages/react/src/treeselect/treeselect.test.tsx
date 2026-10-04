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
    expect(input).toHaveValue('');
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
});
