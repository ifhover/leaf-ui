import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Cascader, type CascaderOption } from './cascader';

const options: CascaderOption[] = [
  {
    label: '浙江',
    value: 'zhejiang',
    children: [{ label: '杭州', value: 'hangzhou', children: [{ label: '西湖', value: 'xihu' }] }],
  },
  { label: '江苏', value: 'jiangsu', children: [{ label: '南京', value: 'nanjing' }] },
  { label: '不可选', value: 'disabled', disabled: true },
];
describe('Cascader', () => {
  it('expands columns and only commits the complete leaf path', async () => {
    const onChange = vi.fn();
    render(<Cascader options={options} onChange={onChange} aria-label="地区" />);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('option', { name: '浙江' }));
    expect(onChange).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('option', { name: '杭州' }));
    expect(screen.getAllByRole('listbox')).toHaveLength(3);
    await userEvent.click(screen.getByRole('option', { name: '西湖' }));
    expect(onChange).toHaveBeenCalledWith(['zhejiang', 'hangzhou', 'xihu'], expect.any(Array));
    expect(screen.getByRole('combobox')).toHaveTextContent('浙江 / 杭州 / 西湖');
    await userEvent.click(screen.getByRole('button', { name: '清除级联选择' }));
    expect(screen.getByRole('combobox')).toHaveTextContent('请选择');
  });
  it('moves between levels with arrows and drops stale descendant columns', async () => {
    render(<Cascader options={options} aria-label="地区" />);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    expect(screen.getByRole('option', { name: '西湖' })).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}{ArrowDown}{Enter}');
    expect(
      within(screen.getByRole('listbox', { name: '第 2 级' })).getByRole('option', {
        name: '南京',
      }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: '西湖' })).not.toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.getByRole('combobox')).toHaveFocus();
  });
});
