import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from '../config-provider';
import { Pagination } from './pagination';

describe('Pagination', () => {
  it('bounds button count for large totals and clamps when total shrinks', async () => {
    const change = vi.fn();
    const { rerender } = render(
      <ConfigProvider locale="en-US">
        <Pagination total={1_000_000} defaultCurrent={50} onChange={change} />
      </ConfigProvider>,
    );
    expect(screen.getAllByRole('button').length).toBeLessThanOrEqual(9);
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(change).toHaveBeenLastCalledWith(51, 10);
    rerender(
      <ConfigProvider locale="en-US">
        <Pagination total={20} defaultCurrent={50} />
      </ConfigProvider>,
    );
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });
  it('changes page size while preserving item position and supports bounded jumps', async () => {
    const change = vi.fn();
    render(
      <ConfigProvider locale="en-US">
        <Pagination
          total={120}
          defaultCurrent={3}
          showSizeChanger
          showQuickJumper
          onChange={change}
        />
      </ConfigProvider>,
    );
    await userEvent.click(screen.getByRole('combobox', { name: 'Page size' }));
    await userEvent.click(screen.getByRole('option', { name: '20 / page' }));
    expect(change).toHaveBeenLastCalledWith(2, 20);
    const jump = screen.getByRole('spinbutton', { name: 'Go to' });
    fireEvent.change(jump, { target: { value: '999' } });
    fireEvent.keyDown(jump, { key: 'Enter' });
    expect(change).toHaveBeenLastCalledWith(6, 20);
    expect(jump).toHaveValue('6');
  });
});
