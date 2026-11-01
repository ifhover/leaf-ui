import {
  type ColumnDef,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type Table as TanStackTable,
  useReactTable,
} from '@tanstack/react-table';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { ConfigProvider } from '../config-provider';
import { Form, FormField } from '../form';
import * as tableEntry from '../table';
import * as compatibilityEntry from './index';
import { useDataTableSelection } from './selection';
import {
  DataTable,
  type DataTableProps,
  type UseDataTableOptions,
  useDataTable,
} from './tabletanstack';

interface Person {
  id: string;
  name: string;
  age: number;
  team: string;
  disabled?: boolean;
  children?: Person[];
}
const data: Person[] = [
  { id: 'alice', name: 'Alice', age: 32, team: 'Design' },
  { id: 'bob', name: 'Bob', age: 21, team: 'Engineering', disabled: true },
  { id: 'charlie', name: 'Charlie', age: 45, team: 'Design' },
  { id: 'dana', name: 'Dana', age: 29, team: 'Engineering' },
];
const columns: ColumnDef<Person>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    enableHiding: false,
    size: 180,
    minSize: 100,
    maxSize: 320,
  },
  { accessorKey: 'age', header: 'Age', size: 100, minSize: 60, maxSize: 180 },
  { accessorKey: 'team', header: 'Team', size: 140 },
];

function Harness({
  onState,
  source = data,
  customColumns = columns,
  pageSize = 2,
  manual = false,
  pageCount,
  ...props
}: Omit<Extract<DataTableProps<Person>, { table: TanStackTable<Person> }>, 'table'> & {
  source?: Person[];
  customColumns?: ColumnDef<Person>[];
  pageSize?: number;
  manual?: boolean;
  pageCount?: number;
  onState?: (table: TanStackTable<Person>) => void;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize });
  const table = useReactTable({
    data: source,
    columns: customColumns,
    getRowId: (person) => person.id,
    getSubRows: (person) => person.children,
    state: { sorting, rowSelection, pagination },
    onSortingChange: setSorting,
    onRowSelectionChange: setSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: (row) => Boolean(props.renderExpandedRow || row.original.children?.length),
    enableRowSelection: (row) => !row.original.disabled,
    enableMultiRowSelection: props.selection !== 'single',
    manualPagination: manual,
    manualSorting: manual,
    pageCount,
    rowCount: manual && pageCount === undefined ? 60 : undefined,
  });
  onState?.(table);
  return (
    <ConfigProvider locale="en-US">
      <DataTable
        table={table}
        aria-label="People"
        getRowLabel={(row) => row.original.name}
        {...props}
      />
    </ConfigProvider>
  );
}

const bodyNames = () =>
  [...screen.getByRole('table').querySelectorAll('tbody tr[data-row-id]')].map(
    (row) => row.querySelector('td:not(.leaf-data-table__utility)')?.textContent,
  );

describe('DataTable TanStack adapter', () => {
  it('uses content layout for unsized columns without a synthetic minimum table width', () => {
    render(
      <Harness
        customColumns={[{ accessorKey: 'name' }, { accessorKey: 'team' }]}
        pagination={false}
      />,
    );
    const table = screen.getByRole('table');
    expect(table).toHaveStyle({ tableLayout: 'auto', width: '100%' });
    expect([...table.querySelectorAll('col')].every((col) => !col.style.width)).toBe(true);
    expect(table.parentElement?.style.minWidth).toBe('');
  });

  it('keeps the final explicit column width when fixed layout is required', () => {
    render(<Harness pagination={false} />);
    expect(screen.getByRole('table')).toHaveStyle({
      tableLayout: 'fixed',
      width: '420px',
      minWidth: '0',
    });
    expect(
      [...screen.getByRole('table').querySelectorAll('col')].map((col) => col.style.width),
    ).toEqual(['180px', '100px', '140px']);
  });

  it('keeps an empty table visible when no columns remain in a fixed layout', () => {
    render(<Harness customColumns={[]} resizable pagination={false} />);
    expect(screen.getByRole('table')).toHaveStyle({ width: '100%' });
  });

  it('starts mouse and keyboard resizing from the rendered flexible width', async () => {
    const clientWidth = vi.spyOn(Element.prototype, 'clientWidth', 'get').mockReturnValue(1000);
    try {
      let instance: TanStackTable<Person> | undefined;
      render(
        <Harness
          resizable
          pagination={false}
          customColumns={[
            { accessorKey: 'name', header: 'Name', meta: { flex: 1 } },
            { accessorKey: 'team', size: 100 },
          ]}
          onState={(table) => {
            instance = table;
          }}
        />,
      );
      const handle = screen.getByRole('separator', { name: 'Resize column: Name' });
      expect(Number(handle.getAttribute('aria-valuenow'))).toBeCloseTo(900);
      clientWidth.mockReturnValue(700);
      fireEvent.resize(window);
      expect(Number(handle.getAttribute('aria-valuenow'))).toBeCloseTo(600);
      expect(instance?.getState().columnSizing.name).toBeUndefined();
      fireEvent.mouseDown(handle, { clientX: 600 });
      expect(instance?.getState().columnSizingInfo.startSize).toBeCloseTo(600);
      fireEvent.mouseMove(document, { clientX: 620 });
      fireEvent.mouseUp(document, { clientX: 620 });
      expect(instance?.getState().columnSizing.name).toBeCloseTo(620);
      handle.focus();
      await userEvent.keyboard('{ArrowRight}');
      expect(instance?.getState().columnSizing.name).toBeCloseTo(630);
      fireEvent.doubleClick(handle);
      expect(instance?.getState().columnSizing.name).toBeUndefined();
      expect(Number(handle.getAttribute('aria-valuenow'))).toBeCloseTo(600);
    } finally {
      clientWidth.mockRestore();
    }
  });

  it('exports only the table and state hooks without public composition controls', () => {
    expect(Object.keys(tableEntry).sort()).toEqual([
      'DataTable',
      'useDataTable',
      'useDataTableSelection',
    ]);
    expect(compatibilityEntry).toEqual(tableEntry);
    expect(Object.keys(DataTable)).toEqual([]);
    for (const property of [
      'children',
      'layout',
      'selectAllMode',
      'columnReordering',
      'onRowReorder',
      'toolbar',
      'bleed',
    ] as const) {
      expectTypeOf<DataTableProps<Person>>().not.toHaveProperty(property);
    }
    expectTypeOf<DataTableProps<Person>>().toHaveProperty('bordered');
    expectTypeOf<UseDataTableOptions<Person>>().not.toHaveProperty('pagination');
  });

  it('ignores removed JavaScript options in both modes without replacing automatic content', () => {
    const legacy = {
      children: <p>Obsolete composition</p>,
      layout: 'custom',
      bordered: true,
      selectAllMode: 'all',
      columnReordering: true,
      onRowReorder: vi.fn(),
      variant: 'layered',
      columnDividers: true,
      toolbar: 'Obsolete toolbar',
      bleed: true,
    };
    const view = render(<DataTable {...legacy} data={data} columns={columns} rowKey="id" />);
    const assertAutomaticContent = () => {
      const root = screen.getByRole('table').closest('.leaf-data-table');
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.queryByText('Obsolete composition')).not.toBeInTheDocument();
      expect(screen.queryByText('Obsolete toolbar')).not.toBeInTheDocument();
      for (const property of Object.keys(legacy)) expect(root).not.toHaveAttribute(property);
      expect(screen.getByRole('table').closest('.leaf-table')).toHaveClass('leaf-table--bordered');
      expect(screen.getByRole('table').closest('.leaf-table')).not.toHaveClass(
        'leaf-table--column-dividers',
      );
    };
    assertAutomaticContent();
    view.rerender(<Harness {...legacy} />);
    assertAutomaticContent();
    expect(legacy.onRowReorder).not.toHaveBeenCalled();
  });

  it('removes caption in both modes without leaking legacy options to the DOM', () => {
    expectTypeOf<DataTableProps<Person>>().not.toHaveProperty('caption');
    const legacyOptions = { caption: 'Obsolete caption' };
    const view = render(
      <DataTable
        {...legacyOptions}
        data={data}
        columns={columns}
        rowKey="id"
        aria-label="People"
      />,
    );
    expect(screen.getByRole('table', { name: 'People' })).not.toHaveAttribute('caption');
    expect(view.container.querySelector('[caption], caption')).toBeNull();
    expect(screen.queryByText('Obsolete caption')).not.toBeInTheDocument();
    view.rerender(<Harness {...legacyOptions} aria-label="People" />);
    expect(screen.getByRole('table', { name: 'People' })).not.toHaveAttribute('caption');
    expect(view.container.querySelector('[caption], caption')).toBeNull();
    expect(screen.queryByText('Obsolete caption')).not.toBeInTheDocument();
  });

  it('does not expose or forward the obsolete fixed-header switch', () => {
    expectTypeOf<DataTableProps<Person>>().not.toHaveProperty('stickyHeader');
    const legacyOptions = { stickyHeader: false };
    render(
      <DataTable
        {...legacyOptions}
        data={data}
        columns={[{ accessorKey: 'name', header: 'Name' }]}
        rowKey="id"
        aria-label="Fixed headers"
      />,
    );
    const table = screen.getByRole('table', { name: 'Fixed headers' });
    expect(table).not.toHaveAttribute('stickyHeader');
    expect(table.closest('.leaf-data-table')).not.toHaveAttribute('stickyHeader');
    expect(table.closest('.leaf-table')?.querySelector('.leaf-table__panel')).toBeNull();
  });

  it('creates a single engine for the data/columns convenience mode', async () => {
    render(
      <ConfigProvider locale="en-US">
        <DataTable
          data={data}
          columns={columns}
          rowKey="id"
          selection="multiple"
          options={{
            enableSorting: true,
            initialState: { pagination: { pageIndex: 0, pageSize: 2 } },
            enableRowSelection: (row) => !row.original.disabled,
          }}
        />
      </ConfigProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Age: Sort descending' }));
    expect(bodyNames()).toEqual(['Charlie', 'Alice']);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select row: alice' }));
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(bodyNames()).toEqual(['Dana', 'Bob']);
    expect(screen.getByRole('checkbox', { name: 'Select row: bob' })).toBeDisabled();
  });

  it.each([undefined, {}, { enableSorting: undefined }, { enableSorting: false }])(
    'leaves headers and data unsorted until explicitly enabled (%j)',
    (options) => {
      render(
        <ConfigProvider locale="en-US">
          <DataTable
            data={data}
            columns={columns}
            rowKey="id"
            pagination={false}
            options={options}
          />
        </ConfigProvider>,
      );
      expect(screen.queryByRole('button', { name: /Sort/ })).not.toBeInTheDocument();
      expect(screen.getAllByRole('columnheader')).toHaveLength(3);
      expect(bodyNames()).toEqual(['Alice', 'Bob', 'Charlie', 'Dana']);
    },
  );

  it('updates sorting opt-in on the stable hook instance and respects column exclusions', async () => {
    let instance: TanStackTable<Person> | undefined;
    const sortColumns = columns.map((column) => ({
      ...column,
      enableSorting: 'accessorKey' in column && column.accessorKey === 'age',
    }));
    function HookTable({ enabled }: { enabled?: boolean }) {
      const table = useDataTable({
        data,
        columns: sortColumns,
        rowKey: 'id',
        localPagination: false,
        options: { enableSorting: enabled },
      });
      instance = table;
      return <DataTable table={table} pagination={false} />;
    }
    const view = (enabled?: boolean) => (
      <ConfigProvider locale="en-US">
        <HookTable enabled={enabled} />
      </ConfigProvider>
    );
    const { rerender } = render(view());
    const original = instance;
    expect(screen.queryByRole('button', { name: /Sort/ })).not.toBeInTheDocument();
    expect(instance?.options.enableSorting).toBe(false);
    rerender(view(true));
    expect(instance).toBe(original);
    expect(screen.getAllByRole('button', { name: /Sort/ })).toHaveLength(1);
    await userEvent.click(screen.getByRole('button', { name: 'Age: Sort descending' }));
    expect(bodyNames()).toEqual(['Charlie', 'Alice', 'Dana', 'Bob']);
    rerender(view(false));
    expect(screen.queryByRole('button', { name: /Sort/ })).not.toBeInTheDocument();
    expect(instance?.getState().sorting).toEqual([{ id: 'age', desc: true }]);
    rerender(view(true));
    expect(instance).toBe(original);
    expect(screen.getByRole('button', { name: 'Age: Sort ascending' })).toBeInTheDocument();
  });

  it('requires sorting opt-in for manual mode and leaves data order to its owner', async () => {
    let instance: TanStackTable<Person> | undefined;
    function ManualTable({ enabled }: { enabled?: boolean }) {
      const [sorting, setSorting] = useState<SortingState>([]);
      const table = useDataTable({
        data,
        columns,
        rowKey: 'id',
        localPagination: false,
        options: {
          enableSorting: enabled,
          manualSorting: true,
          state: { sorting },
          onSortingChange: setSorting,
        },
      });
      instance = table;
      return <DataTable table={table} pagination={false} />;
    }
    const view = (enabled?: boolean) => (
      <ConfigProvider locale="en-US">
        <ManualTable enabled={enabled} />
      </ConfigProvider>
    );
    const { rerender } = render(view());
    expect(screen.queryByRole('button', { name: /Sort/ })).not.toBeInTheDocument();
    rerender(view(true));
    await userEvent.click(screen.getByRole('button', { name: 'Age: Sort descending' }));
    expect(instance?.getState().sorting).toEqual([{ id: 'age', desc: true }]);
    expect(screen.getByRole('columnheader', { name: /Age/ })).toHaveAttribute(
      'aria-sort',
      'descending',
    );
    expect(bodyNames()).toEqual(['Alice', 'Bob', 'Charlie', 'Dana']);
    await userEvent.click(screen.getByRole('button', { name: 'Age: Sort ascending' }));
    expect(instance?.getState().sorting).toEqual([{ id: 'age', desc: false }]);
    await userEvent.click(screen.getByRole('button', { name: 'Age: Clear sorting' }));
    expect(instance?.getState().sorting).toEqual([]);
  });

  it('separates local slicing from default pagination visibility', () => {
    let instance: TanStackTable<Person> | undefined;
    function HookTable() {
      const table = useDataTable({
        data,
        columns,
        rowKey: 'id',
        localPagination: true,
        options: { initialState: { pagination: { pageIndex: 0, pageSize: 2 } } },
      });
      instance = table;
      return <DataTable table={table} pagination={false} />;
    }
    render(
      <ConfigProvider locale="en-US">
        <HookTable />
      </ConfigProvider>,
    );
    expect(instance?.options.manualPagination).toBeUndefined();
    expect(bodyNames()).toEqual(['Alice', 'Bob']);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('hides sorting and pagination controls when the instance lacks their models', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    function CoreOnly() {
      const table = useReactTable({
        data,
        columns,
        getRowId: (row) => row.id,
        getCoreRowModel: getCoreRowModel(),
      });
      return <DataTable table={table} />;
    }
    render(
      <ConfigProvider locale="en-US">
        <CoreOnly />
      </ConfigProvider>,
    );
    expect(screen.queryByRole('button', { name: /Sort/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('getPaginationRowModel'));
    warn.mockRestore();
  });

  it('supports manual sorting and pagination without installing local row models', () => {
    function ManualOnly() {
      const table = useReactTable({
        data,
        columns,
        getRowId: (row) => row.id,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualSorting: true,
        rowCount: 60,
      });
      return <DataTable table={table} />;
    }
    render(
      <ConfigProvider locale="en-US">
        <ManualOnly />
      </ConfigProvider>,
    );
    expect(screen.getByRole('button', { name: 'Name: Sort ascending' })).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(bodyNames()).toEqual(['Alice', 'Bob', 'Charlie', 'Dana']);
  });

  it('renders application-owned filtering, visibility and column order from TanStack state', async () => {
    function ApplicationTable() {
      const table = useDataTable({ data, columns, rowKey: 'id', localPagination: false });
      return (
        <>
          <input
            aria-label="Filter names"
            value={String(table.getColumn('name')?.getFilterValue() ?? '')}
            onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
          />
          <button
            type="button"
            onClick={() => {
              table.setColumnVisibility({ age: false });
              table.setColumnOrder(['team', 'name', 'age']);
            }}
          >
            Choose columns
          </button>
          <DataTable table={table} pagination={false} />
        </>
      );
    }
    render(<ApplicationTable />);
    await userEvent.type(screen.getByRole('textbox', { name: 'Filter names' }), 'char');
    expect(bodyNames()).toEqual(['Charlie']);
    await userEvent.click(screen.getByRole('button', { name: 'Choose columns' }));
    expect(screen.getAllByRole('columnheader').map((cell) => cell.textContent)).toEqual([
      'Team',
      'Name',
    ]);
    expect(screen.getAllByRole('cell').map((cell) => cell.textContent)).toEqual([
      'Design',
      'Charlie',
    ]);
  });

  it('resets local pagination after external filtering while slicing is temporarily disabled', async () => {
    function ApplicationTable() {
      const [pagination, setPagination] = useState(true);
      const table = useDataTable({
        data,
        columns,
        rowKey: 'id',
        localPagination: pagination,
        options: { initialState: { pagination: { pageIndex: 0, pageSize: 2 } } },
      });
      return (
        <>
          <button type="button" onClick={() => setPagination((value) => !value)}>
            Toggle slicing
          </button>
          <button type="button" onClick={() => table.getColumn('name')?.setFilterValue('alice')}>
            Filter Alice
          </button>
          <DataTable table={table} pagination={pagination} />
        </>
      );
    }
    render(
      <ConfigProvider locale="en-US">
        <ApplicationTable />
      </ConfigProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(bodyNames()).toEqual(['Charlie', 'Dana']);
    await userEvent.click(screen.getByRole('button', { name: 'Toggle slicing' }));
    await userEvent.click(screen.getByRole('button', { name: 'Filter Alice' }));
    expect(bodyNames()).toEqual(['Alice']);
    await userEvent.click(screen.getByRole('button', { name: 'Toggle slicing' }));
    expect(bodyNames()).toEqual(['Alice']);
  });

  it('normalizes a single-selection state to the last selected row', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    function MultipleSelected() {
      const [rowSelection, setRowSelection] = useState<RowSelectionState>({
        alice: true,
        bob: true,
      });
      const table = useReactTable({
        data,
        columns,
        getRowId: (row) => row.id,
        getCoreRowModel: getCoreRowModel(),
        state: { rowSelection },
        onRowSelectionChange: setRowSelection,
        enableMultiRowSelection: true,
      });
      return <DataTable table={table} selection="single" />;
    }
    render(
      <ConfigProvider locale="en-US">
        <MultipleSelected />
      </ConfigProvider>,
    );
    await waitFor(() => {
      expect(screen.getByRole('radio', { name: 'Select row: bob' })).toBeChecked();
      expect(screen.getByRole('radio', { name: 'Select row: alice' })).not.toBeChecked();
    });
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('only the most recently requested key'),
    );
    warn.mockRestore();
  });

  it('provides a selection helper for controlled and uncontrolled states', async () => {
    function Controlled() {
      const [keys, setKeys] = useState<string[]>(['alice']);
      const selection = useDataTableSelection({
        mode: 'multiple',
        selectedRowKeys: keys,
        onSelectedRowKeysChange: setKeys,
      });
      return (
        <>
          <span>{selection.selectedRowKeys.join(',')}</span>
          <DataTable
            data={data}
            columns={columns}
            rowKey="id"
            selection="multiple"
            options={selection.selectionOptions}
          />
        </>
      );
    }
    const { rerender } = render(
      <ConfigProvider locale="en-US">
        <Controlled />
      </ConfigProvider>,
    );
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select row: bob' }));
    expect(screen.getByText('alice,bob')).toBeInTheDocument();
    rerender(
      <ConfigProvider locale="en-US">
        <Controlled />
      </ConfigProvider>,
    );
    expect(screen.getByRole('checkbox', { name: 'Select row: alice' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Select row: bob' })).toBeChecked();
  });

  it('supports regional stripes and explicit overrides without replacing selected rows', async () => {
    expectTypeOf<DataTableProps<Person>>().not.toHaveProperty('variant');
    expectTypeOf<DataTableProps<Person>>().not.toHaveProperty('columnDividers');
    const { rerender } = render(
      <ConfigProvider components={{ DataTable: { striped: true } }}>
        <Harness pagination={false} selection="multiple" />
      </ConfigProvider>,
    );
    const table = screen.getByRole('table');
    const root = table.closest('.leaf-table');
    expect(root).toHaveClass('leaf-table--striped');
    expect(root).not.toHaveClass('leaf-table--column-dividers');
    expect(table.closest('.leaf-data-table')).not.toHaveAttribute('variant');
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select row: Alice' }));
    rerender(
      <ConfigProvider components={{ DataTable: { striped: true } }}>
        <Harness striped={false} pagination={false} selection="multiple" />
      </ConfigProvider>,
    );
    expect(screen.getByRole('table')).toBe(table);
    expect(root).not.toHaveClass('leaf-table--striped', 'leaf-table--column-dividers');
    expect(screen.getByRole('checkbox', { name: 'Select row: Alice' })).toBeChecked();
  });

  it('defaults to an Ant Design-style frameless table in data mode and server output', () => {
    const props = {
      data,
      columns,
      rowKey: 'id',
      pagination: false,
    } as const;
    const { rerender } = render(<DataTable {...props} />);
    expect(screen.getByRole('table').closest('.leaf-table')).not.toHaveClass('leaf-table--striped');
    expect(screen.getByRole('table').closest('.leaf-table')).not.toHaveClass(
      'leaf-table--bordered',
    );
    expect(screen.getByRole('table').closest('.leaf-table')).not.toHaveClass(
      'leaf-table--column-dividers',
    );
    const html = renderToString(<DataTable {...props} />);
    expect(html).not.toContain('leaf-table__panel');
    expect(html).not.toContain('leaf-table--striped');
    expect(html).not.toContain('leaf-table--bordered');
    expect(html).not.toContain('leaf-table--column-dividers');
    expect(html).not.toContain('variant=');
    const rows = screen.getAllByRole('row').slice(1);
    expect(rows.map((row) => row.hasAttribute('data-striped'))).toEqual([
      false,
      false,
      false,
      false,
    ]);
    rerender(<DataTable {...props} striped />);
    expect(screen.getByRole('table').closest('.leaf-table')).toHaveClass('leaf-table--striped');
    expect(renderToString(<DataTable {...props} striped />)).toContain('leaf-table--striped');
    rerender(<DataTable {...props} bordered />);
    expect(screen.getByRole('table').closest('.leaf-table')).toHaveClass('leaf-table--bordered');
    expect(renderToString(<DataTable {...props} bordered />)).toContain('leaf-table--bordered');
  });

  it('lets explicit stripes override regional defaults without replacing the table', () => {
    const view = (striped?: boolean) => (
      <ConfigProvider components={{ DataTable: { striped: false } }}>
        <DataTable data={data} columns={columns} rowKey="id" pagination={false} striped={striped} />
      </ConfigProvider>
    );
    const { rerender } = render(view());
    const table = screen.getByRole('table');
    const root = table.closest('.leaf-table');
    expect(root).not.toHaveClass('leaf-table--striped');
    rerender(view(true));
    expect(screen.getByRole('table')).toBe(table);
    expect(root).toHaveClass('leaf-table--striped');
  });

  it('checks the stable row key contract in convenience mode', () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    // @ts-expect-error Runtime validation also protects JavaScript callers.
    expect(() => render(<DataTable data={data} columns={columns} rowKey="children" />)).toThrow(
      'DataTable rowKey must resolve',
    );
    log.mockRestore();
  });
  it('sorts through controlled TanStack state and keeps sorting semantics on th', async () => {
    let instance: TanStackTable<Person> | undefined;
    render(
      <Harness
        onState={(table) => {
          instance = table;
        }}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Age: Sort descending' }));
    expect(instance?.getState().sorting).toEqual([{ id: 'age', desc: true }]);
    expect(bodyNames()).toEqual(['Charlie', 'Alice']);
    expect(screen.getByRole('columnheader', { name: /Age/ })).toHaveAttribute(
      'aria-sort',
      'descending',
    );
    await userEvent.keyboard('{Enter}');
    expect(instance?.getState().sorting).toEqual([{ id: 'age', desc: false }]);
    expect(bodyNames()).toEqual(['Bob', 'Dana']);
  });

  it('paginates from the same TanStack instance and changes page size', async () => {
    let instance: TanStackTable<Person> | undefined;
    render(
      <Harness
        onState={(table) => {
          instance = table;
        }}
        pagination={{ pageSizeOptions: [2, 4] }}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(instance?.getState().pagination.pageIndex).toBe(1);
    expect(bodyNames()).toEqual(['Charlie', 'Dana']);
    await userEvent.click(screen.getByRole('combobox', { name: 'Page size' }));
    await userEvent.click(screen.getByRole('option', { name: '4 / page' }));
    expect(instance?.getState().pagination).toEqual({ pageIndex: 0, pageSize: 4 });
    expect(bodyNames()).toEqual(['Alice', 'Bob', 'Charlie', 'Dana']);
  });

  it('selects only selectable page rows and preserves selection across pagination', async () => {
    let instance: TanStackTable<Person> | undefined;
    render(
      <Harness
        selection="multiple"
        onState={(table) => {
          instance = table;
        }}
      />,
    );
    expect(screen.getByRole('checkbox', { name: 'Select row: Bob' })).toBeDisabled();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select all rows on this page' }));
    expect(instance?.getState().rowSelection).toEqual({ alice: true });
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select row: Dana' }));
    expect(instance?.getState().rowSelection).toEqual({ alice: true, dana: true });
    await userEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(screen.getByRole('checkbox', { name: 'Select row: Alice' })).toBeChecked();
  });

  it('links detail rows and keeps native inputs mounted while collapsed', async () => {
    const renderDetail = (row: { original: Person }) => (
      <input aria-label={`Note ${row.original.name}`} defaultValue="Draft" />
    );
    let instance: TanStackTable<Person> | undefined;
    const submit = vi.fn((event) => event.preventDefault());
    render(
      <ConfigProvider
        components={{ Button: { variant: 'solid', size: 'lg', loading: true, type: 'submit' } }}
      >
        <form onSubmit={submit}>
          <Harness
            renderExpandedRow={renderDetail}
            onState={(table) => {
              instance = table;
            }}
          />
        </form>
      </ConfigProvider>,
    );
    const opener = screen.getByRole('button', { name: 'Expand row: Alice' });
    expect(opener).toHaveClass('leaf-button', 'leaf-button--text', 'leaf-button--sm');
    expect(opener).toHaveClass('leaf-button--icon-only');
    expect(opener).toHaveAttribute('type', 'button');
    expect(opener).toBeEnabled();
    const target = opener.getAttribute('aria-controls');
    expect(document.getElementById(target ?? '')).toHaveAttribute('hidden');
    await userEvent.click(opener);
    expect(instance?.getState().expanded).toEqual({ alice: true });
    const note = screen.getByRole('textbox', { name: 'Note Alice' });
    await userEvent.type(note, ' saved');
    await userEvent.click(screen.getByRole('button', { name: 'Collapse row: Alice' }));
    await userEvent.click(screen.getByRole('button', { name: 'Expand row: Alice' }));
    expect(screen.getByRole('textbox', { name: 'Note Alice' })).toBe(note);
    expect(note).toHaveValue('Draft saved');
    expect(submit).not.toHaveBeenCalled();
  });

  it('selects logical page records when their selection cells span information and data rows', async () => {
    let instance: TanStackTable<Person> | undefined;
    render(
      <Harness
        selection="multiple"
        renderRowHeader={(row) => `Summary ${row.original.name}`}
        onState={(table) => {
          instance = table;
        }}
      />,
    );
    const table = screen.getByRole('table');
    expect([...table.querySelectorAll('tbody tr')].map((row) => row.textContent)).toEqual([
      'Summary Alice',
      'Alice32Design',
      'Summary Bob',
      'Bob21Engineering',
    ]);
    expect(screen.getAllByRole('checkbox')).toHaveLength(3);
    const checkbox = screen.getByRole('checkbox', { name: 'Select row: Alice' });
    expect(checkbox.closest('td')).toHaveAttribute('rowspan', '2');
    expect(screen.getByText('Summary Alice').closest('td')).toHaveAttribute('colspan', '3');
    expect(screen.queryByRole('button', { name: /Expand row/ })).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Select row: Bob' })).toBeDisabled();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select all rows on this page' }));
    expect(instance?.getState().rowSelection).toEqual({ alice: true });
    const header = screen.getByText('Summary Alice').closest('tr');
    expect(header).toHaveAttribute('data-selected');
    expect(header?.nextElementSibling).toHaveAttribute('data-selected');
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(bodyNames()).toEqual(['Charlie', 'Dana']);
    expect(screen.getByText('Summary Charlie')).toBeInTheDocument();
    expect(screen.queryByText('Summary Alice')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select row: Dana' }));
    await userEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(checkbox).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Select row: Alice' })).toBeChecked();
    expect(instance?.getState().rowSelection).toEqual({ alice: true, dana: true });
  });

  it('keeps information rows paired after sorting, filtering and changing visible columns', async () => {
    function Records() {
      const table = useDataTable({
        data,
        columns,
        rowKey: 'id',
        options: {
          enableSorting: true,
          sortDescFirst: false,
          initialState: { pagination: { pageIndex: 0, pageSize: 2 } },
        },
      });
      return (
        <ConfigProvider locale="en-US">
          <button type="button" onClick={() => table.getColumn('team')?.setFilterValue('Design')}>
            Design only
          </button>
          <button type="button" onClick={() => table.getColumn('team')?.toggleVisibility(false)}>
            Hide team
          </button>
          <DataTable table={table} renderRowHeader={(row) => `Summary ${row.original.name}`} />
        </ConfigProvider>
      );
    }
    render(<Records />);
    await userEvent.click(screen.getByRole('button', { name: 'Age: Sort ascending' }));
    expect(bodyNames()).toEqual(['Bob', 'Dana']);
    for (const name of ['Bob', 'Dana']) {
      expect(screen.getByText(`Summary ${name}`).closest('tr')?.nextElementSibling).toHaveAttribute(
        'data-row-id',
        name.toLowerCase(),
      );
    }
    await userEvent.click(screen.getByRole('button', { name: 'Design only' }));
    expect(bodyNames()).toEqual(['Alice', 'Charlie']);
    expect(screen.queryByText('Summary Bob')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Hide team' }));
    expect(screen.getByText('Summary Alice').closest('td')).toHaveAttribute('colspan', '2');
    expect(screen.getByText('Summary Charlie').closest('td')).toHaveAttribute('colspan', '2');
  });

  it('moves optional details into the information row and retains collapsed input state', async () => {
    render(
      <ConfigProvider locale="en-US">
        <DataTable
          data={data.slice(0, 2)}
          columns={columns}
          rowKey="id"
          selection="multiple"
          pagination={false}
          getRowLabel={(row) => row.original.name}
          renderRowHeader={(row) => `Summary ${row.original.name}`}
          options={{ getRowCanExpand: (row) => !row.original.disabled }}
          renderExpandedRow={(row) => <input aria-label={`Note ${row.original.name}`} />}
        />
      </ConfigProvider>,
    );
    const table = screen.getByRole('table');
    expect(table.querySelectorAll('col')).toHaveLength(4);
    expect(table.querySelectorAll('.leaf-data-table__expansion')).toHaveLength(0);
    const opener = screen.getByRole('button', { name: 'Expand row: Alice' });
    expect(opener).toHaveTextContent('Expand details');
    expect(opener.closest('tr')).toHaveAttribute('data-row-header', 'alice');
    expect(screen.queryByRole('button', { name: 'Expand row: Bob' })).not.toBeInTheDocument();
    const details = document.getElementById(opener.getAttribute('aria-controls') ?? '');
    expect(details).toHaveAttribute('hidden');
    await userEvent.click(opener);
    expect(opener).toHaveAttribute('aria-expanded', 'true');
    expect(opener).toHaveTextContent('Collapse details');
    expect(details).not.toHaveAttribute('hidden');
    expect(details?.querySelector('td')).toHaveAttribute('colspan', '4');
    const note = screen.getByRole('textbox', { name: 'Note Alice' });
    await userEvent.type(note, 'Keep this draft');
    await userEvent.click(opener);
    expect(details).toHaveAttribute('hidden');
    expect(bodyNames()).toEqual(['Alice', 'Bob']);
    await userEvent.click(opener);
    expect(screen.getByRole('textbox', { name: 'Note Alice' })).toBe(note);
    expect(note).toHaveValue('Keep this draft');
  });

  it('expands hierarchical rows through the supplied row model', async () => {
    const source = [{ ...(data[0] as Person), children: [data[2] as Person] }];
    render(<Harness source={source} pageSize={4} pagination={false} />);
    expect(bodyNames()).toEqual(['Alice']);
    await userEvent.click(screen.getByRole('button', { name: 'Expand row: Alice' }));
    expect(bodyNames()).toEqual(['Alice', 'Charlie']);
  });

  it('resizes columns by keyboard using the TanStack sizing state', async () => {
    let instance: TanStackTable<Person> | undefined;
    render(
      <Harness
        resizable
        pagination={false}
        onState={(table) => {
          instance = table;
        }}
      />,
    );
    const handle = screen.getByRole('separator', { name: 'Resize column: Name' });
    await userEvent.click(handle);
    await userEvent.keyboard('{ArrowRight}');
    expect(instance?.getState().columnSizing.name).toBe(190);
    expect(handle).toHaveAttribute('aria-valuenow', '190');
    await userEvent.keyboard('{End}');
    expect(instance?.getState().columnSizing.name).toBe(320);
    await userEvent.keyboard('{Home}');
    expect(instance?.getState().columnSizing.name).toBe(100);
  });

  it('does not slice or sort server data twice', async () => {
    let instance: TanStackTable<Person> | undefined;
    render(
      <Harness
        source={[data[2] as Person, data[0] as Person]}
        manual
        onState={(table) => {
          instance = table;
        }}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(instance?.getState().pagination.pageIndex).toBe(1);
    expect(bodyNames()).toEqual(['Charlie', 'Alice']);
    await userEvent.click(screen.getByRole('button', { name: 'Name: Sort ascending' }));
    expect(bodyNames()).toEqual(['Charlie', 'Alice']);
    expect(instance?.getState().sorting).toEqual([{ id: 'name', desc: false }]);
  });

  it('supports an unknown server page count with previous/next navigation', async () => {
    let instance: TanStackTable<Person> | undefined;
    render(
      <Harness
        source={data.slice(0, 2)}
        manual
        pageCount={-1}
        onState={(table) => {
          instance = table;
        }}
      />,
    );
    expect(screen.queryByRole('combobox', { name: 'Page size' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(instance?.getState().pagination.pageIndex).toBe(1);
  });

  it('stops unknown-total pagination when the application has no next page', () => {
    render(
      <Harness
        manual
        pageCount={-1}
        pagination={{ hasNextPage: false, variant: 'ghost', size: 'sm' }}
      />,
    );
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toHaveClass(
      'leaf-button--text',
      'leaf-button--sm',
    );
  });

  it('does not truncate convenience-mode data when pagination is disabled', () => {
    const source = Array.from({ length: 14 }, (_, index) => ({
      ...(data[0] as Person),
      id: String(index),
    }));
    render(<DataTable data={source} columns={columns} rowKey="id" pagination={false} />);
    expect(screen.getByRole('table').querySelectorAll('tbody tr[data-row-id]')).toHaveLength(14);
  });

  it('toggles convenience pagination without losing selection or the cached row model', async () => {
    const options = { initialState: { pagination: { pageIndex: 0, pageSize: 2 } } };
    const props = { data, columns, rowKey: 'id' as const, options, selection: 'multiple' as const };
    const { rerender } = render(<DataTable {...props} />, {
      wrapper: ({ children }) => <ConfigProvider locale="en-US">{children}</ConfigProvider>,
    });
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select row: alice' }));
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(bodyNames()).toEqual(['Charlie', 'Dana']);
    rerender(<DataTable {...props} pagination={false} />);
    expect(bodyNames()).toEqual(['Alice', 'Bob', 'Charlie', 'Dana']);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Select row: alice' })).toBeChecked();
    rerender(<DataTable {...props} pagination />);
    expect(bodyNames()).toEqual(['Charlie', 'Dana']);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('keeps native manual server options when creating an instance with the hook', () => {
    const serverData = [data[2] as Person, data[0] as Person];
    function ServerTable() {
      const table = useDataTable({
        data: serverData,
        columns,
        rowKey: 'id',
        options: {
          manualPagination: true,
          manualSorting: true,
          rowCount: 60,
          initialState: {
            pagination: { pageIndex: 2, pageSize: 2 },
            sorting: [{ id: 'age', desc: false }],
          },
        },
      });
      return <DataTable table={table} />;
    }
    render(<ServerTable />);
    expect(bodyNames()).toEqual(['Charlie', 'Alice']);
  });

  it('preserves native pagination props and events with an unknown total', async () => {
    const onClick = vi.fn();
    render(
      <Harness
        manual
        pageCount={-1}
        pagination={{
          id: 'people-pages',
          style: { marginTop: 12 },
          'aria-label': 'Custom pages',
          dir: 'rtl',
          onClick,
          showTotal: true,
          showSizeChanger: true,
        }}
      />,
    );
    const nav = screen.getByRole('navigation', { name: 'Custom pages' });
    expect(nav).toHaveAttribute('id', 'people-pages');
    expect(nav).toHaveAttribute('dir', 'rtl');
    expect(nav).toHaveStyle({ marginTop: '12px' });
    expect(nav).not.toHaveAttribute('showTotal');
    expect(nav).not.toHaveAttribute('showSizeChanger');
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('shares the managed defaults through a public hook without requiring controlled state', async () => {
    let instance: TanStackTable<Person> | undefined;
    function HookTable({ pagination = true }: { pagination?: boolean }) {
      const table = useDataTable({
        data,
        columns,
        rowKey: (row) => row.age,
        localPagination: pagination,
        options: {
          enableSorting: true,
          initialState: { pagination: { pageIndex: 0, pageSize: 2 } },
        },
      });
      instance = table;
      return (
        <>
          <button type="button" onClick={() => table.resetSorting()}>
            Reset sorting
          </button>
          <DataTable table={table} pagination={pagination} />
        </>
      );
    }
    const { rerender } = render(
      <ConfigProvider locale="en-US">
        <HookTable />
      </ConfigProvider>,
    );
    const first = instance;
    await userEvent.click(screen.getByRole('button', { name: 'Age: Sort descending' }));
    expect(bodyNames()).toEqual(['Charlie', 'Alice']);
    expect(instance?.getRow('45').original.name).toBe('Charlie');
    rerender(
      <ConfigProvider locale="en-US">
        <HookTable pagination={false} />
      </ConfigProvider>,
    );
    expect(instance).toBe(first);
    expect(bodyNames()).toEqual(['Charlie', 'Alice', 'Dana', 'Bob']);
    await userEvent.click(screen.getByRole('button', { name: 'Reset sorting' }));
    expect(bodyNames()).toEqual(['Alice', 'Bob', 'Charlie', 'Dana']);
  });

  it('keeps internal single-row selection out of the surrounding FormData', async () => {
    render(
      <form aria-label="Settings">
        <input name="project" defaultValue="Leaf" />
        <Harness selection="single" />
      </form>,
    );
    await userEvent.click(screen.getByRole('radio', { name: 'Select row: Alice' }));
    expect([...new FormData(screen.getByRole('form') as HTMLFormElement)]).toEqual([
      ['project', 'Leaf'],
    ]);
  });

  it('supports merged cells by omitting zero spans', () => {
    render(
      <Harness
        getCellProps={(cell) =>
          cell.column.id === 'name'
            ? { colSpan: 2 }
            : cell.column.id === 'age'
              ? { colSpan: 0 }
              : {}
        }
      />,
    );
    const row = screen.getByRole('table').querySelector('tbody tr[data-row-id]');
    expect(row?.querySelectorAll('td')).toHaveLength(2);
    expect(row?.querySelector('td')).toHaveAttribute('colspan', '2');
  });

  it('owns pinned cell geometry even when getCellProps supplies conflicting styles', () => {
    function PinnedTable() {
      const table = useDataTable({
        data,
        columns,
        rowKey: 'id',
        localPagination: false,
        options: { initialState: { columnPinning: { left: ['name'] } } },
      });
      return (
        <DataTable
          table={table}
          pagination={false}
          getCellProps={(cell) =>
            cell.column.id === 'name'
              ? { style: { insetInlineStart: 999, position: 'static' } }
              : {}
          }
        />
      );
    }
    render(
      <ConfigProvider locale="en-US">
        <PinnedTable />
      </ConfigProvider>,
    );
    const cell = screen
      .getByRole('table')
      .querySelector<HTMLTableCellElement>('tbody tr[data-row-id] td[data-pinned="start"]');
    expect(cell?.style.position).toBe('sticky');
    expect(cell?.style.insetInlineStart).toBe('0px');
  });

  it('supports uncontrolled multiple and single selections through the helper', async () => {
    function Uncontrolled({ mode }: { mode: 'single' | 'multiple' }) {
      const selection = useDataTableSelection({
        mode,
        defaultSelectedRowKeys: mode === 'single' ? ['alice', 'bob'] : ['alice'],
      });
      return (
        <>
          <span data-testid="selected-keys">{selection.selectedRowKeys.join(',')}</span>
          <button type="button" onClick={selection.clearSelection}>
            Clear selection
          </button>
          <DataTable
            data={data}
            columns={columns}
            rowKey="id"
            selection={mode}
            options={selection.selectionOptions}
            pagination={false}
          />
        </>
      );
    }
    const { rerender } = render(
      <ConfigProvider locale="en-US">
        <Uncontrolled mode="multiple" />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('selected-keys')).toHaveTextContent('alice');
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select row: bob' }));
    expect(screen.getByTestId('selected-keys')).toHaveTextContent('alice,bob');

    rerender(
      <ConfigProvider locale="en-US">
        <Uncontrolled mode="single" />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('selected-keys')).toHaveTextContent('bob');
    expect(screen.getByRole('radio', { name: 'Select row: bob' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Select row: alice' })).not.toBeChecked();
    await userEvent.click(screen.getByRole('radio', { name: 'Select row: alice' }));
    expect(screen.getByTestId('selected-keys')).toHaveTextContent('alice');
    expect(screen.getByRole('radio', { name: 'Select row: bob' })).not.toBeChecked();

    rerender(
      <ConfigProvider locale="en-US">
        <Uncontrolled mode="multiple" />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('selected-keys')).toHaveTextContent('alice');
    expect(screen.getByRole('checkbox', { name: 'Select row: alice' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Select row: bob' })).not.toBeChecked();

    rerender(
      <ConfigProvider locale="en-US">
        <Uncontrolled mode="single" />
      </ConfigProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Clear selection' }));
    expect(screen.getByTestId('selected-keys')).toBeEmptyDOMElement();
  });

  it('shows loading, empty and error states with current column spans and retry', async () => {
    const retry = vi.fn();
    const { rerender } = render(<Harness source={[]} loading selection="multiple" />);
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
    expect(screen.getByRole('table').querySelector('tbody td')).toHaveAttribute('colspan', '4');
    rerender(<Harness source={[]} emptyContent="No matching people" />);
    expect(screen.getByRole('status')).toHaveTextContent('No matching people');
    rerender(<Harness source={[]} error="Request failed" onRetry={retry} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Request failed');
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(retry).toHaveBeenCalledOnce();
  });

  it('isolates internal fields from a surrounding FormField', () => {
    render(
      <Form>
        <FormField label="People" required>
          <Harness selection="multiple" />
        </FormField>
      </Form>,
    );
    expect(screen.getAllByRole('checkbox').every((input) => !input.hasAttribute('required'))).toBe(
      true,
    );
    const ids = [...document.querySelectorAll('[id]')].map((element) => element.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('blocks sorting, selection, expansion, resize and pagination during refresh without replacing rows', () => {
    render(<Harness loading selection="multiple" resizable renderExpandedRow={() => 'Details'} />);
    expect(screen.getByRole('button', { name: 'Name: Sort ascending' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Expand row: Alice' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'Select row: Alice' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'Select all rows on this page' })).toBeDisabled();
    expect(screen.getByRole('separator', { name: 'Resize column: Name' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    expect(bodyNames()).toEqual(['Alice', 'Bob']);
  });

  it('renders grouped and aggregated cells from the TanStack row model', () => {
    const groupedColumns: ColumnDef<Person>[] = [
      { accessorKey: 'team', header: 'Team' },
      {
        accessorKey: 'age',
        header: 'Age',
        aggregationFn: 'sum',
        aggregatedCell: ({ getValue }) => `Total ${getValue()}`,
      },
    ];
    function Grouped() {
      const table = useReactTable({
        data,
        columns: groupedColumns,
        getCoreRowModel: getCoreRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        initialState: { grouping: ['team'] },
      });
      return <DataTable table={table} pagination={false} />;
    }
    render(<Grouped />);
    expect(screen.getByText('Total 77')).toBeInTheDocument();
    expect(screen.getByText('Total 50')).toBeInTheDocument();
  });

  it('server-renders data and virtual counts deterministically', () => {
    const markup = renderToString(<Harness pageSize={4} virtual pagination={false} />);
    expect(markup).toContain('aria-rowcount="5"');
    expect(markup).toContain('aria-rowindex="2"');
    expect(markup).toContain('Alice');
    expect(markup).not.toContain('role="grid"');
  });

  it('hides both rows of retained grouped records when a group collapses', async () => {
    function Grouped() {
      const table = useReactTable({
        data,
        columns,
        getRowId: (person) => person.id,
        getCoreRowModel: getCoreRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        initialState: { grouping: ['team'], expanded: true },
      });
      return (
        <ConfigProvider locale="en-US">
          <DataTable
            table={table}
            pagination={false}
            renderRowHeader={(row) => `Summary ${row.id}`}
          />
        </ConfigProvider>
      );
    }
    render(<Grouped />);
    const header = screen.getByText('Summary alice').closest('tr');
    const record = header?.nextElementSibling;
    expect(header).not.toHaveAttribute('hidden');
    await userEvent.click(screen.getByRole('button', { name: 'Collapse row: team:Design' }));
    expect(header).toHaveAttribute('hidden');
    expect(record).toHaveAttribute('hidden');
    expect(header).toHaveAttribute('aria-hidden', 'true');
    await userEvent.click(screen.getByRole('button', { name: 'Expand row: team:Design' }));
    expect(screen.getByText('Summary alice').closest('tr')).toBe(header);
    expect(header).not.toHaveAttribute('hidden');
    expect(record).not.toHaveAttribute('hidden');
  });

  it('counts information, data and visible detail rows in virtual table semantics', () => {
    const markup = renderToString(
      <DataTable
        data={data}
        columns={columns}
        rowKey="id"
        virtual
        pagination={false}
        selection="single"
        renderRowHeader={(row) => `Summary ${row.original.name}`}
        renderExpandedRow={() => 'Details'}
        options={{ initialState: { expanded: { alice: true } } }}
      />,
    );
    const container = document.createElement('div');
    container.innerHTML = markup;
    expect(container.querySelector('table')).toHaveAttribute('aria-rowcount', '10');
    expect(container.querySelector('[data-row-header="alice"]')).toHaveAttribute(
      'aria-rowindex',
      '2',
    );
    expect(container.querySelector('[data-row-id="alice"]')).toHaveAttribute('aria-rowindex', '3');
    expect(container.querySelector('[data-detail-row="alice"]')).toHaveAttribute(
      'aria-rowindex',
      '4',
    );
    expect(container.querySelector('[data-row-header="bob"]')).toHaveAttribute(
      'aria-rowindex',
      '5',
    );
    expect(container.querySelector('[data-row-id="bob"]')).toHaveAttribute('aria-rowindex', '6');
    expect(container.querySelectorAll('input[type="radio"]')).toHaveLength(4);
    expect(container.querySelector('input[type="radio"]')?.closest('td')).toHaveAttribute(
      'rowspan',
      '2',
    );
  });
});
