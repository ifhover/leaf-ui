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
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, useState } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { ConfigProvider } from '../config-provider';
import { Form, FormField } from '../form';
import { useDataTableSelection } from './selection';
import { DataTable, type DataTableInstanceProps, useDataTable } from './tabletanstack';

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
  children,
  ...props
}: Omit<DataTableInstanceProps<Person>, 'table'> & {
  source?: Person[];
  customColumns?: ColumnDef<Person>[];
  pageSize?: number;
  manual?: boolean;
  pageCount?: number;
  onState?: (table: TanStackTable<Person>) => void;
  children?: ReactNode;
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
      >
        {children}
      </DataTable>
    </ConfigProvider>
  );
}

const bodyNames = () =>
  [...screen.getByRole('table').querySelectorAll('tbody tr[data-row-id]')].map(
    (row) => row.querySelector('td:not(.leaf-data-table__utility)')?.textContent,
  );

describe('DataTable TanStack adapter', () => {
  it('does not expose or forward the obsolete fixed-header switch', () => {
    expectTypeOf<DataTableInstanceProps<Person>>().not.toHaveProperty('stickyHeader');
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
    expect(table.closest('.leaf-table')?.querySelector('.leaf-table__panel')).toBeInTheDocument();
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

  it('separates local slicing from default pagination visibility', () => {
    let instance: TanStackTable<Person> | undefined;
    function HookTable() {
      const table = useDataTable({
        data,
        columns,
        rowKey: 'id',
        localPagination: true,
        pagination: false,
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

  it('warns and disables search when the instance has no filtering model', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    function CoreOnly() {
      const table = useReactTable({
        data,
        columns,
        getRowId: (row) => row.id,
        getCoreRowModel: getCoreRowModel(),
      });
      return (
        <DataTable table={table}>
          <DataTable.Toolbar>
            <DataTable.Search />
          </DataTable.Toolbar>
          <DataTable.Content />
        </DataTable>
      );
    }
    render(
      <ConfigProvider locale="en-US">
        <CoreOnly />
      </ConfigProvider>,
    );
    expect(screen.getByRole('textbox', { name: 'Search table' })).toBeDisabled();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('getFilteredRowModel'));
    warn.mockRestore();
  });

  it('warns and disables search for a missing or unfilterable column', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const unfilterable = [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'team', header: 'Team', enableColumnFilter: false },
    ] satisfies ColumnDef<Person>[];
    function SearchTable({ columnId }: { columnId: string }) {
      const table = useReactTable({
        data,
        columns: unfilterable,
        getRowId: (row) => row.id,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
      });
      return (
        <DataTable table={table}>
          <DataTable.Toolbar>
            <DataTable.Search columnId={columnId} />
          </DataTable.Toolbar>
          <DataTable.Content />
        </DataTable>
      );
    }
    const { rerender } = render(
      <ConfigProvider locale="en-US">
        <SearchTable columnId="missing" />
      </ConfigProvider>,
    );
    expect(screen.getByRole('textbox', { name: 'Search table' })).toBeDisabled();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('does not match any'));
    warn.mockClear();
    rerender(
      <ConfigProvider locale="en-US">
        <SearchTable columnId="team" />
      </ConfigProvider>,
    );
    expect(screen.getByRole('textbox', { name: 'Search table' })).toBeDisabled();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('cannot filter column'));
    warn.mockRestore();
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

  it('supports manual model capabilities without installing local row models', () => {
    function ManualOnly() {
      const table = useReactTable({
        data,
        columns,
        getRowId: (row) => row.id,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        rowCount: 60,
      });
      return (
        <DataTable table={table}>
          <DataTable.Toolbar>
            <DataTable.Search />
          </DataTable.Toolbar>
          <DataTable.Content />
          <DataTable.Footer>
            <DataTable.Pagination />
          </DataTable.Footer>
        </DataTable>
      );
    }
    render(
      <ConfigProvider locale="en-US">
        <ManualOnly />
      </ConfigProvider>,
    );
    expect(screen.getByRole('button', { name: 'Name: Sort ascending' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Search table' })).toBeEnabled();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
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
        <DataTable
          data={data}
          columns={columns}
          rowKey="id"
          selection="multiple"
          options={selection.selectionOptions}
          toolbar={<span>{selection.selectedRowKeys.join(',')}</span>}
        />
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

  it('keeps implicit children as a legacy custom layout and warns once', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <ConfigProvider locale="en-US">
        <DataTable data={data} columns={columns} rowKey="id">
          <DataTable.Content />
        </DataTable>
      </ConfigProvider>,
    );
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('layout="custom"'));
    warn.mockRestore();
  });

  it('uses explicit automatic and custom layouts without guessing from children', () => {
    const { rerender } = render(
      <ConfigProvider locale="en-US">
        <DataTable data={data} columns={columns} rowKey="id" layout="auto">
          <p>Ignored custom layout</p>
        </DataTable>
      </ConfigProvider>,
    );
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.queryByText('Ignored custom layout')).not.toBeInTheDocument();

    rerender(
      <ConfigProvider locale="en-US">
        <DataTable data={data} columns={columns} rowKey="id" layout="custom">
          <p>Explicit custom layout</p>
        </DataTable>
      </ConfigProvider>,
    );
    expect(screen.getByText('Explicit custom layout')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('prefers columnDividers over the deprecated bordered alias', () => {
    const { rerender } = render(
      <DataTable
        data={data}
        columns={columns}
        rowKey="id"
        columnDividers
        bordered={false}
        pagination={false}
      />,
    );
    expect(screen.getByRole('table').closest('.leaf-table')).toHaveClass(
      'leaf-table--column-dividers',
    );

    rerender(
      <DataTable
        data={data}
        columns={columns}
        rowKey="id"
        columnDividers={false}
        bordered
        pagination={false}
      />,
    );
    expect(screen.getByRole('table').closest('.leaf-table')).not.toHaveClass(
      'leaf-table--column-dividers',
    );
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

  it('filters a column and global search without a second filter store', async () => {
    let instance: TanStackTable<Person> | undefined;
    render(
      <Harness
        onState={(table) => {
          instance = table;
        }}
      >
        <DataTable.Toolbar>
          <DataTable.Search columnId="name" />
        </DataTable.Toolbar>
        <DataTable.Content />
      </Harness>,
    );
    await userEvent.type(screen.getByRole('textbox', { name: 'Search table' }), 'char');
    expect(instance?.getState().columnFilters).toEqual([{ id: 'name', value: 'char' }]);
    expect(bodyNames()).toEqual(['Charlie']);
    await userEvent.click(screen.getByRole('button', { name: 'Clear input' }));
    await waitFor(() => expect(bodyNames()).toEqual(['Alice', 'Bob']));
  });

  it('paginates from the same TanStack instance and changes page size', async () => {
    let instance: TanStackTable<Person> | undefined;
    render(
      <Harness
        onState={(table) => {
          instance = table;
        }}
      >
        <DataTable.Content />
        <DataTable.Pagination pageSizeOptions={[2, 4]} />
      </Harness>,
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

  it('offers explicit select-all semantics and single selection', async () => {
    let instance: TanStackTable<Person> | undefined;
    const { unmount } = render(
      <Harness
        selection="multiple"
        selectAllMode="all"
        onState={(table) => {
          instance = table;
        }}
      />,
    );
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select all rows' }));
    expect(instance?.getState().rowSelection).toEqual({ alice: true, charlie: true, dana: true });
    unmount();
    render(
      <Harness
        selection="single"
        pageSize={4}
        onState={(table) => {
          instance = table;
        }}
      />,
    );
    await userEvent.click(screen.getByRole('radio', { name: 'Select row: Alice' }));
    await userEvent.click(screen.getByRole('radio', { name: 'Select row: Dana' }));
    expect(instance?.getState().rowSelection).toEqual({ dana: true });
    expect(screen.getByRole('radio', { name: 'Select row: Alice' })).not.toBeChecked();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
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

  it('expands hierarchical rows through the supplied row model', async () => {
    const source = [{ ...(data[0] as Person), children: [data[2] as Person] }];
    render(<Harness source={source} pageSize={4} pagination={false} />);
    expect(bodyNames()).toEqual(['Alice']);
    await userEvent.click(screen.getByRole('button', { name: 'Expand row: Alice' }));
    expect(bodyNames()).toEqual(['Alice', 'Charlie']);
  });

  it('hides columns while respecting enableHiding', async () => {
    let instance: TanStackTable<Person> | undefined;
    render(
      <Harness
        onState={(table) => {
          instance = table;
        }}
      >
        <DataTable.Toolbar>
          <DataTable.ColumnVisibility />
        </DataTable.Toolbar>
        <DataTable.Content />
      </Harness>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Columns' }));
    expect(screen.getByRole('checkbox', { name: 'Name' })).toBeDisabled();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Age' }));
    expect(instance?.getState().columnVisibility.age).toBe(false);
    expect(screen.queryByRole('columnheader', { name: /Age/ })).not.toBeInTheDocument();
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
      <Harness manual pageCount={-1}>
        <DataTable.Content />
        <DataTable.Pagination hasNextPage={false} variant="ghost" size="sm" />
      </Harness>,
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

  it('keeps automatic content and configurable pagination when adding a toolbar', async () => {
    render(
      <ConfigProvider locale="en-US">
        <DataTable
          data={data}
          columns={columns}
          rowKey="id"
          toolbar={<DataTable.Search columnId="name" />}
          pagination={{ showSizeChanger: false, showTotal: true, 'aria-label': 'People pages' }}
          options={{ initialState: { pagination: { pageIndex: 0, pageSize: 2 } } }}
        />
      </ConfigProvider>,
    );
    expect(bodyNames()).toEqual(['Alice', 'Bob']);
    expect(screen.getByRole('navigation', { name: 'People pages' })).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    await userEvent.type(screen.getByRole('textbox', { name: 'Search table' }), 'char');
    expect(bodyNames()).toEqual(['Charlie']);
  });

  it('resets the local page after filtering while pagination is temporarily disabled', async () => {
    function ToggleTable() {
      const [pagination, setPagination] = useState(true);
      return (
        <DataTable
          data={data}
          columns={columns}
          rowKey="id"
          options={{ initialState: { pagination: { pageIndex: 0, pageSize: 2 } } }}
          pagination={pagination}
          toolbar={
            <>
              <button type="button" onClick={() => setPagination((value) => !value)}>
                Toggle
              </button>
              <DataTable.Search columnId="name" />
            </>
          }
        />
      );
    }
    render(
      <ConfigProvider locale="en-US">
        <ToggleTable />
      </ConfigProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(bodyNames()).toEqual(['Charlie', 'Dana']);
    await userEvent.click(screen.getByRole('button', { name: 'Toggle' }));
    await userEvent.type(screen.getByRole('textbox', { name: 'Search table' }), 'alice');
    expect(bodyNames()).toEqual(['Alice']);
    await userEvent.click(screen.getByRole('button', { name: 'Toggle' }));
    expect(bodyNames()).toEqual(['Alice']);
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

  it('isolates automatic parts from public part defaults while resolving root defaults', () => {
    render(
      <ConfigProvider
        components={{
          DataTable: { toolbar: 'Default toolbar', pagination: { showSizeChanger: false } },
          DataTableToolbar: { id: 'explicit-toolbar' },
          DataTablePagination: { id: 'explicit-pagination' },
        }}
      >
        <DataTable data={data} columns={columns} rowKey="id" />
        <DataTable data={data} columns={columns} rowKey="id">
          <DataTable.Toolbar>Explicit toolbar</DataTable.Toolbar>
          <DataTable.Content />
          <DataTable.Pagination />
        </DataTable>
      </ConfigProvider>,
    );
    expect(screen.getByText('Default toolbar')).not.toHaveAttribute('id');
    expect(screen.getByText('Explicit toolbar')).toHaveAttribute('id', 'explicit-toolbar');
    const pages = screen.getAllByRole('navigation');
    expect(pages[0]).not.toHaveAttribute('id');
    expect(pages[1]).toHaveAttribute('id', 'explicit-pagination');
  });

  it('lets explicit children replace the automatic toolbar, content and pagination', () => {
    render(
      <DataTable data={data} columns={columns} rowKey="id" toolbar="Automatic toolbar">
        <p>Custom layout</p>
      </DataTable>,
    );
    expect(screen.getByText('Custom layout')).toBeInTheDocument();
    expect(screen.queryByText('Automatic toolbar')).not.toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
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
        pagination,
        options: { initialState: { pagination: { pageIndex: 0, pageSize: 2 } } },
      });
      instance = table;
      return (
        <DataTable
          table={table}
          pagination={pagination}
          toolbar={
            <button type="button" onClick={() => table.resetSorting()}>
              Reset sorting
            </button>
          }
        />
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

  it('allows search to opt out of its default clear action', async () => {
    function SearchWithoutClear() {
      const table = useDataTable({ data, columns, rowKey: 'id', localPagination: false });
      return (
        <DataTable table={table} layout="custom" pagination={false}>
          <DataTable.Toolbar>
            <DataTable.Search allowClear={false} />
          </DataTable.Toolbar>
          <DataTable.Content />
        </DataTable>
      );
    }
    render(
      <ConfigProvider locale="en-US">
        <SearchWithoutClear />
      </ConfigProvider>,
    );
    await userEvent.type(screen.getByRole('textbox', { name: 'Search table' }), 'Alice');
    expect(screen.queryByRole('button', { name: 'Clear input' })).not.toBeInTheDocument();
  });

  it('supports uncontrolled multiple and single selections through the helper', async () => {
    function Uncontrolled({ mode }: { mode: 'single' | 'multiple' }) {
      const selection = useDataTableSelection({
        mode,
        defaultSelectedRowKeys: mode === 'single' ? ['alice', 'bob'] : ['alice'],
      });
      return (
        <DataTable
          data={data}
          columns={columns}
          rowKey="id"
          selection={mode}
          options={selection.selectionOptions}
          pagination={false}
          toolbar={
            <>
              <span data-testid="selected-keys">{selection.selectedRowKeys.join(',')}</span>
              <button type="button" onClick={selection.clearSelection}>
                Clear selection
              </button>
            </>
          }
        />
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

  it('exposes accessible reordering handles only in supported data modes', async () => {
    render(<Harness onRowReorder={vi.fn()} columnReordering pagination={false} />);
    expect(screen.getByRole('button', { name: 'Reorder row: Alice' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reorder column: Name' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Name: Sort ascending' }));
    expect(screen.queryByRole('button', { name: 'Reorder row: Alice' })).not.toBeInTheDocument();
  });

  it('isolates internal fields from a surrounding FormField', () => {
    render(
      <Form>
        <FormField label="People" required>
          <Harness selection="multiple">
            <DataTable.Search />
            <DataTable.Content />
          </Harness>
        </FormField>
      </Form>,
    );
    const inputs = screen.getAllByRole('checkbox');
    expect(inputs.every((input) => !input.hasAttribute('required'))).toBe(true);
    expect(screen.getByRole('textbox', { name: 'Search table' })).not.toBeRequired();
    const ids = [...document.querySelectorAll('[id]')].map((element) => element.id);
    expect(new Set(ids).size).toBe(ids.length);
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

  it('blocks sort, selection, pagination and search during refresh without replacing rows', () => {
    render(
      <Harness loading selection="multiple" renderExpandedRow={() => 'Details'}>
        <DataTable.Search />
        <DataTable.Content />
        <DataTable.Pagination />
      </Harness>,
    );
    expect(screen.getByRole('button', { name: 'Name: Sort ascending' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Expand row: Alice' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'Select row: Alice' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: 'Search table' })).toBeDisabled();
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

  it('errors clearly when composed parts are outside a DataTable', () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<DataTable.Search />)).toThrow(
      'DataTable parts must be rendered inside DataTable.',
    );
    log.mockRestore();
  });
});
