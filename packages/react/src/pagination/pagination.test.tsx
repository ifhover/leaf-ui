import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from '../config-provider';
import { Pagination } from './pagination';

describe('Pagination', () => {
  it('reuses internal buttons without inheriting public Button defaults', async () => {
    const change = vi.fn();
    render(
      <ConfigProvider
        locale="en-US"
        components={{ Button: { loading: true, disabled: true, type: 'submit', variant: 'solid' } }}
      >
        <Pagination total={100} onChange={change} />
      </ConfigProvider>,
    );
    const prev = screen.getByRole('button', { name: 'Previous' });
    const next = screen.getByRole('button', { name: 'Next' });
    expect(prev).toHaveAttribute('data-trailing-text', '');
    expect(prev).not.toHaveAttribute('data-leading-text');
    expect(next).toHaveClass('leaf-button', 'leaf-button--text');
    expect(next).toHaveTextContent('Next');
    expect(next).toHaveAttribute('data-leading-text', '');
    expect(next).not.toHaveAttribute('data-trailing-text');
    expect(next).toHaveAttribute('type', 'button');
    expect(next).toBeEnabled();
    expect(next).not.toHaveAttribute('data-loading');
    await userEvent.click(next);
    expect(change).toHaveBeenLastCalledWith(2, 10);
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveClass('leaf-button--outline');
    expect(document.querySelector('.leaf-pagination__indicator')).toBeNull();
  });
  it('jumps across omitted pages using accessible ellipsis controls', async () => {
    const change = vi.fn();
    render(
      <ConfigProvider locale="en-US">
        <Pagination total={1000} defaultCurrent={20} onChange={change} />
      </ConfigProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Jump forward 5 pages' }));
    expect(change).toHaveBeenLastCalledWith(25, 10);
    await userEvent.click(screen.getByRole('button', { name: 'Jump back 5 pages' }));
    expect(change).toHaveBeenLastCalledWith(20, 10);
  });
  it('bounds button count for large totals and clamps when total shrinks', async () => {
    const change = vi.fn();
    const { rerender } = render(
      <ConfigProvider locale="en-US">
        <Pagination total={1_000_000} defaultCurrent={50} onChange={change} />
      </ConfigProvider>,
    );
    expect(screen.getAllByRole('button').length).toBeLessThanOrEqual(9);
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(change).toHaveBeenLastCalledWith(51, 10);
    rerender(
      <ConfigProvider locale="en-US">
        <Pagination total={20} defaultCurrent={50} />
      </ConfigProvider>,
    );
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
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
    expect(screen.queryByText('Rows per page')).not.toBeInTheDocument();
    const sizeSelect = screen.getByRole('combobox', { name: 'Page size' });
    expect(sizeSelect).toHaveAttribute('readonly');
    expect(sizeSelect).toHaveValue('10 / page');
    await userEvent.click(sizeSelect);
    await userEvent.click(screen.getByRole('option', { name: '20 / page' }));
    expect(change).toHaveBeenLastCalledWith(2, 20);
    const jump = screen.getByRole('spinbutton', { name: 'Go to' });
    expect(jump.closest('.leaf-pagination__jumper')).toHaveTextContent('Go topage');
    fireEvent.change(jump, { target: { value: '999' } });
    fireEvent.keyDown(jump, { key: 'Enter' });
    expect(change).toHaveBeenLastCalledWith(6, 20);
    expect(jump).toHaveValue('6');
  });

  it('keeps controlled values with the caller and only emits actual changes', async () => {
    const change = vi.fn();
    const { rerender } = render(
      <ConfigProvider locale="en-US">
        <Pagination total={120} current={3} pageSize={20} onChange={change} />
      </ConfigProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Page 3' }));
    expect(change).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(change).toHaveBeenCalledExactlyOnceWith(4, 20);
    expect(screen.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page');
    rerender(
      <ConfigProvider locale="en-US">
        <Pagination total={120} current={4} pageSize={20} onChange={change} />
      </ConfigProvider>,
    );
    expect(screen.getByRole('button', { name: 'Page 4' })).toHaveAttribute('aria-current', 'page');
    expect(change).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['zh-CN', '共 120 条'],
    ['zh-TW', '共 120 條'],
    ['en-US', 'Total 120 items'],
  ])('localizes boolean totals for %s', (locale, text) => {
    render(
      <ConfigProvider locale={locale}>
        <Pagination total={120} showTotal />
      </ConfigProvider>,
    );
    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it('preserves custom range rendering for partial and empty pages', () => {
    const showTotal = vi.fn((total, [start, end]) => `${start}–${end} / ${total}`);
    const { rerender } = render(<Pagination total={25} defaultCurrent={3} showTotal={showTotal} />);
    expect(showTotal).toHaveBeenLastCalledWith(25, [21, 25]);
    expect(screen.getByText('21–25 / 25')).toBeInTheDocument();
    rerender(<Pagination total={0} showTotal={showTotal} />);
    expect(showTotal).toHaveBeenLastCalledWith(0, [0, 0]);
    expect(screen.getByText('0–0 / 0')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '上一页' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '下一页' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '页 1' })).toHaveAttribute('aria-current', 'page');
  });

  it('commits jumps on leaving the region without duplicating an Enter commit', async () => {
    const change = vi.fn();
    render(
      <ConfigProvider locale="en-US">
        <Pagination total={120} current={1} showQuickJumper onChange={change} />
        <button type="button">Outside</button>
      </ConfigProvider>,
    );
    const user = userEvent.setup();
    const jump = screen.getByRole('spinbutton', { name: 'Go to' });
    await user.type(jump, '4');
    expect(change).not.toHaveBeenCalled();
    await user.keyboard('{Enter}');
    await user.click(screen.getByRole('button', { name: 'Outside' }));
    expect(change).toHaveBeenCalledExactlyOnceWith(4, 10);
    await user.clear(jump);
    await user.type(jump, '999');
    await user.click(screen.getByRole('button', { name: 'Outside' }));
    expect(change).toHaveBeenLastCalledWith(12, 10);
    expect(change).toHaveBeenCalledTimes(2);
    expect(jump).toHaveValue('12');
  });

  it('prioritizes clicked pagination actions over an uncommitted jump', async () => {
    const change = vi.fn();
    render(
      <ConfigProvider locale="en-US">
        <Pagination total={120} showQuickJumper onChange={change} />
      </ConfigProvider>,
    );
    await userEvent.type(screen.getByRole('spinbutton', { name: 'Go to' }), '4');
    await userEvent.click(screen.getByRole('button', { name: 'Page 3' }));
    expect(change).toHaveBeenCalledExactlyOnceWith(3, 10);
  });

  it('prioritizes pointer actions when a browser does not focus the clicked button', () => {
    const change = vi.fn();
    const capture = vi.fn();
    render(
      <ConfigProvider locale="en-US">
        <Pagination
          total={120}
          current={4}
          showQuickJumper
          onChange={change}
          onPointerDownCapture={capture}
        />
      </ConfigProvider>,
    );
    const jump = screen.getByRole('spinbutton', { name: 'Go to' });
    fireEvent.focus(jump);
    fireEvent.change(jump, { target: { value: '5' } });
    const page = screen.getByRole('button', { name: 'Page 3' });
    fireEvent.pointerDown(page);
    fireEvent.blur(jump, { relatedTarget: null });
    fireEvent.click(page);
    expect(change).toHaveBeenCalledExactlyOnceWith(3, 10);
    expect(capture).toHaveBeenCalledTimes(1);
  });

  it('ignores blank, invalid and composing jump input', () => {
    const change = vi.fn();
    render(
      <ConfigProvider locale="en-US">
        <Pagination total={120} showQuickJumper onChange={change} />
      </ConfigProvider>,
    );
    const jump = screen.getByRole('spinbutton', { name: 'Go to' });
    fireEvent.keyDown(jump, { key: 'Enter' });
    fireEvent.change(jump, { target: { value: 'invalid' } });
    fireEvent.keyDown(jump, { key: 'Enter' });
    fireEvent.blur(jump);
    fireEvent.change(jump, { target: { value: '4' } });
    fireEvent.keyDown(jump, { key: 'Enter', isComposing: true });
    expect(change).not.toHaveBeenCalled();
  });

  it('normalizes page-size options and includes the current size', async () => {
    render(
      <ConfigProvider locale="en-US">
        <Pagination
          total={120}
          pageSize={15}
          pageSizeOptions={[20, 20, 10.8, 0, -5, NaN, Infinity]}
          showSizeChanger
        />
      </ConfigProvider>,
    );
    await userEvent.click(screen.getByRole('combobox', { name: 'Page size' }));
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      '10 / page',
      '15 / page',
      '20 / page',
    ]);
  });

  it('retains initial out-of-list defaultPageSize after switching sizes', async () => {
    const change = vi.fn();
    render(
      <ConfigProvider locale="en-US">
        <Pagination total={120} defaultPageSize={5} showSizeChanger onChange={change} />
      </ConfigProvider>,
    );
    const sizeSelect = screen.getByRole('combobox', { name: 'Page size' });
    expect(sizeSelect).toHaveValue('5 / page');
    await userEvent.click(sizeSelect);
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      '5 / page',
      '10 / page',
      '20 / page',
      '50 / page',
      '100 / page',
    ]);
    await userEvent.click(screen.getByRole('option', { name: '20 / page' }));
    expect(change).toHaveBeenLastCalledWith(1, 20);
    await userEvent.click(sizeSelect);
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      '5 / page',
      '10 / page',
      '20 / page',
      '50 / page',
      '100 / page',
    ]);
    await userEvent.click(screen.getByRole('option', { name: '5 / page' }));
    expect(sizeSelect).toHaveValue('5 / page');
    expect(change).toHaveBeenLastCalledWith(1, 5);
  });

  it('retains controlled out-of-list pageSize values after prop updates', async () => {
    const { rerender } = render(
      <ConfigProvider locale="en-US">
        <Pagination total={120} pageSize={5} showSizeChanger />
      </ConfigProvider>,
    );
    rerender(
      <ConfigProvider locale="en-US">
        <Pagination total={120} pageSize={10} showSizeChanger />
      </ConfigProvider>,
    );
    rerender(
      <ConfigProvider locale="en-US">
        <Pagination total={120} pageSize={15} showSizeChanger />
      </ConfigProvider>,
    );
    rerender(
      <ConfigProvider locale="en-US">
        <Pagination total={120} pageSize={20} showSizeChanger />
      </ConfigProvider>,
    );
    await userEvent.click(screen.getByRole('combobox', { name: 'Page size' }));
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      '5 / page',
      '10 / page',
      '15 / page',
      '20 / page',
      '50 / page',
      '100 / page',
    ]);
  });

  it('formats zh-CN size options inside Select and appends the page unit to quick jumper', async () => {
    render(
      <ConfigProvider locale="zh-CN">
        <Pagination total={120} showSizeChanger showQuickJumper />
      </ConfigProvider>,
    );
    expect(screen.queryByText('每页显示')).not.toBeInTheDocument();
    const sizeSelect = screen.getByRole('combobox', { name: '每页条数' });
    expect(sizeSelect).toHaveValue('10 条/页');
    await userEvent.click(sizeSelect);
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      '10 条/页',
      '20 条/页',
      '50 条/页',
      '100 条/页',
    ]);
    const jump = screen.getByRole('spinbutton', { name: '跳至' });
    expect(jump.closest('.leaf-pagination__jumper')).toHaveTextContent('跳至页');
  });

  it('disables every control and hides a single-page region when requested', async () => {
    const change = vi.fn();
    const { rerender } = render(
      <ConfigProvider locale="en-US">
        <Pagination
          total={120}
          defaultCurrent={3}
          disabled
          showSizeChanger
          showQuickJumper
          onChange={change}
        />
      </ConfigProvider>,
    );
    for (const button of screen.getAllByRole('button')) expect(button).toBeDisabled();
    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.getByRole('spinbutton')).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(change).not.toHaveBeenCalled();
    rerender(<Pagination total={10} hideOnSinglePage />);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('renders labeled previous/next buttons and unclickable current page in outline variant', async () => {
    const change = vi.fn();
    render(
      <ConfigProvider locale="en-US">
        <Pagination total={100} defaultCurrent={2} size="sm" variant="outline" onChange={change} />
      </ConfigProvider>,
    );
    const prev = screen.getByRole('button', { name: 'Previous' });
    const next = screen.getByRole('button', { name: 'Next' });
    const active = screen.getByRole('button', { name: 'Page 2' });
    expect(prev).toHaveClass('leaf-button--sm', 'leaf-button--outline');
    expect(prev).toHaveTextContent('Previous');
    expect(next).toHaveClass('leaf-button--sm', 'leaf-button--outline');
    expect(next).toHaveTextContent('Next');
    expect(active).toHaveAttribute('aria-current', 'page');
    expect(active).toBeDisabled();
    await userEvent.click(active);
    expect(change).not.toHaveBeenCalled();
  });
});
