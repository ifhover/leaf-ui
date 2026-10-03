import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DatePicker, Select, TimePicker } from '../index';

// jsdom has no layout; preserve tabbable's disabled/tabIndex checks while omitting visibility geometry.
vi.mock('tabbable', async (importOriginal) => {
  const original = await importOriginal<typeof import('tabbable')>();
  return {
    ...original,
    tabbable: (node: Element) => original.tabbable(node, { displayCheck: 'none' }),
  };
});

describe('Floating field focus', () => {
  it('returns from the last portaled time control to the next field in the original form', async () => {
    const onOpenChange = vi.fn();
    render(
      <>
        <TimePicker aria-label="时间" allowClear={false} onOpenChange={onOpenChange} />
        <button type="button">下一个字段</button>
      </>,
    );
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.tab();
    expect(screen.getByRole('option', { name: '00', selected: true })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: '使用 09:00' })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: '下一个字段' })).toHaveFocus();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
  });

  it('returns Shift+Tab to the trigger without selecting a value and preserves month navigation focus', async () => {
    render(
      <DatePicker aria-label="日期" defaultValue={new Date(2026, 9, 15)} allowClear={false} />,
    );
    const trigger = screen.getByRole('combobox');
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole('button', { name: '下个月' }));
    expect(screen.getByRole('button', { name: '下个月' })).toHaveFocus();
    expect(screen.getByRole('button', { name: '2026-11-15' })).toHaveAttribute('tabindex', '0');
    await userEvent.click(screen.getByRole('button', { name: '上个月' }));
    await userEvent.tab({ shift: true });
    expect(trigger).toHaveFocus();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveTextContent('2026年10月15日');
  });

  it('reports Escape once and removes disabled menus without reopening when reenabled', async () => {
    const onOpenChange = vi.fn();
    const options = [{ value: 'leaf', label: 'Leaf' }];
    const { rerender } = render(
      <Select aria-label="团队" options={options} onOpenChange={onOpenChange} />,
    );
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.keyboard('{Escape}');
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
    await userEvent.click(screen.getByRole('combobox'));
    rerender(<Select aria-label="团队" options={options} onOpenChange={onOpenChange} disabled />);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
    rerender(<Select aria-label="团队" options={options} onOpenChange={onOpenChange} />);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(onOpenChange.mock.calls).toEqual([[true], [false], [true], [false]]);
  });
});
