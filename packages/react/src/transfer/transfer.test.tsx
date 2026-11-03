import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from '../config-provider';
import { Transfer, type TransferItem } from './transfer';

const items = [
  { key: 'a', label: 'Ada' },
  { key: 'b', label: 'Ben' },
  { key: 'c', label: 'Carol' },
  { key: 'd', label: 'Disabled', disabled: true },
];

describe('Transfer partitions', () => {
  it('limits bulk checks to filtered enabled rows and moves all checked rows in item order', () => {
    const change = vi.fn();
    const selectionChange = vi.fn();
    const { rerender } = render(
      <ConfigProvider locale="en-US">
        <Transfer
          items={items}
          value={['c', 'd']}
          selectedKeys={['b', 'a', 'c', 'd']}
          onChange={change}
          onSelectionChange={selectionChange}
        />
      </ConfigProvider>,
    );
    fireEvent.change(screen.getByRole('textbox', { name: 'Search available items' }), {
      target: { value: 'ADA' },
    });
    const available = screen.getByRole('region', { name: 'Available' });
    expect(within(available).queryByText('Ben')).toBeNull();
    fireEvent.click(within(available).getByRole('checkbox', { name: 'Select all visible items' }));
    expect(selectionChange).toHaveBeenLastCalledWith(['b', 'c', 'd']);
    fireEvent.click(screen.getByRole('button', { name: 'Move to selected' }));
    expect(change).toHaveBeenLastCalledWith(['c', 'd', 'a', 'b'], {
      direction: 'right',
      movedKeys: ['a', 'b'],
    });
    expect(selectionChange).toHaveBeenLastCalledWith(['c', 'd']);

    rerender(
      <ConfigProvider locale="en-US">
        <Transfer
          items={items}
          value={['c', 'd', 'a', 'b']}
          selectedKeys={['c', 'd', 'a']}
          onChange={change}
          onSelectionChange={selectionChange}
        />
      </ConfigProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Move to available' }));
    expect(change).toHaveBeenLastCalledWith(['d', 'b'], {
      direction: 'left',
      movedKeys: ['a', 'c'],
    });
    expect(selectionChange).toHaveBeenLastCalledWith(['d']);
  });

  it('reuses filtered lists when checks change and updates them for new queries and data', () => {
    const value = ['c'];
    const filter = vi.fn((query: string, item: TransferItem) => String(item.label).includes(query));
    const { rerender } = render(
      <ConfigProvider locale="en-US">
        <Transfer items={items} value={value} filterOption={filter} />
      </ConfigProvider>,
    );
    filter.mockClear();
    rerender(
      <ConfigProvider locale="en-US">
        <Transfer items={items} value={value} selectedKeys={['b']} filterOption={filter} />
      </ConfigProvider>,
    );
    expect(filter).not.toHaveBeenCalled();
    expect(screen.getByRole('checkbox', { name: 'Ben' })).toBeChecked();
    fireEvent.change(screen.getByRole('textbox', { name: 'Search available items' }), {
      target: { value: 'Ada' },
    });
    expect(filter).toHaveBeenCalled();
    rerender(
      <ConfigProvider locale="en-US">
        <Transfer items={[{ key: 'new', label: 'Ada II' }]} value={value} filterOption={filter} />
      </ConfigProvider>,
    );
    expect(screen.getByRole('checkbox', { name: 'Ada II' })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Ada' })).toBeNull();
  });
});
