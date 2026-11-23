import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConfigProvider, FloatButton, FloatButtonGroup } from '../index';

describe('FloatButton and FloatButtonGroup', () => {
  it('supports size and placement classes on FloatButton', () => {
    render(
      <ConfigProvider locale="en-US">
        <FloatButton aria-label="Help" size="sm" placement="top-start">
          ?
        </FloatButton>
      </ConfigProvider>,
    );
    const btn = screen.getByRole('button', { name: 'Help' });
    expect(btn).toHaveClass(
      'leaf-float-button',
      'leaf-button--sm',
      'leaf-float-button--fixed',
      'leaf-float-button--top-start',
    );
  });

  it('uses group role, navigates actions with arrows, and collapses on Escape or outside click', async () => {
    const share = vi.fn();
    const { container } = render(
      <ConfigProvider locale="en-US">
        <div>
          <FloatButtonGroup
            placement="top-end"
            actions={[
              { key: 'share', label: 'Share', icon: 'S', onClick: share },
              { key: 'disabled', label: 'Disabled', icon: 'X', disabled: true },
              { key: 'edit', label: 'Edit', icon: 'E' },
            ]}
          />
          <button type="button">Outside</button>
        </div>
      </ConfigProvider>,
    );
    const group = screen.getByRole('group', { name: 'Quick actions' });
    expect(group).toHaveClass('leaf-float-group--top', 'leaf-float-group--top-end');
    const trigger = screen.getByRole('button', { name: 'Quick actions' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger.getAttribute('aria-controls')).toBeTruthy();

    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{Escape}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);
    fireEvent.keyDown(group, { key: 'ArrowDown' });
    expect(screen.getByRole('button', { name: 'Share' })).toHaveFocus();
    fireEvent.keyDown(group, { key: 'ArrowDown' });
    expect(screen.getByRole('button', { name: 'Edit' })).toHaveFocus();
    fireEvent.keyDown(group, { key: 'Home' });
    expect(screen.getByRole('button', { name: 'Share' })).toHaveFocus();

    // 先按一次 Escape 收起当前动作按钮上的 Tooltip，再按一次收起操作组并恢复焦点
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('tooltip')).toBeNull();
    await userEvent.keyboard('{Escape}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();

    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole('button', { name: 'Share' }));
    expect(share).toHaveBeenCalledOnce();
    expect(container.querySelector('.leaf-float-group__actions')).not.toHaveAttribute('data-open');

    await userEvent.click(trigger);
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Outside' }));
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});
