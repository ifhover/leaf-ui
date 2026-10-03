import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Select } from './select';

const options = [
  { label: '设计', value: 'design' },
  { label: '归档', value: 'archived', disabled: true },
  { label: '产品', value: 'product' },
];
describe('Select custom popup', () => {
  it('caps selections while allowing removal and collapses extra tags', async () => {
    const change = vi.fn();
    const { container } = render(
      <Select
        options={options}
        multiple
        defaultValue={['design', 'product']}
        maxCount={2}
        maxTagCount={1}
        onChange={change}
      />,
    );
    expect(container.querySelectorAll('.leaf-select__tag')).toHaveLength(2);
    expect(screen.getByText('+1')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('option', { name: '设计' }));
    expect(change).toHaveBeenLastCalledWith(['product'], [options[2]]);
    expect(screen.getByRole('option', { name: '设计' })).not.toBeDisabled();
  });
  it('disables new selections at the cap and skips them during keyboard navigation', async () => {
    render(<Select options={options} multiple maxCount={1} defaultValue={['design']} />);
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('option', { name: '产品' })).toBeDisabled();
    await userEvent.keyboard('{End}{Enter}');
    expect(screen.getByRole('option', { name: '产品' })).not.toBeDisabled();
    expect(screen.getByRole('option', { name: '设计' })).toHaveAttribute('aria-selected', 'false');
  });
  it('opens once from container padding, retains focus and keeps clear actions from reopening', async () => {
    const onOpenChange = vi.fn();
    const click = vi.fn();
    const { container } = render(
      <Select
        options={options}
        defaultValue="design"
        allowClear
        onOpenChange={onOpenChange}
        onClick={click}
      />,
    );
    const root = container.querySelector('.leaf-select') as HTMLElement;
    await userEvent.click(root);
    expect(screen.getByRole('combobox')).toHaveFocus();
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(onOpenChange.mock.calls).toEqual([[true]]);
    expect(click).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole('button', { name: '清除选择' }));
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
    expect(screen.getByRole('combobox')).toHaveValue('');
  });
  it('shows loading and custom empty content, and renders option details without changing their value', async () => {
    const { rerender } = render(<Select options={[]} loading />);
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('处理中')).toBeInTheDocument();
    rerender(<Select options={[]} notFoundContent="没有团队" />);
    expect(screen.getByText('没有团队')).toBeInTheDocument();
    rerender(
      <Select options={options} optionRender={(option) => <span>{option.label}团队</span>} />,
    );
    await userEvent.click(screen.getByRole('option', { name: '产品团队' }));
    expect(screen.getByRole('combobox')).toHaveValue('产品');
  });
  it('filters only existing options and restores selection after a discarded query', async () => {
    const change = vi.fn();
    render(<Select options={options} showSearch defaultValue="design" onChange={change} />);
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    await userEvent.type(input, '产品');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    await userEvent.keyboard('{Enter}');
    expect(change).toHaveBeenCalledWith('product', options[2]);
    await userEvent.click(input);
    await userEvent.type(input, 'unlisted');
    expect(screen.queryByRole('option')).toBeNull();
    await userEvent.keyboard('{Enter}{Escape}');
    expect(change).toHaveBeenCalledOnce();
    expect(input).toHaveValue('产品');
  });
  it('submits repeated values for multiple selection, removes tags and resets defaults', async () => {
    render(
      <form aria-label="Teams">
        <Select
          options={options}
          multiple
          showSearch
          name="teams"
          required
          defaultValue={['design']}
          allowClear
        />
        <button type="reset">Reset</button>
      </form>,
    );
    const form = screen.getByRole('form') as HTMLFormElement;
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    await userEvent.click(screen.getByRole('option', { name: '产品' }));
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(new FormData(form).getAll('teams')).toEqual(['design', 'product']);
    await userEvent.keyboard('{Backspace}');
    expect(new FormData(form).getAll('teams')).toEqual(['design']);
    await userEvent.click(screen.getByRole('button', { name: '移除 设计' }));
    expect(form.checkValidity()).toBe(false);
    expect(new FormData(form).getAll('teams')).toEqual([]);
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(new FormData(form).getAll('teams')).toEqual(['design']);
    expect(form.checkValidity()).toBe(true);
  });
  it('mounts a portaled listbox, selects an option and returns focus to its ref', async () => {
    const ref = createRef<HTMLInputElement>();
    const onChange = vi.fn();
    const { container } = render(
      <Select ref={ref} aria-label="团队" options={options} onChange={onChange} />,
    );
    const trigger = screen.getByRole('combobox');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(container.querySelector('select')).toBeNull();
    await userEvent.click(trigger);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(container.contains(screen.getByRole('listbox'))).toBe(false);
    await userEvent.click(screen.getByRole('option', { name: '产品' }));
    expect(onChange).toHaveBeenCalledWith('product', options[2]);
    expect(trigger).toHaveValue('产品');
    expect(trigger).toHaveFocus();
    expect(ref.current).toBe(trigger);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
  it('skips disabled options with arrows, supports Home/End and dismisses without committing', async () => {
    render(<Select aria-label="团队" options={options} />);
    const trigger = screen.getByRole('combobox');
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(trigger).toHaveValue('产品');
    await userEvent.keyboard('{ArrowDown}{Home}{Enter}');
    expect(trigger).toHaveValue('设计');
    await userEvent.keyboard('{ArrowDown}{End}{Escape}');
    expect(trigger).toHaveValue('设计');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
  it('supports controlled values, clear actions, outside click and disabled state', async () => {
    function Example() {
      const [value, setValue] = useState('design');
      return (
        <>
          <Select
            value={value}
            onChange={setValue}
            options={options}
            aria-label="团队"
            allowClear
          />
          <button type="button">外部操作</button>
        </>
      );
    }
    const { rerender } = render(<Example />);
    const trigger = screen.getByRole('combobox');
    await userEvent.click(screen.getByRole('button', { name: '清除选择' }));
    expect(trigger).toHaveValue('');
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole('button', { name: '外部操作' }));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    rerender(<Select options={options} aria-label="团队" disabled status="error" />);
    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
  });
  it('keeps form required validation and submission values without native picker UI', async () => {
    render(
      <form aria-label="表单">
        <Select name="team" required options={options} aria-label="团队" />
      </form>,
    );
    const form = screen.getByRole('form') as HTMLFormElement;
    expect(form.checkValidity()).toBe(false);
    expect(screen.getByRole('combobox')).toHaveFocus();
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('option', { name: '设计' }));
    expect(form.checkValidity()).toBe(true);
    expect(new FormData(form).get('team')).toBe('design');
  });
});
