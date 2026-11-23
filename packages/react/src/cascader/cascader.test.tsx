import { render, screen, waitFor, within } from '@testing-library/react';
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
  it('keeps selected paths from other branches when switching the first level in multiple mode', async () => {
    render(<Cascader multiple options={options} aria-label="地区" />);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('option', { name: '浙江' }));
    await userEvent.click(screen.getByRole('option', { name: '杭州' }));
    await userEvent.click(screen.getByRole('option', { name: '西湖' }));

    await userEvent.click(screen.getByRole('option', { name: '江苏' }));
    expect(screen.getByRole('combobox')).toHaveTextContent('浙江 / 杭州 / 西湖');

    const secondLevel = screen.getByRole('listbox', { name: '第 2 级' });
    await userEvent.click(within(secondLevel).getByRole('option', { name: '南京' }));
    const combobox = screen.getByRole('combobox');
    expect(within(combobox).getByTitle('浙江 / 杭州 / 西湖')).toBeInTheDocument();
    expect(within(combobox).getByTitle('江苏 / 南京')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('option', { name: '浙江' }));
    expect(
      within(screen.getByRole('listbox', { name: '第 2 级' })).getByRole('option', {
        name: '杭州',
      }),
    ).toHaveAttribute('aria-selected', 'true');
  });
  it('restores the committed descendants after browsing another first-level branch', async () => {
    render(
      <Cascader
        options={options}
        defaultValue={['zhejiang', 'hangzhou', 'xihu']}
        aria-label="地区"
      />,
    );
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('option', { name: '江苏' }));
    await userEvent.click(screen.getByRole('option', { name: '浙江' }));

    expect(
      within(screen.getByRole('listbox', { name: '第 2 级' })).getByRole('option', {
        name: '杭州',
      }),
    ).toHaveAttribute('aria-selected', 'true');
    expect(
      within(screen.getByRole('listbox', { name: '第 3 级' })).getByRole('option', {
        name: '西湖',
      }),
    ).toHaveAttribute('aria-selected', 'true');
  });
  it('still selects an intermediate first-level option when changeOnSelect is enabled', async () => {
    const onChange = vi.fn();
    render(
      <Cascader
        options={options}
        defaultValue={['zhejiang', 'hangzhou', 'xihu']}
        changeOnSelect
        onChange={onChange}
        aria-label="地区"
      />,
    );
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('option', { name: '浙江' }));

    expect(onChange).toHaveBeenLastCalledWith(['zhejiang'], expect.any(Array));
    expect(
      within(screen.getByRole('listbox', { name: '第 2 级' })).getByRole('option', {
        name: '杭州',
      }),
    ).toHaveAttribute('aria-selected', 'false');
  });
  it('defaults popupWidth to auto and supports trigger width, maxWidth and horizontal scroll container', async () => {
    const { rerender } = render(<Cascader options={options} aria-label="地区" open />);
    const panel = () => document.querySelector('.leaf-cascader__panel') as HTMLElement;
    await waitFor(() => {
      expect(panel()).toHaveAttribute('data-popup-width', 'auto');
      expect(panel().style.width).toBe('max-content');
    });
    expect(document.querySelector('.leaf-cascader__columns-scroll')).toHaveAttribute(
      'data-orientation',
      'horizontal',
    );

    rerender(<Cascader options={options} aria-label="地区" popupWidth="trigger" open />);
    await waitFor(() => {
      expect(panel()).toHaveAttribute('data-popup-width', 'trigger');
    });

    rerender(
      <Cascader options={options} aria-label="地区" popupWidth={300} popupMaxWidth={360} open />,
    );
    await waitFor(() => {
      expect(panel()).toHaveAttribute('data-popup-width', 'fixed');
      expect(panel().style.width).toBe('300px');
    });
  });
  it('focuses and resets search input, navigates search results with keyboard, and avoids focus jump on mouse clicks', async () => {
    render(<Cascader options={options} showSearch aria-label="地区" />);
    await userEvent.click(screen.getByRole('combobox'));

    const search = screen.getByRole('textbox', { name: '搜索选项' });
    expect(search).toHaveFocus();

    await userEvent.click(screen.getByRole('option', { name: '浙江' }));
    expect(screen.getByRole('option', { name: '浙江' })).toHaveAttribute(
      'data-highlighted',
      'true',
    );
    expect(screen.getByRole('option', { name: '杭州' })).not.toHaveFocus();

    await userEvent.type(search, '西');
    expect(document.querySelector('.leaf-cascader__search-list')).toBeInTheDocument();
    expect(document.querySelector('.leaf-cascader__column')).not.toBeInTheDocument();

    await userEvent.keyboard('{ArrowDown}');
    const match = screen.getByRole('option', { name: '浙江 / 杭州 / 西湖' });
    expect(match).toHaveFocus();

    await userEvent.keyboard('{ArrowUp}');
    expect(search).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(screen.getByRole('combobox')).toHaveTextContent('浙江 / 杭州 / 西湖');

    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('textbox', { name: '搜索选项' })).toHaveValue('');
    expect(screen.getByRole('listbox', { name: '第 1 级' })).toBeInTheDocument();
  });
  it('moves keyboard focus to asynchronously loaded children once loadData completes', async () => {
    let resolveLoad!: (items: readonly CascaderOption[]) => void;
    const loadData = vi.fn(
      () =>
        new Promise<readonly CascaderOption[]>((resolve) => {
          resolveLoad = resolve;
        }),
    );
    render(
      <Cascader
        options={[{ label: '动态省份', value: 'dyn', isLeaf: false }]}
        loadData={loadData}
        aria-label="地区"
      />,
    );
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.keyboard('{ArrowRight}');
    expect(loadData).toHaveBeenCalledOnce();

    resolveLoad([{ label: '动态城市', value: 'city' }]);
    await waitFor(() => {
      expect(screen.getByRole('option', { name: '动态城市' })).toHaveFocus();
    });
  });
  it('supports removing tags via remove button and Backspace in multiple mode without nesting buttons', async () => {
    const onChange = vi.fn();
    render(
      <Cascader
        multiple
        options={options}
        defaultValue={[
          ['zhejiang', 'hangzhou', 'xihu'],
          ['jiangsu', 'nanjing'],
        ]}
        onChange={onChange}
        aria-label="地区"
      />,
    );
    const combobox = screen.getByRole('combobox');
    expect(combobox.tagName).toBe('DIV');
    expect(combobox.closest('button')).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: '移除 浙江 / 杭州 / 西湖' }));
    expect(onChange).toHaveBeenLastCalledWith([['jiangsu', 'nanjing']], expect.any(Array));
    expect(within(combobox).queryByTitle('浙江 / 杭州 / 西湖')).toBeNull();
    expect(combobox).toHaveFocus();

    await userEvent.keyboard('{Backspace}');
    expect(onChange).toHaveBeenLastCalledWith([], []);
    expect(within(combobox).queryByTitle('江苏 / 南京')).toBeNull();
  });
});
