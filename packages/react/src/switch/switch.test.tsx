import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Switch } from './switch';

describe('Switch', () => {
  it('exposes switch semantics, the native ref and keyboard toggling', async () => {
    const ref = createRef<HTMLInputElement>();
    render(<Switch ref={ref}>邮件通知</Switch>);
    const control = screen.getByRole('switch', { name: '邮件通知' });
    await userEvent.tab();
    await userEvent.keyboard(' ');
    expect(control).toBeChecked();
    expect(ref.current).toBe(control);
    await userEvent.click(screen.getByText('邮件通知'));
    expect(control).not.toBeChecked();
  });
  it('preserves checked state and blocks interaction while loading', async () => {
    const onChange = vi.fn();
    render(
      <Switch loading defaultChecked onChange={onChange}>
        保存设置
      </Switch>,
    );
    const control = screen.getByRole('switch');
    expect(control).toBeDisabled();
    expect(control).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(control);
    expect(control).toBeChecked();
    expect(onChange).not.toHaveBeenCalled();
  });
  it('supports controlled values and consumer aria-busy', async () => {
    function Example() {
      const [checked, setChecked] = useState(true);
      return (
        <Switch
          checked={checked}
          aria-busy="true"
          onChange={(event) => setChecked(event.target.checked)}
        >
          设置
        </Switch>
      );
    }
    render(<Example />);
    await userEvent.click(screen.getByRole('switch'));
    expect(screen.getByRole('switch')).not.toBeChecked();
    expect(screen.getByRole('switch')).toHaveAttribute('aria-busy', 'true');
  });
});
