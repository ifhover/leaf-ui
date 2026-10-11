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
import { describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from '../config-provider';
import { Form, FormField } from '../form';
import { DataTable, type DataTableProps } from './tabletanstack';

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
}: Omit<DataTableProps<Person>, 'table'> & {
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

  it('checks the stable row key contract in convenience mode', () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
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
    render(
      <Harness
        renderExpandedRow={renderDetail}
        onState={(table) => {
          instance = table;
        }}
      />,
    );
    const opener = screen.getByRole('button', { name: 'Expand row: Alice' });
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
        <DataTable.Pagination hasNextPage={false} />
      </Harness>,
    );
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('does not truncate convenience-mode data when pagination is disabled', () => {
    const source = Array.from({ length: 14 }, (_, index) => ({
      ...(data[0] as Person),
      id: String(index),
    }));
    render(<DataTable data={source} columns={columns} rowKey="id" pagination={false} />);
    expect(screen.getByRole('table').querySelectorAll('tbody tr[data-row-id]')).toHaveLength(14);
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
      <Harness loading selection="multiple">
        <DataTable.Search />
        <DataTable.Content />
        <DataTable.Pagination />
      </Harness>,
    );
    expect(screen.getByRole('button', { name: 'Name: Sort ascending' })).toBeDisabled();
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
