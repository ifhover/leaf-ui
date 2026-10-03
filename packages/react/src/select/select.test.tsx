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
  it('mounts a portaled listbox, selects an option and returns focus to its ref', async () => {
    const ref = createRef<HTMLButtonElement>();
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
    expect(trigger).toHaveTextContent('产品');
    expect(trigger).toHaveFocus();
    expect(ref.current).toBe(trigger);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
  it('skips disabled options with arrows, supports Home/End and dismisses without committing', async () => {
    render(<Select aria-label="团队" options={options} />);
    const trigger = screen.getByRole('combobox');
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(trigger).toHaveTextContent('产品');
    await userEvent.keyboard('{ArrowDown}{Home}{Enter}');
    expect(trigger).toHaveTextContent('设计');
    await userEvent.keyboard('{ArrowDown}{End}{Escape}');
    expect(trigger).toHaveTextContent('设计');
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
    expect(trigger).toHaveTextContent('请选择');
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
