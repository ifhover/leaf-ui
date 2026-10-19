import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from '../config-provider';
import { TableControl as Table } from './table';

describe('Table', () => {
  it('preserves native table semantics, header scopes, spans, caption and refs', () => {
    const ref = createRef<HTMLTableElement>();
    const scrollRef = createRef<HTMLDivElement>();
    render(
      <Table
        ref={ref}
        scrollRef={scrollRef}
        aria-label="People"
        minWidth={640}
        maxHeight={280}
        stickyHeader
      >
        <Table.Caption>Team members</Table.Caption>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader colSpan={2} scope="colgroup">
              Contact
            </Table.ColumnHeader>
          </Table.Row>
          <Table.Row>
            <Table.ColumnHeader>Name</Table.ColumnHeader>
            <Table.ColumnHeader>Email</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row selected>
            <Table.Cell>Alice</Table.Cell>
            <Table.Cell>alice@example.com</Table.Cell>
          </Table.Row>
        </Table.Body>
        <Table.Footer>
          <Table.Row>
            <Table.Cell colSpan={2}>One member</Table.Cell>
          </Table.Row>
        </Table.Footer>
      </Table>,
    );
    const table = screen.getByRole('table', { name: 'People' });
    expect(ref.current).toBe(table);
    expect(table).not.toHaveAttribute('role', 'grid');
    expect(table.parentElement).toHaveStyle({ minWidth: '640px' });
    expect(scrollRef.current?.parentElement).toHaveStyle({ maxHeight: '280px' });
    expect(scrollRef.current).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveAttribute('scope', 'col');
    expect(screen.getByRole('columnheader', { name: 'Contact' })).toHaveAttribute(
      'scope',
      'colgroup',
    );
    expect(screen.getByText('Alice').closest('tr')).toHaveAttribute('data-selected', 'true');
  });

  it('supports pinned logical sides and local cell styles without obsolete align attributes', () => {
    render(
      <Table>
        <Table.Body>
          <Table.Row>
            <Table.Cell pinned="end" pinOffset={80} pinEdge align="end" style={{ color: 'red' }}>
              Pinned
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    );
    const cell = screen.getByRole('cell', { name: 'Pinned' });
    expect(cell).toHaveAttribute('data-pinned', 'end');
    expect(cell).toHaveStyle({ insetInlineEnd: '80px', textAlign: 'end', color: 'rgb(255, 0, 0)' });
    expect(cell).not.toHaveAttribute('align');
  });

  it('renders localized empty, loading and retryable error rows', async () => {
    const retry = vi.fn();
    const { rerender } = render(
      <ConfigProvider locale="en-US">
        <Table>
          <Table.Body>
            <Table.Empty colSpan={3} />
          </Table.Body>
        </Table>
      </ConfigProvider>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('No data');
    expect(screen.getByRole('cell')).toHaveAttribute('colspan', '3');
    rerender(
      <ConfigProvider locale="en-US">
        <Table>
          <Table.Body>
            <Table.Loading />
          </Table.Body>
        </Table>
      </ConfigProvider>,
    );
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
    rerender(
      <ConfigProvider locale="en-US">
        <Table>
          <Table.Body>
            <Table.Error onRetry={retry} />
          </Table.Body>
        </Table>
      </ConfigProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(retry).toHaveBeenCalledOnce();
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to load data');
  });

  it('keeps existing rows during loading and blocks their interactions', () => {
    render(
      <Table loading aria-label="Refresh">
        <Table.Body>
          <Table.Row>
            <Table.Cell>
              <button type="button">Edit</button>
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    );
    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true');
    expect(
      screen.getByRole('button', { name: 'Edit' }).closest('.leaf-table__scroll-area'),
    ).toHaveAttribute('inert');
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('server-renders without browser globals or a headless engine', () => {
    const markup = renderToString(
      <Table aria-label="Server">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Name</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Empty />
        </Table.Body>
      </Table>,
    );
    expect(markup).toContain('<table');
    expect(markup).toContain('<thead');
    expect(markup).toContain('scope="col"');
    expect(markup).not.toContain('role="grid"');
  });
});
