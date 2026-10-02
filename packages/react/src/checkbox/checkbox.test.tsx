import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox } from './checkbox';

describe('Checkbox', () => {
  it('toggles by label and Space and forwards the native ref', async () => {
    const ref = createRef<HTMLInputElement>();
    const onChange = vi.fn();
    render(
      <Checkbox ref={ref} onChange={onChange}>
        动态
      </Checkbox>,
    );
    const checkbox = screen.getByRole('checkbox', { name: '动态' });
    await userEvent.click(screen.getByText('动态'));
    expect(checkbox).toBeChecked();
    await userEvent.keyboard(' ');
    expect(checkbox).not.toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(ref.current).toBe(checkbox);
  });
  it('updates native indeterminate without changing checked or form values', () => {
    const ref = createRef<HTMLInputElement>();
    const { rerender } = render(
      <Checkbox ref={ref} indeterminate>
        全选
      </Checkbox>,
    );
    expect(ref.current?.indeterminate).toBe(true);
    expect(ref.current?.checked).toBe(false);
    expect(screen.getByRole('checkbox')).toBePartiallyChecked();
    rerender(
      <Checkbox ref={ref} checked indeterminate={false} readOnly>
        全选
      </Checkbox>,
    );
    expect(ref.current?.indeterminate).toBe(false);
    expect(ref.current?.checked).toBe(true);
  });
  it('supports controlled selection and prevents disabled interaction', async () => {
    function Example() {
      const [checked, setChecked] = useState(false);
      return (
        <>
          <Checkbox checked={checked} onChange={(event) => setChecked(event.target.checked)}>
            选项
          </Checkbox>
          <Checkbox disabled>不可用</Checkbox>
        </>
      );
    }
    render(<Example />);
    await userEvent.click(screen.getByRole('checkbox', { name: '选项' }));
    expect(screen.getByRole('checkbox', { name: '选项' })).toBeChecked();
    await userEvent.click(screen.getByRole('checkbox', { name: '不可用' }));
    expect(screen.getByRole('checkbox', { name: '不可用' })).not.toBeChecked();
  });
});
