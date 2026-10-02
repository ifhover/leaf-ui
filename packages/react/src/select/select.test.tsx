import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it } from 'vitest';
import { Select } from './select';

const options = [
  { label: '设计', value: 'design' },
  { label: '产品', value: 'product' },
  { label: '归档', value: 'archived', disabled: true },
];
describe('Select', () => {
  it('starts on the placeholder, selects native options and forwards refs', async () => {
    const ref = createRef<HTMLSelectElement>();
    render(
      <Select ref={ref} aria-label="团队" options={options} placeholder="选择团队" required />,
    );
    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('');
    expect(select).toBeInvalid();
    await userEvent.selectOptions(select, 'design');
    expect(select).toHaveValue('design');
    expect(select).toBeValid();
    expect(ref.current).toBe(select);
    await userEvent.selectOptions(select, 'archived');
    expect(select).toHaveValue('design');
  });
  it('supports controlled values and resets to the placeholder programmatically', async () => {
    function Example() {
      const [value, setValue] = useState('design');
      return (
        <>
          <Select
            value={value}
            aria-label="团队"
            placeholder="选择团队"
            options={options}
            onChange={(event) => setValue(event.target.value)}
          />
          <button type="button" onClick={() => setValue('')}>
            清除
          </button>
        </>
      );
    }
    render(<Example />);
    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'product');
    expect(select).toHaveValue('product');
    await userEvent.click(screen.getByRole('button'));
    expect(select).toHaveValue('');
  });
  it('passes error semantics and prevents disabled selection', async () => {
    render(
      <Select aria-label="团队" options={options} defaultValue="design" disabled status="error" />,
    );
    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('aria-invalid', 'true');
    await userEvent.selectOptions(select, 'product');
    expect(select).toHaveValue('design');
  });
});
