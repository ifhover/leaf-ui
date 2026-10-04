import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConfigProvider, Tree, type TreeNode } from '../index';

const data: readonly TreeNode[] = [
  {
    key: 'team',
    title: 'Team',
    children: [
      { key: 'design', title: 'Design' },
      { key: 'code', title: 'Code' },
      { key: 'locked', title: 'Locked', disabled: true },
    ],
  },
  { key: 'archive', title: 'Archive', children: [{ key: 'past', title: 'Past' }] },
];
describe('Tree', () => {
  it('conducts checks through enabled children and recomputes a mixed parent after unchecking', async () => {
    const change = vi.fn();
    render(<Tree data={data} checkable defaultExpandAll onCheck={change} />);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Team' }));
    expect(change.mock.lastCall?.[0]).toEqual(['team', 'design', 'code']);
    expect(screen.getByRole('checkbox', { name: 'Locked' })).not.toBeChecked();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Design' }));
    expect(change.mock.lastCall?.[0]).toEqual(['code']);
    expect(screen.getByRole('treeitem', { name: 'Team' })).toHaveAttribute('aria-checked', 'mixed');
    expect(change.mock.lastCall?.[1].halfCheckedKeys).toEqual(['team']);
  });
  it('keeps strict checks independent and honors controlled keys', async () => {
    const change = vi.fn();
    render(
      <Tree
        data={data}
        checkable
        checkStrictly
        checkedKeys={[]}
        defaultExpandAll
        onCheck={change}
      />,
    );
    await userEvent.click(screen.getByRole('checkbox', { name: 'Team' }));
    expect(change.mock.lastCall?.[0]).toEqual(['team']);
    expect(screen.getByRole('checkbox', { name: 'Team' })).not.toBeChecked();
  });
  it('navigates and selects with the keyboard, then reveals only search matches and their parents', () => {
    const change = vi.fn();
    const { rerender } = render(
      <ConfigProvider locale="en-US">
        <Tree data={data} onSelect={change} />
      </ConfigProvider>,
    );
    const team = screen.getByRole('treeitem', { name: 'Team' });
    team.focus();
    fireEvent.keyDown(team, { key: 'ArrowRight' });
    fireEvent.keyDown(team, { key: 'ArrowRight' });
    expect(screen.getByRole('treeitem', { name: 'Design' })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole('treeitem', { name: 'Design' }), { key: 'Enter' });
    expect(change.mock.lastCall?.[0]).toEqual(['design']);
    rerender(<Tree data={data} searchValue="Code" />);
    expect(screen.getByRole('treeitem', { name: 'Code' })).toBeInTheDocument();
    expect(within(screen.getByRole('tree')).queryByText('Design')).toBeNull();
    expect(screen.queryByText('Archive')).toBeNull();
  });
});
