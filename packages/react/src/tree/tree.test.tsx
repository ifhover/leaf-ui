import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConfigProvider, Tree, type TreeNode } from '../index';

afterEach(() => {
  vi.restoreAllMocks();
});

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
  it('keeps focus on the drag handle and moves a node before a keyboard-selected target', async () => {
    const keys = ['team', 'design', 'code', 'locked', 'archive', 'past'];
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      const key = this.closest('[data-node-key]')?.getAttribute('data-node-key');
      const top = key
        ? Math.max(0, keys.indexOf(key)) * 40
        : Number.parseFloat(this.style.top) || 0;
      return new DOMRect(0, top, 300, 40);
    });
    const drop = vi.fn();
    const select = vi.fn();
    render(
      <ConfigProvider locale="en-US">
        <Tree data={data} defaultExpandAll draggable onDrop={drop} onSelect={select} />
      </ConfigProvider>,
    );
    const handle = screen.getByRole('button', { name: 'Move node Code' });
    handle.focus();
    await userEvent.keyboard('[Space]');
    await waitFor(() => expect(handle).toHaveAttribute('aria-pressed', 'true'));
    await userEvent.keyboard('[ArrowDown]');
    const target = screen
      .getByRole('treeitem', { name: 'Archive' })
      .querySelector('.leaf-tree__drag-row');
    await waitFor(() => expect(target).toHaveAttribute('data-drop', 'inside'));
    expect(handle).toHaveFocus();
    await userEvent.keyboard('[ArrowLeft]');
    await waitFor(() => expect(target).toHaveAttribute('data-drop', 'before'));
    await userEvent.keyboard('[Space]');
    expect(drop).toHaveBeenCalledOnce();
    expect(drop.mock.lastCall?.[0]).toMatchObject({
      node: { key: 'code' },
      target: { key: 'archive' },
      position: 'before',
    });
    expect(drop.mock.lastCall?.[0].data.map((node: TreeNode) => node.key)).toEqual([
      'team',
      'code',
      'archive',
    ]);
    expect(data[0]?.children?.map((node) => node.key)).toEqual(['design', 'code', 'locked']);
    expect(select).not.toHaveBeenCalled();
  });

  it('renders vertical dashed indent lines for nested rows in virtual showLine mode', () => {
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(240);
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(240);
    vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(240);
    const deepData: readonly TreeNode[] = [
      {
        key: 'root',
        title: 'Root',
        children: [
          {
            key: 'branch',
            title: 'Branch',
            children: [{ key: 'leaf', title: 'Leaf' }],
          },
        ],
      },
    ];
    const { container } = render(
      <Tree data={deepData} defaultExpandAll showLine virtual height={240} itemHeight={32} />,
    );
    const rootLines = screen
      .getByRole('treeitem', { name: 'Root' })
      .querySelectorAll('.leaf-tree__indent-line');
    const branchLines = screen
      .getByRole('treeitem', { name: 'Branch' })
      .querySelectorAll('.leaf-tree__indent-line');
    const leafLines = screen
      .getByRole('treeitem', { name: 'Leaf' })
      .querySelectorAll<HTMLElement>('.leaf-tree__indent-line');
    expect(container.querySelector('.leaf-tree')).toHaveClass('leaf-tree--lines');
    expect(rootLines).toHaveLength(0);
    expect(branchLines).toHaveLength(1);
    expect(leafLines).toHaveLength(2);
    expect(leafLines[0]?.style.getPropertyValue('--leaf-tree-line-left')).toBe('14px');
    expect(leafLines[1]?.style.getPropertyValue('--leaf-tree-line-left')).toBe('34px');
  });
});
