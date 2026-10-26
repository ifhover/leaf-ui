import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from '../config-provider';
import { TableControl as Table } from './table';

describe('Table', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('ignores stripes and column dividers in simple mode and restores them when switched back', () => {
    const { rerender } = render(<Table variant="simple" striped columnDividers />);
    const root = screen.getByRole('table').closest('.leaf-table');
    expect(root).toHaveClass('leaf-table--simple');
    expect(root).not.toHaveClass('leaf-table--striped');
    expect(root).not.toHaveClass('leaf-table--column-dividers');
    expect(screen.getByRole('table')).not.toHaveAttribute('variant');
    rerender(<Table variant="layered" striped columnDividers />);
    expect(screen.getByRole('table').closest('.leaf-table')).toBe(root);
    expect(root).not.toHaveClass('leaf-table--simple');
    expect(root).toHaveClass('leaf-table--striped', 'leaf-table--column-dividers');
  });

  it('preserves native table semantics, header scopes, spans and refs', () => {
    const ref = createRef<HTMLTableElement>();
    const scrollRef = createRef<HTMLDivElement>();
    render(
      <Table ref={ref} scrollRef={scrollRef} aria-label="People" minWidth={640} maxHeight={280}>
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

  it('temporarily scrolls adapter pins when they no longer fit without changing native pins', async () => {
    const scrollRef = createRef<HTMLDivElement>();
    const content = (
      <>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader pinned="start">Name</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell pinned="end" pinOffset={80}>
              Pinned
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </>
    );
    const { rerender } = render(
      <Table scrollRef={scrollRef} pinnedWidth={300}>
        {content}
      </Table>,
    );
    const viewport = scrollRef.current;
    if (!viewport) throw new Error('Missing table viewport');
    let width = 283;
    Object.defineProperty(viewport, 'clientWidth', { get: () => width });
    fireEvent(window, new Event('resize'));
    const header = screen.getByRole('columnheader', { name: 'Name' });
    const cell = screen.getByRole('cell', { name: 'Pinned' });
    await waitFor(() => expect(cell).toHaveStyle({ position: 'relative', insetInlineEnd: 'auto' }));
    expect(header).toHaveStyle({ position: 'relative' });
    expect(cell).toHaveAttribute('data-pinned', 'end');
    width = 500;
    fireEvent(window, new Event('resize'));
    await waitFor(() => expect(cell).toHaveStyle({ position: 'sticky', insetInlineEnd: '80px' }));
    expect(header).toHaveStyle({ position: 'sticky', insetInlineStart: '0px' });
    rerender(
      <Table scrollRef={scrollRef} pinnedWidth={600}>
        {content}
      </Table>,
    );
    expect(cell).toHaveStyle({ position: 'relative' });
    rerender(<Table scrollRef={scrollRef}>{content}</Table>);
    expect(cell).toHaveStyle({ position: 'sticky', insetInlineEnd: '80px' });
    expect(header).toHaveStyle({ position: 'sticky' });
  });

  it('contains overflowing boundary wheels in older browsers without hijacking other scrolling', () => {
    vi.stubGlobal('CSS', { ...CSS, supports: () => false });
    const scrollRef = createRef<HTMLDivElement>();
    const { unmount } = render(
      <Table scrollRef={scrollRef}>
        <Table.Body>
          <Table.Row>
            <Table.Cell>
              <div data-testid="nested" style={{ overflowY: 'auto' }} />
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    );
    const viewport = scrollRef.current as HTMLDivElement;
    let height = 200;
    Object.defineProperties(viewport, {
      clientHeight: { value: 200 },
      scrollHeight: { get: () => height },
    });
    expect(fireEvent.wheel(viewport, { deltaY: 120 })).toBe(true);
    height = 600;
    expect(fireEvent.wheel(viewport, { deltaY: -120 })).toBe(false);
    expect(fireEvent.wheel(viewport, { deltaY: 120 })).toBe(true);
    viewport.scrollTop = 200;
    expect(fireEvent.wheel(viewport, { deltaY: -120 })).toBe(true);
    expect(fireEvent.wheel(viewport, { deltaY: 120 })).toBe(true);
    viewport.scrollTop = 400;
    expect(fireEvent.wheel(viewport, { deltaY: 120 })).toBe(false);
    expect(fireEvent.wheel(viewport, { deltaY: -120 })).toBe(true);
    expect(fireEvent.wheel(viewport, { deltaX: 160, deltaY: 20 })).toBe(true);
    expect(fireEvent.wheel(viewport, { deltaY: 120, ctrlKey: true })).toBe(true);
    expect(fireEvent.wheel(viewport, { deltaY: 120, shiftKey: true })).toBe(true);
    const nested = screen.getByTestId('nested');
    Object.defineProperties(nested, {
      clientHeight: { value: 50 },
      scrollHeight: { value: 150 },
    });
    expect(fireEvent.wheel(nested, { deltaY: 120 })).toBe(true);
    nested.scrollTop = 100;
    expect(fireEvent.wheel(nested, { deltaY: 120 })).toBe(false);
    unmount();
    expect(fireEvent.wheel(viewport, { deltaY: 120 })).toBe(true);
  });

  it('leaves wheel containment to CSS in supporting browsers', () => {
    vi.stubGlobal('CSS', { ...CSS, supports: () => true });
    const scrollRef = createRef<HTMLDivElement>();
    render(<Table scrollRef={scrollRef} />);
    const viewport = scrollRef.current as HTMLDivElement;
    Object.defineProperties(viewport, {
      clientHeight: { value: 200 },
      scrollHeight: { value: 600 },
    });
    expect(fireEvent.wheel(viewport, { deltaY: -120 })).toBe(true);
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
    expect(screen.getByRole('alert')).toHaveClass('leaf-result', 'leaf-result--danger');
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
