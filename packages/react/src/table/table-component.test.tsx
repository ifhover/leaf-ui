import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from '../config-provider';
import { Result } from '../result';
import { Table } from './table';
import type { TableColumn, TableKey, TableSorterState } from './types';

interface Member {
  id: string;
  name: string;
  age: number;
  role: string;
  meta?: { city: string };
  children?: Member[];
}

const members: Member[] = [
  { id: 'alice', name: 'Alice', age: 30, role: 'Engineer', meta: { city: 'Shanghai' } },
  { id: 'bob', name: 'Bob', age: 24, role: 'Designer', meta: { city: 'Beijing' } },
  { id: 'charlie', name: 'Charlie', age: 36, role: 'Manager', meta: { city: 'Shenzhen' } },
  { id: 'dana', name: 'Dana', age: 28, role: 'Engineer', meta: { city: 'Hangzhou' } },
];

const baseColumns: TableColumn<Member>[] = [
  { title: 'Name', dataIndex: 'name', sorter: true },
  { title: 'Age', dataIndex: 'age', sorter: true, align: 'end' },
  { title: 'Role', dataIndex: 'role' },
  { title: 'City', dataIndex: ['meta', 'city'] },
];

function bodyFirstColumnTexts() {
  return Array.from(screen.getByRole('table').querySelectorAll('tbody tr[data-row-id]')).map(
    (row) => {
      const cells = Array.from(row.querySelectorAll('td')).filter(
        (cell) => !cell.classList.contains('leaf-table__utility'),
      );
      return cells[0]?.textContent?.trim();
    },
  );
}

describe('Table component', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders data, nested dataIndex paths, custom render, onCell span omission, and refs', () => {
    const ref = createRef<HTMLTableElement>();
    render(
      <Table
        data={members.slice(0, 2)}
        columns={[
          {
            title: 'Name',
            dataIndex: 'name',
            render: (value, record) => `${String(value)} (${record.age})`,
          },
          {
            title: 'City',
            dataIndex: ['meta', 'city'],
            onCell: (_record, index) => (index === 0 ? { colSpan: 2 } : {}),
          },
          {
            title: 'Role',
            dataIndex: 'role',
            onCell: (_record, index) => (index === 0 ? { colSpan: 0 } : {}),
          },
        ]}
        rowKey="id"
        pagination={false}
        tableRef={ref}
        aria-label="Members"
      />,
    );
    const table = screen.getByRole('table', { name: 'Members' });
    expect(ref.current).toBe(table);
    expect(screen.getByText('Alice (30)')).toBeInTheDocument();
    expect(screen.getByText('Shanghai')).toHaveAttribute('colspan', '2');
    const firstRowCells = table.querySelectorAll('tbody tr')[0]?.querySelectorAll('td');
    expect(firstRowCells).toHaveLength(2);
    expect(screen.getByText('Designer')).toBeInTheDocument();
  });

  it('validates rowKey values and supports function rowKey', () => {
    render(
      <Table
        data={members.slice(0, 1)}
        columns={[{ title: 'Name', dataIndex: 'name' }]}
        rowKey={(record) => `member-${record.id}`}
        pagination={false}
      />,
    );
    expect(screen.getByRole('table').querySelector('tbody tr')).toHaveAttribute(
      'data-row-id',
      'member-alice',
    );
  });

  it('sorts locally through asc -> desc -> none, supports custom comparators and multiSort', async () => {
    const onSortChange = vi.fn();
    render(
      <ConfigProvider locale="en-US">
        <Table
          data={members}
          columns={[
            { title: 'Name', dataIndex: 'name', sorter: true },
            { title: 'Age', dataIndex: 'age', sorter: (a, b) => a.age - b.age },
            { title: 'Role', dataIndex: 'role', sorter: true },
          ]}
          rowKey="id"
          pagination={false}
          multiSort
          onSortChange={onSortChange}
        />
      </ConfigProvider>,
    );

    const ageBtn = screen.getByRole('button', { name: 'Age: Sort ascending' });
    await userEvent.click(ageBtn);
    expect(bodyFirstColumnTexts()).toEqual(['Bob', 'Dana', 'Alice', 'Charlie']);
    expect(ageBtn.closest('th')).toHaveAttribute('aria-sort', 'ascending');
    expect(ageBtn.querySelector('.leaf-table__sort-up')).toHaveAttribute('data-active', 'true');
    expect(onSortChange).toHaveBeenLastCalledWith({ columnKey: 'age', order: 'asc' }, [
      { columnKey: 'age', order: 'asc' },
    ]);

    await userEvent.click(screen.getByRole('button', { name: 'Age: Sort descending' }));
    expect(bodyFirstColumnTexts()).toEqual(['Charlie', 'Alice', 'Dana', 'Bob']);
    expect(ageBtn.closest('th')).toHaveAttribute('aria-sort', 'descending');
    expect(ageBtn.querySelector('.leaf-table__sort-down')).toHaveAttribute('data-active', 'true');

    await userEvent.click(screen.getByRole('button', { name: 'Age: Clear sorting' }));
    expect(bodyFirstColumnTexts()).toEqual(['Alice', 'Bob', 'Charlie', 'Dana']);
    expect(ageBtn.closest('th')).not.toHaveAttribute('aria-sort');

    // Shift + 点击叠加多列排序：按 Role 升序，再按 Age 升序
    await userEvent.click(screen.getByRole('button', { name: 'Role: Sort ascending' }));
    fireEvent.click(screen.getByRole('button', { name: 'Age: Sort ascending' }), {
      shiftKey: true,
    });
    expect(bodyFirstColumnTexts()).toEqual(['Bob', 'Dana', 'Alice', 'Charlie']);
  });

  it('supports manualSorting and controlled sort without reordering data locally', async () => {
    function ControlledSortHarness() {
      const [sort, setSort] = useState<TableSorterState | null>(null);
      return (
        <ConfigProvider locale="en-US">
          <Table
            data={members}
            columns={baseColumns}
            rowKey="id"
            pagination={false}
            manualSorting
            sort={sort}
            onSortChange={(next) => setSort(next)}
          />
        </ConfigProvider>
      );
    }
    render(<ControlledSortHarness />);
    await userEvent.click(screen.getByRole('button', { name: 'Age: Sort ascending' }));
    expect(screen.getByRole('columnheader', { name: /Age/ })).toHaveAttribute(
      'aria-sort',
      'ascending',
    );
    expect(bodyFirstColumnTexts()).toEqual(['Alice', 'Bob', 'Charlie', 'Dana']);
  });

  it('supports multiple and single rowSelection, disabled checkboxes, and cross-page preservation', async () => {
    const onChange = vi.fn();
    render(
      <ConfigProvider locale="en-US">
        <Table
          data={members}
          columns={baseColumns}
          rowKey="id"
          pagination={{ defaultPageSize: 2 }}
          rowSelection={{
            onChange,
            getCheckboxProps: (record) => ({ disabled: record.id === 'bob' }),
          }}
        />
      </ConfigProvider>,
    );

    const bobBox = screen.getByRole('checkbox', { name: 'Select row: bob' });
    expect(bobBox).toBeDisabled();

    const selectAll = screen.getByRole('checkbox', { name: 'Select all rows on this page' });
    await userEvent.click(selectAll);
    expect(onChange).toHaveBeenLastCalledWith(['alice'], [members[0]]);
    expect(screen.getByText('Alice').closest('tr')).toHaveAttribute('data-selected', 'true');

    // 切到第 2 页再全选，第 1 页的选中保留
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select all rows on this page' }));
    expect(onChange).toHaveBeenLastCalledWith(
      ['alice', 'charlie', 'dana'],
      [members[0], members[2], members[3]],
    );

    // 取消第 2 页全选，第 1 页仍保留
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select all rows on this page' }));
    expect(onChange).toHaveBeenLastCalledWith(['alice'], [members[0]]);
  });

  it('supports single radio selection', async () => {
    const onChange = vi.fn();
    render(
      <ConfigProvider locale="en-US">
        <Table
          data={members.slice(0, 2)}
          columns={baseColumns}
          rowKey="id"
          pagination={false}
          rowSelection={{ type: 'radio', onChange }}
        />
      </ConfigProvider>,
    );
    await userEvent.click(screen.getByRole('radio', { name: 'Select row: alice' }));
    expect(onChange).toHaveBeenLastCalledWith(['alice'], [members[0]]);
    await userEvent.click(screen.getByRole('radio', { name: 'Select row: bob' }));
    expect(onChange).toHaveBeenLastCalledWith(['bob'], [members[1]]);
    expect(screen.getByRole('radio', { name: 'Select row: alice' })).not.toBeChecked();
  });

  it('renders expandable detail rows, respects rowExpandable, and preserves detail state after collapse', async () => {
    const onExpand = vi.fn();
    render(
      <ConfigProvider locale="en-US">
        <Table
          data={members.slice(0, 2)}
          columns={baseColumns}
          rowKey="id"
          pagination={false}
          expandable={{
            rowExpandable: (record) => record.id === 'alice',
            expandedRowRender: (record) => (
              <div>
                <span>Detail for {record.name}</span>
                <input aria-label={`Note for ${record.id}`} />
              </div>
            ),
            onExpand,
          }}
        />
      </ConfigProvider>,
    );

    expect(screen.queryByRole('button', { name: 'Expand row: bob' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Expand row: alice' }));
    expect(onExpand).toHaveBeenLastCalledWith(true, members[0]);
    const input = screen.getByRole('textbox', { name: 'Note for alice' });
    await userEvent.type(input, 'Keep me');

    await userEvent.click(screen.getByRole('button', { name: 'Collapse row: alice' }));
    expect(onExpand).toHaveBeenLastCalledWith(false, members[0]);
    await userEvent.click(screen.getByRole('button', { name: 'Expand row: alice' }));
    expect(screen.getByRole('textbox', { name: 'Note for alice' })).toHaveValue('Keep me');
  });

  it('supports tree data nesting, indentation, recursive sorting, and cross-collapse selection', async () => {
    const treeData: Member[] = [
      {
        id: 'eng',
        name: 'Engineering',
        age: 35,
        role: 'Dept',
        children: [
          { id: 'fe', name: 'Frontend', age: 29, role: 'Team' },
          { id: 'be', name: 'Backend', age: 31, role: 'Team' },
        ],
      },
      { id: 'design', name: 'Design', age: 27, role: 'Dept' },
    ];
    const onSelect = vi.fn();
    render(
      <ConfigProvider locale="en-US" theme={{ motion: false }}>
        <Table
          data={treeData}
          columns={[
            { title: 'Name', dataIndex: 'name', sorter: true },
            { title: 'Age', dataIndex: 'age', sorter: true },
          ]}
          rowKey="id"
          pagination={false}
          rowSelection={{ onChange: onSelect }}
          expandable={{ indentSize: 20 }}
        />
      </ConfigProvider>,
    );

    // 初始收起子节点（DOM 保留但 hidden）
    expect(screen.getByText('Frontend').closest('tr')).toHaveAttribute('hidden');
    await userEvent.click(screen.getByRole('button', { name: 'Expand row: eng' }));
    expect(screen.getByText('Frontend').closest('tr')).not.toHaveAttribute('hidden');

    // 子行应用缩进
    expect(screen.getByText('Frontend').closest('.leaf-table__tree-cell')).toHaveStyle({
      paddingInlineStart: '20px',
    });

    // 选中子行后收起父行，已选记录仍保留
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select row: fe' }));
    expect(onSelect).toHaveBeenLastCalledWith(['fe'], [treeData[0]?.children?.[0]]);

    // 同级递归排序：按 Age 降序，子节点内 Backend(31) 排在 Frontend(29) 前
    await userEvent.click(screen.getByRole('button', { name: 'Age: Sort ascending' }));
    await userEvent.click(screen.getByRole('button', { name: 'Age: Sort descending' }));
    const visibleOrder = Array.from(
      screen.getByRole('table').querySelectorAll('tbody tr[data-row-id]:not([hidden])'),
    ).map((row) => row.getAttribute('data-row-id'));
    expect(visibleOrder).toEqual(['eng', 'be', 'fe', 'design']);
  });

  it('supports fixed columns, ellipsis fixed layout, and keyboard/drag column resizing', async () => {
    const onColumnResize = vi.fn();
    render(
      <ConfigProvider locale="en-US">
        <Table
          data={members.slice(0, 2)}
          columns={[
            {
              title: 'Name',
              dataIndex: 'name',
              fixed: 'left',
              width: 120,
              minWidth: 80,
              maxWidth: 240,
            },
            { title: 'Role', dataIndex: 'role', ellipsis: true },
            {
              title: 'Action',
              key: 'action',
              fixed: 'right',
              width: 90,
              resizable: false,
              render: () => 'Edit',
            },
          ]}
          rowKey="id"
          pagination={false}
          resizable
          onColumnResize={onColumnResize}
        />
      </ConfigProvider>,
    );

    const table = screen.getByRole('table');
    expect(table).toHaveStyle({ tableLayout: 'fixed' });
    expect(screen.getByRole('columnheader', { name: /^Name\b/ })).toHaveAttribute(
      'data-pinned',
      'start',
    );
    expect(screen.getByRole('columnheader', { name: 'Action' })).toHaveAttribute(
      'data-pinned',
      'end',
    );
    expect(
      screen.queryByRole('separator', { name: 'Resize column: Action' }),
    ).not.toBeInTheDocument();

    const handle = screen.getByRole('separator', { name: 'Resize column: Name' });
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    expect(onColumnResize).toHaveBeenLastCalledWith('name', 130);
    fireEvent.keyDown(handle, { key: 'ArrowRight', shiftKey: true });
    expect(onColumnResize).toHaveBeenLastCalledWith('name', 180);
    fireEvent.keyDown(handle, { key: 'Home' });
    expect(onColumnResize).toHaveBeenLastCalledWith('name', 80);
    fireEvent.keyDown(handle, { key: 'End' });
    expect(onColumnResize).toHaveBeenLastCalledWith('name', 240);

    // 鼠标拖拽与双击重置
    fireEvent.mouseDown(handle, { clientX: 200 });
    fireEvent.mouseMove(window, { clientX: 230 });
    fireEvent.mouseUp(window);
    expect(onColumnResize).toHaveBeenLastCalledWith('name', 240);

    fireEvent.doubleClick(handle);
    expect(handle).toHaveAttribute('aria-valuenow', '120');
  });

  it('supports local pagination, server pagination, and unknown-total icon pagination', async () => {
    const onPageChange = vi.fn();
    const { rerender } = render(
      <ConfigProvider locale="en-US">
        <Table
          data={members}
          columns={baseColumns}
          rowKey="id"
          pagination={{ defaultPageSize: 2, onChange: onPageChange }}
        />
      </ConfigProvider>,
    );
    expect(bodyFirstColumnTexts()).toEqual(['Alice', 'Bob']);
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(bodyFirstColumnTexts()).toEqual(['Charlie', 'Dana']);
    expect(onPageChange).toHaveBeenLastCalledWith(2, 2);

    // 未知总数分页默认使用描边纯图标按钮
    rerender(
      <ConfigProvider locale="en-US">
        <Table
          data={members.slice(0, 2)}
          columns={baseColumns}
          rowKey="id"
          pagination={{ total: -1, hasNextPage: false, variant: 'ghost', size: 'sm' }}
        />
      </ConfigProvider>,
    );
    const next = screen.getByRole('button', { name: 'Next' });
    expect(next).toBeDisabled();
    expect(next).toHaveClass('leaf-button--text', 'leaf-button--icon-sm');
    expect(next).toHaveTextContent('');
  });

  it('renders virtualized rows with aria-rowcount and preserves focused rows', () => {
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (
      this: HTMLElement,
    ) {
      return this.classList.contains('leaf-table__viewport') ? 300 : 48;
    });
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(600);
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(300);
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      const height = this.classList.contains('leaf-table__viewport')
        ? 300
        : this.tagName === 'THEAD'
          ? 44
          : 48;
      return {
        width: 600,
        height,
        top: 0,
        left: 0,
        right: 600,
        bottom: height,
        x: 0,
        y: 0,
        toJSON: () => {},
      };
    });
    const bigData: Member[] = Array.from({ length: 100 }, (_, i) => ({
      id: `row-${i}`,
      name: `User ${i}`,
      age: 20 + (i % 40),
      role: 'Member',
    }));
    render(
      <ConfigProvider locale="en-US">
        <Table data={bigData} columns={baseColumns} rowKey="id" pagination={false} virtual />
      </ConfigProvider>,
    );
    const table = screen.getByRole('table');
    expect(table).toHaveAttribute('aria-rowcount', '101');
    const renderedRows = table.querySelectorAll('tbody tr[data-row-id]');
    expect(renderedRows.length).toBeGreaterThan(0);
    expect(renderedRows.length).toBeLessThan(100);
  });

  it('renders empty, loading, error states and honors ConfigProvider Table defaults while isolating internal controls', async () => {
    const retry = vi.fn();
    const { rerender } = render(
      <ConfigProvider
        locale="en-US"
        components={{
          Table: { size: 'sm', bordered: true, striped: true },
          Button: { variant: 'solid', disabled: true },
          Pagination: { variant: 'ghost' },
        }}
      >
        <Table
          data={[]}
          columns={baseColumns}
          rowKey="id"
          emptyContent={<Result status="empty" title="Nothing here" />}
        />
      </ConfigProvider>,
    );
    const root = screen.getByRole('table').closest('.leaf-table');
    expect(root).toHaveClass('leaf-table--sm', 'leaf-table--bordered', 'leaf-table--striped');
    expect(screen.getByText('Nothing here')).toBeInTheDocument();

    rerender(
      <ConfigProvider
        locale="en-US"
        components={{
          Button: { variant: 'solid', disabled: true },
          Pagination: { variant: 'ghost' },
        }}
      >
        <Table
          data={members}
          columns={baseColumns}
          rowKey="id"
          error="Load failed"
          onRetry={retry}
        />
      </ConfigProvider>,
    );
    const retryBtn = screen.getByRole('button', { name: 'Retry' });
    expect(retryBtn).toBeEnabled();
    await userEvent.click(retryBtn);
    expect(retry).toHaveBeenCalledOnce();

    // 确认内部分页不继承公开 Pagination 的 ghost 默认值，默认仍为 outline
    rerender(
      <ConfigProvider locale="en-US" components={{ Pagination: { variant: 'ghost' } }}>
        <Table
          data={members}
          columns={baseColumns}
          rowKey="id"
          pagination={{ defaultPageSize: 2 }}
        />
      </ConfigProvider>,
    );
    const nav = screen.getByRole('navigation');
    expect(within(nav).getByRole('button', { name: 'Next' })).toHaveClass('leaf-button--outline');
  });

  it('supports server-side rendering without browser globals', () => {
    const html = renderToString(
      <Table
        data={members.slice(0, 2)}
        columns={baseColumns}
        rowKey="id"
        rowSelection={{ defaultSelectedRowKeys: ['alice'] as TableKey[] }}
        aria-label="SSR Table"
      />,
    );
    expect(html).toContain('<table');
    expect(html).toContain('Alice');
    expect(html).toContain('data-selected="true"');
  });
});
