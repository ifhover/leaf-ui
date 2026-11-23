import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, type FormEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../button';
import { ConfigProvider } from '../config-provider';
import { Dropdown } from './dropdown';

it('navigates enabled menu items, skips dividers, selects and restores focus', async () => {
  const selected = vi.fn();
  render(
    <Dropdown
      onSelect={selected}
      items={[
        { key: 'a', label: 'Alpha' },
        { key: 'd', type: 'divider' },
        { key: 'b', label: 'Beta', disabled: true },
        { key: 'c', label: 'Charlie', danger: true },
      ]}
    >
      <Button>Menu</Button>
    </Dropdown>,
  );
  screen.getByRole('button', { name: 'Menu' }).focus();
  await userEvent.keyboard('{ArrowDown}');
  expect(screen.getByRole('menuitem', { name: 'Alpha' })).toHaveFocus();
  await userEvent.keyboard('{ArrowDown}{Enter}');
  expect(selected).toHaveBeenCalledWith('c');
  expect(screen.queryByRole('menu')).toBeNull();
  expect(screen.getByRole('button', { name: 'Menu' })).toHaveFocus();
});
describe('controlled menus', () => {
  it('inherits configured menu sizes in submenus and permits instance overrides', async () => {
    const items = [{ key: 'more', label: 'More', children: [{ key: 'copy', label: 'Copy' }] }];
    const example = (size?: 'sm' | 'md' | 'lg') => (
      <ConfigProvider components={{ Dropdown: { size: 'sm' } }}>
        <Dropdown size={size} items={items}>
          <Button>Menu</Button>
        </Dropdown>
      </ConfigProvider>
    );
    const { rerender } = render(example());
    await userEvent.click(screen.getByRole('button', { name: 'Menu' }));
    expect(screen.getByRole('menu').closest('.leaf-dropdown')).toHaveClass('leaf-dropdown--sm');
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getAllByRole('menu')).toHaveLength(2);
    for (const menu of screen.getAllByRole('menu'))
      expect(menu.closest('.leaf-dropdown')).toHaveClass('leaf-dropdown--sm');
    rerender(example('lg'));
    for (const menu of screen.getAllByRole('menu'))
      expect(menu.closest('.leaf-dropdown')).toHaveClass('leaf-dropdown--lg');
  });

  it('renders trailing content at the end of the row and before submenu affordances', async () => {
    const selected = vi.fn();
    render(
      <Dropdown
        onSelect={selected}
        items={[
          { key: 'copy', label: 'Copy', extra: <span>Ctrl C</span> },
          {
            key: 'more',
            label: 'More',
            extra: <span>Ctrl M</span>,
            children: [{ key: 'archive', label: 'Archive' }],
          },
        ]}
      >
        <Button>Menu</Button>
      </Dropdown>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Menu' }));
    const copy = screen.getByRole('menuitem', { name: 'Copy Ctrl C' });
    expect(copy.querySelector('.leaf-dropdown__extra')).toHaveTextContent('Ctrl C');
    await userEvent.click(copy);
    expect(selected).toHaveBeenCalledWith('copy');

    await userEvent.click(screen.getByRole('button', { name: 'Menu' }));
    const more = screen.getByRole('menuitem', { name: 'More Ctrl M' });
    expect(more.querySelector('.leaf-dropdown__extra')?.nextElementSibling).toHaveClass(
      'leaf-dropdown__arrow',
    );
  });

  it('moves the pointer highlight without stealing keyboard focus or checking disabled items', async () => {
    const change = vi.fn();
    render(
      <Dropdown
        items={[
          { key: 'a', label: 'Alpha' },
          {
            key: 'b',
            label: 'Beta',
            type: 'checkbox',
            closeOnSelect: false,
            onCheckedChange: change,
          },
          { key: 'c', label: 'Unavailable', disabled: true },
        ]}
      >
        <Button>Menu</Button>
      </Dropdown>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Menu' }));
    const first = screen.getByRole('menuitem', { name: 'Alpha' });
    const check = screen.getByRole('menuitemcheckbox', { name: 'Beta' });
    expect(first).toHaveFocus();
    fireEvent.pointerEnter(check, { pointerType: 'mouse' });
    expect(first).toHaveFocus();
    expect(check).toHaveAttribute('tabindex', '0');
    fireEvent.pointerEnter(screen.getByRole('menuitem', { name: 'Unavailable' }), {
      pointerType: 'mouse',
    });
    expect(check).toHaveAttribute('tabindex', '0');
    await userEvent.click(check);
    expect(change).toHaveBeenCalledExactlyOnceWith(true);
    expect(check).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });
  it('reports state changes without assuming approval from a controlled prop', async () => {
    const change = vi.fn();
    render(
      <Dropdown open={false} onOpenChange={change} items={[]}>
        <Button>Menu</Button>
      </Dropdown>,
    );
    await userEvent.click(screen.getByText('Menu'));
    expect(change).toHaveBeenCalledWith(true);
    expect(screen.queryByRole('menu')).toBeNull();
  });
  it('preserves the trigger ref and avoids submitting its owner form', async () => {
    const ref = createRef<HTMLButtonElement>();
    const submit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault());
    render(
      <form onSubmit={submit}>
        <Dropdown items={[{ key: 'a', label: 'Alpha' }]}>
          {/* biome-ignore lint/a11y/useButtonType: Dropdown supplies the safe default type being tested. */}
          <button ref={ref}>Menu</button>
        </Dropdown>
      </form>,
    );
    expect(ref.current).toBe(screen.getByRole('button', { name: 'Menu' }));
    await userEvent.click(screen.getByText('Menu'));
    expect(submit).not.toHaveBeenCalled();
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });
  it('does not reopen an uncontrolled menu when re-enabled', async () => {
    const example = (disabled: boolean) => (
      <Dropdown disabled={disabled} items={[{ key: 'a', label: 'Alpha' }]}>
        <Button>Menu</Button>
      </Dropdown>
    );
    const { rerender } = render(example(false));
    await userEvent.click(screen.getByText('Menu'));
    rerender(example(true));
    expect(screen.queryByRole('menu')).toBeNull();
    rerender(example(false));
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('positions submenus flush against the parent trigger edge with vertical alignment', async () => {
    const clientWidthSpy = vi
      .spyOn(document.documentElement, 'clientWidth', 'get')
      .mockReturnValue(1024);
    const clientHeightSpy = vi
      .spyOn(document.documentElement, 'clientHeight', 'get')
      .mockReturnValue(768);
    const rectSpy = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        if (this.dataset.key === 'more') {
          return {
            x: 40,
            y: 80,
            left: 40,
            top: 80,
            right: 200,
            bottom: 108,
            width: 160,
            height: 28,
            toJSON: () => ({}),
          } as DOMRect;
        }
        if (this.tagName === 'BUTTON') {
          return {
            x: 40,
            y: 40,
            left: 40,
            top: 40,
            right: 120,
            bottom: 72,
            width: 80,
            height: 32,
            toJSON: () => ({}),
          } as DOMRect;
        }
        return {
          x: 0,
          y: 0,
          left: 0,
          top: 0,
          right: 120,
          bottom: 90,
          width: 120,
          height: 90,
          toJSON: () => ({}),
        } as DOMRect;
      });
    try {
      render(
        <Dropdown
          items={[{ key: 'more', label: 'More', children: [{ key: 'copy', label: 'Copy' }] }]}
        >
          <Button>Menu</Button>
        </Dropdown>,
      );
      await userEvent.click(screen.getByRole('button', { name: 'Menu' }));
      const parentItem = screen.getByRole('menuitem', { name: 'More' });
      fireEvent.pointerEnter(parentItem, { pointerType: 'mouse' });
      await waitFor(() => {
        const floatingPanels = Array.from(document.querySelectorAll<HTMLElement>('.leaf-dropdown'));
        expect(floatingPanels).toHaveLength(2);
        const [rootPanel, subPanel] = floatingPanels;
        // 主菜单相对触发按钮下移 6px（72 + 6 = 78px）
        expect(rootPanel?.style.top).toBe('78px');
        // 子菜单紧贴父触发项右缘（200px）且顶边与父触发项（80px）平齐
        expect(subPanel?.style.left).toBe('200px');
        expect(subPanel?.style.top).toBe('80px');
      });
    } finally {
      rectSpy.mockRestore();
      clientWidthSpy.mockRestore();
      clientHeightSpy.mockRestore();
    }
  });

  it('pins hover-opened menus on click, avoids redundant global listener churn, and keeps submenus open across diagonal pointer travel', async () => {
    const addSpy = vi.spyOn(document, 'addEventListener');
    render(
      <Dropdown
        trigger={['hover', 'click']}
        mouseEnterDelay={0}
        mouseLeaveDelay={20}
        items={[
          { key: 'more', label: 'More', children: [{ key: 'copy', label: 'Copy' }] },
          { key: 'other', label: 'Other' },
        ]}
      >
        <Button>Menu</Button>
      </Dropdown>,
    );
    const triggerButton = screen.getByRole('button', { name: 'Menu' });
    fireEvent.pointerEnter(triggerButton, { pointerType: 'mouse' });
    await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument());

    const afterOpenAdds = addSpy.mock.calls.filter(
      ([type]) => type === 'pointerdown' || type === 'focusin',
    ).length;

    const more = screen.getByRole('menuitem', { name: 'More' });
    fireEvent.pointerEnter(more, { pointerType: 'mouse' });
    await waitFor(() => expect(screen.getAllByRole('menu')).toHaveLength(2));

    // 点击刚悬停展开的父菜单项或主按钮应保持展开而非立即反选关闭
    fireEvent.click(more);
    expect(screen.getAllByRole('menu')).toHaveLength(2);
    expect(
      addSpy.mock.calls.filter(([type]) => type === 'pointerdown' || type === 'focusin').length,
    ).toBe(afterOpenAdds);

    // 指针斜向路过兄弟项并立刻移入子菜单面板时应保住子菜单
    fireEvent.pointerEnter(screen.getByRole('menuitem', { name: 'Other' }), {
      pointerType: 'mouse',
    });
    const menus = screen.getAllByRole('menu');
    fireEvent.pointerEnter(menus[1] as HTMLElement, { pointerType: 'mouse' });
    await new Promise((resolve) => setTimeout(resolve, 160));
    expect(screen.getAllByRole('menu')).toHaveLength(2);

    // 悬停打开后点击触发按钮将其固定，再移出鼠标也不会自动关闭，再次点击才关闭
    fireEvent.click(triggerButton);
    fireEvent.pointerLeave(triggerButton, { pointerType: 'mouse' });
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.getByRole('menuitem', { name: 'More' })).toBeInTheDocument();

    fireEvent.click(triggerButton);
    expect(screen.queryByRole('menu')).toBeNull();
    addSpy.mockRestore();
  });
});
