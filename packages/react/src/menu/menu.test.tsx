import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Menu, type MenuItem } from './menu';

const items: MenuItem[] = [
  {
    key: 'projects',
    label: 'Projects',
    children: [
      { key: 'design', label: 'Design' },
      {
        key: 'archive',
        label: 'Archive',
        children: [{ key: 'last-year', label: 'Last year' }],
      },
    ],
  },
  { key: 'settings', label: 'Settings' },
];

describe('Menu transitions', () => {
  it('retains opened content for closing transitions and skips closed items by keyboard', async () => {
    const onOpenChange = vi.fn();
    render(<Menu mode="inline" items={items} onOpenChange={onOpenChange} />);
    const trigger = screen.getByRole('menuitem', { name: 'Projects' });
    expect(screen.queryByText('Design')).toBeNull();

    await userEvent.click(trigger);
    const child = screen.getByRole('menuitem', { name: 'Design' });
    const submenu = screen.getByRole('menu', { name: 'Projects' });
    expect(submenu).not.toHaveAttribute('inert');
    await userEvent.keyboard('{ArrowDown}');
    expect(child).toHaveFocus();

    await userEvent.click(trigger);
    expect(child).toBeInTheDocument();
    expect(submenu).toHaveAttribute('aria-hidden', 'true');
    expect(submenu).toHaveAttribute('inert');
    expect(screen.queryByRole('menuitem', { name: 'Design' })).toBeNull();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Settings' })).toHaveFocus();

    await userEvent.click(trigger);
    expect(screen.getByRole('menuitem', { name: 'Design' })).toBe(child);
    expect(onOpenChange.mock.calls.map(([keys]) => keys)).toEqual([['projects'], [], ['projects']]);
  });

  it('keeps nested open state while its parent is closed and restores keyboard access on reopening', async () => {
    render(<Menu items={items} defaultOpenKeys={['projects', 'archive']} />);
    const trigger = screen.getByRole('menuitem', { name: 'Projects' });
    const nestedChild = screen.getByRole('menuitem', { name: 'Last year' });

    await userEvent.click(trigger);
    expect(screen.queryByRole('menuitem', { name: 'Last year' })).toBeNull();
    await userEvent.keyboard('{End}');
    expect(screen.getByRole('menuitem', { name: 'Settings' })).toHaveFocus();

    await userEvent.click(trigger);
    expect(screen.getByRole('menuitem', { name: 'Archive' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByRole('menuitem', { name: 'Last year' })).toBe(nestedChild);
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    expect(nestedChild).toHaveFocus();
  });

  it('handles controlled close and rapid reopen without remounting submenu content', async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Menu items={items} openKeys={['projects']} onOpenChange={onOpenChange} />,
    );
    const child = screen.getByRole('menuitem', { name: 'Design' });
    const trigger = screen.getByRole('menuitem', { name: 'Projects' });
    await userEvent.click(trigger);
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith([]);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    rerender(<Menu items={items} openKeys={[]} onOpenChange={onOpenChange} />);
    expect(screen.queryByRole('menuitem', { name: 'Design' })).toBeNull();
    expect(child).toBeInTheDocument();
    rerender(<Menu items={items} openKeys={['projects']} onOpenChange={onOpenChange} />);
    expect(screen.getByRole('menuitem', { name: 'Design' })).toBe(child);
  });
});
