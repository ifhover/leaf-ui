import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Button, ConfigProvider, Popover } from '../index';

// jsdom omits geometry; keep disabled and tabIndex checks without layout visibility checks.
vi.mock('tabbable', async (importOriginal) => {
  const original = await importOriginal<typeof import('tabbable')>();
  return {
    ...original,
    tabbable: (node: Element) => original.tabbable(node, { displayCheck: 'none' }),
  };
});

describe('Popover', () => {
  it('preserves trigger events and refs, focuses content and returns focus on Escape', async () => {
    const ref = createRef<HTMLButtonElement>();
    const click = vi.fn();
    render(
      <Popover title="Settings" content={<Button>Inside</Button>}>
        <Button ref={ref} onClick={click}>
          Open
        </Button>
      </Popover>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(click).toHaveBeenCalledOnce();
    expect(ref.current).toBe(screen.getByRole('button', { name: 'Open' }));
    const dialog = screen.getByRole('dialog', { name: 'Settings' });
    expect(document.querySelector('.leaf-popover')).toHaveAttribute('data-arrow', 'true');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Inside' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(ref.current).toHaveFocus();
  });
  it('supports focus on hover triggers and never opens disabled triggers', async () => {
    const { rerender } = render(
      <Popover title="Details" trigger="hover" content="Description">
        <Button>Details</Button>
      </Popover>,
    );
    await userEvent.tab();
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('tooltip')).toBeNull();
    rerender(
      <Popover title="Details" content="Description" disabled>
        <Button>Details</Button>
      </Popover>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Details' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('closes hover popovers after pointer leave when the trigger was clicked or dismissed with Escape', async () => {
    render(
      <Popover
        title="Details"
        trigger="hover"
        content="Description"
        enterDelay={20}
        leaveDelay={20}
      >
        <Button>Details</Button>
      </Popover>,
    );
    const button = screen.getByRole('button', { name: 'Details' });

    await userEvent.hover(button);
    await waitFor(() => expect(screen.getByRole('tooltip')).toBeInTheDocument());

    await userEvent.click(button);
    expect(button).toHaveFocus();
    await userEvent.unhover(button);
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());

    await userEvent.click(document.body);
    await userEvent.tab();
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('tooltip')).toBeNull();

    await userEvent.hover(button);
    await waitFor(() => expect(screen.getByRole('tooltip')).toBeInTheDocument());
    await userEvent.unhover(button);
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
  });

  it('supports hiding the arrow via props or ConfigProvider defaults', () => {
    const { rerender } = render(
      <ConfigProvider components={{ Popover: { arrow: false } }}>
        <Popover open title="Details" content="Description">
          <Button>Open</Button>
        </Popover>
      </ConfigProvider>,
    );
    const panel = () => document.querySelector<HTMLElement>('.leaf-popover');
    expect(panel()).toHaveAttribute('data-arrow', 'false');
    expect(panel()?.style.getPropertyValue('--leaf-floating-arrow-x')).toBe('');

    rerender(
      <ConfigProvider components={{ Popover: { arrow: false } }}>
        <Popover open arrow title="Details" content="Description">
          <Button>Open</Button>
        </Popover>
      </ConfigProvider>,
    );
    expect(panel()).toHaveAttribute('data-arrow', 'true');
  });

  it('aligns the arrow toward the trigger on corner, shifted and vertical placements', async () => {
    const clientWidthSpy = vi
      .spyOn(document.documentElement, 'clientWidth', 'get')
      .mockReturnValue(1024);
    const clientHeightSpy = vi
      .spyOn(document.documentElement, 'clientHeight', 'get')
      .mockReturnValue(768);
    let triggerRect = { left: 900, top: 20, width: 60, height: 32 };
    let floatingSize = { width: 320, height: 200 };
    const offsetWidthSpy = vi
      .spyOn(HTMLElement.prototype, 'offsetWidth', 'get')
      .mockImplementation(function (this: HTMLElement) {
        if (this.tagName === 'BUTTON') return triggerRect.width;
        if (this.classList.contains('leaf-popover')) return floatingSize.width;
        return 0;
      });
    const offsetHeightSpy = vi
      .spyOn(HTMLElement.prototype, 'offsetHeight', 'get')
      .mockImplementation(function (this: HTMLElement) {
        if (this.tagName === 'BUTTON') return triggerRect.height;
        if (this.classList.contains('leaf-popover')) return floatingSize.height;
        return 0;
      });
    const originalComputedStyle = window.getComputedStyle.bind(window);
    const computedSpy = vi
      .spyOn(window, 'getComputedStyle')
      .mockImplementation((element: Element, pseudo?: string | null) => {
        const computed = originalComputedStyle(element, pseudo);
        if (element.classList.contains('leaf-popover') && !pseudo) {
          return new Proxy(computed, {
            get(target, property) {
              if (
                property === 'borderTopWidth' ||
                property === 'borderRightWidth' ||
                property === 'borderBottomWidth' ||
                property === 'borderLeftWidth'
              ) {
                return '1px';
              }
              if (
                property === 'borderTopLeftRadius' ||
                property === 'borderTopRightRadius' ||
                property === 'borderBottomLeftRadius' ||
                property === 'borderBottomRightRadius'
              ) {
                return '14px';
              }
              const value = Reflect.get(target, property, target);
              return typeof value === 'function' ? value.bind(target) : value;
            },
          });
        }
        return computed;
      });
    const rectSpy = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        if (this.tagName === 'BUTTON') {
          return {
            x: triggerRect.left,
            y: triggerRect.top,
            left: triggerRect.left,
            top: triggerRect.top,
            right: triggerRect.left + triggerRect.width,
            bottom: triggerRect.top + triggerRect.height,
            width: triggerRect.width,
            height: triggerRect.height,
            toJSON: () => ({}),
          } as DOMRect;
        }
        if (this.classList.contains('leaf-popover')) {
          return {
            x: 0,
            y: 0,
            left: 0,
            top: 0,
            right: floatingSize.width,
            bottom: floatingSize.height,
            width: floatingSize.width,
            height: floatingSize.height,
            toJSON: () => ({}),
          } as DOMRect;
        }
        return {
          x: 0,
          y: 0,
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          width: 0,
          height: 0,
          toJSON: () => ({}),
        } as DOMRect;
      });
    try {
      const { rerender } = render(
        <Popover open placement="bottom-end" title="通知中心" content="最近消息">
          <Button>通知中心</Button>
        </Popover>,
      );
      await waitFor(() => {
        const panel = document.querySelector<HTMLElement>('.leaf-popover');
        expect(panel).toHaveAttribute('data-side', 'bottom');
        expect(panel).toHaveAttribute('data-align', 'end');
        expect(panel?.style.left).toBe('640px');
        // 触发按钮 [900, 960] 中点 930 - 面板 left 640 - 1px border = 289px
        expect(panel?.style.getPropertyValue('--leaf-floating-arrow-x')).toBe('289px');
      });

      // 居中 placement 靠右被 shift 左推时，箭头跟随指向触发元素而非留在 50%
      triggerRect = { left: 940, top: 20, width: 60, height: 32 };
      rerender(
        <Popover open placement="bottom" title="通知中心" content="最近消息">
          <Button>通知中心</Button>
        </Popover>,
      );
      fireEvent(window, new Event('resize'));
      await waitFor(() => {
        const panel = document.querySelector<HTMLElement>('.leaf-popover');
        expect(panel?.style.left).toBe('692px');
        // 触发按钮 [940, 1000] 中点 970 - 面板 left 692 - 1px border = 277px
        expect(panel?.style.getPropertyValue('--leaf-floating-arrow-x')).toBe('277px');
      });

      // 左侧竖向角对齐且触发器较矮时，箭头坐标被圆角安全区间夹紧到下限 20px
      triggerRect = { left: 400, top: 20, width: 60, height: 16 };
      rerender(
        <Popover open placement="left-start" title="通知中心" content="最近消息">
          <Button>通知中心</Button>
        </Popover>,
      );
      fireEvent(window, new Event('resize'));
      await waitFor(() => {
        const panel = document.querySelector<HTMLElement>('.leaf-popover');
        expect(panel).toHaveAttribute('data-side', 'left');
        expect(panel).toHaveAttribute('data-align', 'start');
        expect(panel?.style.getPropertyValue('--leaf-floating-arrow-y')).toBe('20px');
      });

      // 宽按钮下使用窄 Popover 角对齐时，按重合区间中心居中（(120 - 2) / 2 = 59px）
      triggerRect = { left: 100, top: 20, width: 400, height: 32 };
      floatingSize = { width: 120, height: 100 };
      rerender(
        <Popover open placement="bottom-end" width={120} title="详情" content="短内容">
          <Button>宽按钮</Button>
        </Popover>,
      );
      fireEvent(window, new Event('resize'));
      await waitFor(() => {
        const panel = document.querySelector<HTMLElement>('.leaf-popover');
        expect(panel).toHaveAttribute('data-side', 'bottom');
        expect(panel).toHaveAttribute('data-align', 'end');
        expect(panel?.style.left).toBe('380px');
        expect(panel?.style.getPropertyValue('--leaf-floating-arrow-x')).toBe('59px');
      });
    } finally {
      rectSpy.mockRestore();
      offsetWidthSpy.mockRestore();
      offsetHeightSpy.mockRestore();
      computedSpy.mockRestore();
      clientWidthSpy.mockRestore();
      clientHeightSpy.mockRestore();
    }
  });
});
