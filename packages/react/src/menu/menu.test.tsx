import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from '../config-provider';
import { Menu, MenuGroup, type MenuItem } from './index';

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
  it('uses primary by default and allows regional and instance appearance overrides', () => {
    const { rerender } = render(<Menu items={items} />);
    expect(screen.getByRole('navigation')).toHaveClass('leaf-menu--primary');
    expect(renderToString(<Menu items={items} />)).toContain('leaf-menu--primary');

    rerender(
      <ConfigProvider components={{ Menu: { variant: 'neutral' } }}>
        <Menu items={items} />
      </ConfigProvider>,
    );
    expect(screen.getByRole('navigation')).toHaveClass('leaf-menu--neutral');

    rerender(
      <ConfigProvider components={{ Menu: { variant: 'primary' } }}>
        <Menu items={items} variant="neutral" />
      </ConfigProvider>,
    );
    expect(screen.getByRole('navigation')).toHaveClass('leaf-menu--neutral');
  });

  it('renders item extra inline and in collapsed navigation without changing the item label', async () => {
    const data: MenuItem[] = [
      {
        key: 'projects',
        label: 'Projects',
        extra: <span>3</span>,
        children: [{ key: 'design', label: 'Design', extra: <span>New</span> }],
      },
    ];
    const { rerender } = render(<Menu items={data} defaultOpenKeys={['projects']} />);
    expect(screen.getByRole('menuitem', { name: 'Projects 3' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Design New' })).toBeInTheDocument();
    rerender(<Menu items={data} collapsed />);
    expect(screen.queryByText('3')).not.toBeInTheDocument();
    const parent = screen.getByRole('menuitem', { name: 'Projects' });
    if (parent.getAttribute('aria-expanded') !== 'true') await userEvent.click(parent);
    expect(screen.getByRole('menuitem', { name: 'Design New' })).toBeInTheDocument();
    expect(renderToString(<Menu items={[{ key: 'zero', label: 'Zero', extra: 0 }]} />)).toContain(
      'leaf-menu__extra',
    );
  });

  it('inherits the raised variant and lets an instance use neutral without resetting selection', async () => {
    const view = (variant?: 'neutral' | 'raised' | 'primary') => (
      <ConfigProvider components={{ Menu: { variant: 'raised' } }}>
        <Menu items={items} variant={variant} defaultSelectedKey="settings" />
      </ConfigProvider>
    );
    const { rerender } = render(view());
    expect(screen.getByRole('navigation')).toHaveClass('leaf-menu--raised');
    expect(screen.getByRole('navigation')).not.toHaveAttribute('variant');
    await userEvent.click(screen.getByRole('menuitem', { name: 'Projects' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Design' }));
    rerender(view('primary'));
    expect(screen.getByRole('navigation')).toHaveClass('leaf-menu--primary');
    expect(screen.getByRole('navigation')).not.toHaveClass('leaf-menu--raised');
    rerender(view('neutral'));
    expect(screen.getByRole('navigation')).toHaveClass('leaf-menu--neutral');
    expect(screen.getByRole('navigation')).not.toHaveClass('leaf-menu--raised');
    expect(screen.getByRole('menuitem', { name: 'Design' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(renderToString(<Menu items={items} variant="raised" />)).toContain('leaf-menu--raised');
  });

  it('retains opened content for closing transitions and skips closed items by keyboard', async () => {
    const onOpenChange = vi.fn();
    render(<Menu items={items} onOpenChange={onOpenChange} />);
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

describe('Menu groups', () => {
  const grouped: MenuItem[] = [
    {
      key: 'workspace',
      type: 'group',
      label: <span>Workspace</span>,
      children: [
        { key: 'disabled', label: 'Unavailable', disabled: true },
        { key: 'home', label: 'Home' },
      ],
    },
    { key: 'divider', type: 'divider', label: '' },
    {
      key: 'account',
      type: 'group',
      label: 'Account',
      children: [{ key: 'settings', label: 'Settings' }],
    },
  ];

  it('names groups from rich titles and navigates across groups without selecting titles', async () => {
    const onSelect = vi.fn();
    render(<Menu items={grouped} onSelect={onSelect} />);
    expect(screen.getByRole('group', { name: 'Workspace' })).toContainElement(
      screen.getByRole('menuitem', { name: 'Home' }),
    );
    const home = screen.getByRole('menuitem', { name: 'Home' });
    const settings = screen.getByRole('menuitem', { name: 'Settings' });
    await userEvent.tab();
    expect(home).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(settings).toHaveFocus();
    await userEvent.keyboard('{Home}{End}{Enter}');
    expect(settings).toHaveAttribute('aria-current', 'page');
    expect(onSelect).toHaveBeenCalledExactlyOnceWith('settings', grouped[2]?.children?.[0]);
    await userEvent.click(screen.getByText('Workspace'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('moves into and out of nested groups with horizontal arrow keys', async () => {
    render(<Menu items={[{ key: 'parent', label: 'Parent', children: grouped }]} />);
    const parent = screen.getByRole('menuitem', { name: 'Parent' });
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    expect(screen.getByRole('menuitem', { name: 'Home' })).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(parent).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(parent).toHaveAttribute('aria-expanded', 'false');
  });

  it('reuses the title for custom content while leaving controls outside menu navigation', async () => {
    const onSelect = vi.fn();
    const onCreate = vi.fn();
    const ref = createRef<HTMLDivElement>();
    render(
      <>
        <Menu items={grouped} onSelect={onSelect} />
        <MenuGroup title="Quick create" ref={ref} data-testid="custom-group">
          <input aria-label="Project name" defaultValue="Draft" />
          <button type="button" onClick={onCreate}>
            Create
          </button>
        </MenuGroup>
      </>,
    );
    expect(ref.current).toBe(screen.getByRole('group', { name: 'Quick create' }));
    expect(ref.current?.closest('[role="menu"]')).toBeNull();
    const input = screen.getByRole('textbox', { name: 'Project name' });
    await userEvent.click(input);
    await userEvent.keyboard('{Home}New {End}');
    expect(input).toHaveValue('New Draft');
    expect(input).toHaveFocus();
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    expect(onCreate).toHaveBeenCalledOnce();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('applies standalone defaults without changing Menu internal groups or remounting content', async () => {
    const content = (
      <>
        <Menu items={grouped} />
        <MenuGroup title="Custom" data-testid="default-group">
          <input aria-label="Draft" defaultValue="Retained" />
        </MenuGroup>
        <MenuGroup title="Explicit" className="explicit" />
        <ConfigProvider components={{ MenuGroup: null }}>
          <MenuGroup title="Cleared" />
        </ConfigProvider>
      </>
    );
    const { rerender } = render(
      <ConfigProvider components={{ MenuGroup: { className: 'regional' } }}>
        {content}
      </ConfigProvider>,
    );
    expect(screen.getByTestId('default-group')).toHaveClass('regional');
    expect(screen.getByRole('group', { name: 'Explicit' })).not.toHaveClass('regional');
    expect(screen.getByRole('group', { name: 'Cleared' })).not.toHaveClass('regional');
    expect(screen.getByRole('group', { name: 'Workspace' })).not.toHaveClass('regional');
    const input = screen.getByRole('textbox', { name: 'Draft' });
    await userEvent.click(input);
    rerender(
      <ConfigProvider components={{ MenuGroup: { className: 'updated' } }}>
        {content}
      </ConfigProvider>,
    );
    expect(screen.getByTestId('default-group')).toHaveClass('updated');
    expect(screen.getByRole('textbox', { name: 'Draft' })).toBe(input);
    expect(input).toHaveFocus();
    expect(input).toHaveValue('Retained');
  });

  it('renders unique labelled groups on the server', () => {
    const html = renderToString(
      <>
        <Menu items={grouped} />
        <MenuGroup title={<span>Custom title</span>}>Custom content</MenuGroup>
      </>,
    );
    const labels = [...html.matchAll(/aria-labelledby="([^"]+)"/g)].map((match) => match[1]);
    expect(labels).toHaveLength(3);
    expect(new Set(labels).size).toBe(3);
    for (const label of labels) expect(html).toContain(`id="${label}"`);
    expect(html).toContain('Custom content');
  });
});

describe('Menu popup navigation', () => {
  it('inherits the default primary appearance in collapsed submenus', async () => {
    render(<Menu items={items} collapsed defaultSelectedKey="design" />);
    await userEvent.click(screen.getByRole('menuitem', { name: 'Projects' }));
    expect(
      screen.getByRole('menuitem', { name: 'Design' }).closest('.leaf-menu__popup'),
    ).toHaveClass('leaf-menu__popup--primary');
  });
  it.each(['neutral', 'raised', 'primary'] as const)(
    'keeps the %s appearance in collapsed submenus',
    async (variant) => {
      render(<Menu items={items} variant={variant} collapsed defaultSelectedKey="design" />);
      await userEvent.click(screen.getByRole('menuitem', { name: 'Projects' }));
      const selected = screen.getByRole('menuitem', { name: 'Design' });
      expect(selected).toHaveAttribute('aria-current', 'page');
      expect(selected.closest('.leaf-menu__popup')).toHaveClass(`leaf-menu__popup--${variant}`);
    },
  );

  it('keeps selected links and nested navigation in the collapsed popup', async () => {
    const onSelect = vi.fn();
    render(
      <Menu
        collapsed
        defaultSelectedKey="design"
        onSelect={onSelect}
        items={[
          {
            key: 'resources',
            label: 'Resources',
            children: [
              { key: 'design', label: 'Design', href: '#design' },
              {
                key: 'more',
                label: 'More',
                children: [{ key: 'templates', label: 'Templates' }],
              },
            ],
          },
        ]}
      />,
    );
    const trigger = screen.getByRole('menuitem', { name: 'Resources' });
    await userEvent.click(trigger);
    expect(screen.getByRole('menuitem', { name: 'Design' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(trigger).not.toHaveAttribute('data-selected');
    expect(trigger).not.toHaveAttribute('data-active-parent');
    await userEvent.keyboard('{ArrowDown}{ArrowRight}');
    expect(screen.getByRole('menuitem', { name: 'Templates' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledWith(
      'templates',
      expect.objectContaining({ key: 'templates' }),
    );
    expect(trigger).toHaveFocus();
    expect(trigger).not.toHaveAttribute('data-selected');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});
