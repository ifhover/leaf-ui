import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Button, Tooltip } from '../index';

describe('Tooltip', () => {
  it('shows an arrow by default and allows it to be disabled', () => {
    const { rerender } = render(
      <Tooltip open content="Help">
        <Button>Hover</Button>
      </Tooltip>,
    );
    const panel = document.querySelector('.leaf-tooltip');
    expect(panel).toHaveAttribute('data-arrow', 'true');
    rerender(
      <Tooltip open arrow={false} content="Help">
        <Button>Hover</Button>
      </Tooltip>,
    );
    expect(document.querySelector('.leaf-tooltip')).toHaveAttribute('data-arrow', 'false');
  });

  it('opens on keyboard focus, merges descriptions and refs, and closes on Escape', async () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Tooltip content="Save changes">
        <Button ref={ref} aria-describedby="hint">
          Save
        </Button>
      </Tooltip>,
    );
    await act(async () => {
      ref.current?.focus();
    });
    const tooltip = screen.getByRole('tooltip');
    expect(ref.current).toHaveAttribute('aria-describedby', `hint ${tooltip.id}`);
    fireEvent.keyDown(document, { key: 'Escape' });
    await act(async () => {});
    expect(screen.queryByRole('tooltip')).toBeNull();
    expect(ref.current).toHaveAttribute('aria-describedby', 'hint');
  });
  it('cancels delayed appearances and keeps hover content reachable', async () => {
    vi.useFakeTimers();
    try {
      render(
        <Tooltip content="Help" enterDelay={200} leaveDelay={100}>
          <Button>Hover</Button>
        </Tooltip>,
      );
      const button = screen.getByRole('button');
      fireEvent.pointerEnter(button, { pointerType: 'mouse' });
      fireEvent.pointerLeave(button);
      await act(async () => {
        vi.advanceTimersByTime(300);
      });
      expect(screen.queryByRole('tooltip')).toBeNull();
      fireEvent.pointerEnter(button, { pointerType: 'mouse' });
      await act(async () => {
        vi.advanceTimersByTime(200);
      });
      const tooltip = screen.getByRole('tooltip');
      fireEvent.pointerLeave(button);
      fireEvent.pointerEnter(tooltip);
      await act(async () => {
        vi.advanceTimersByTime(200);
      });
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('closes after pointer leave even when the trigger was clicked and kept focus', async () => {
    const onClick = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <Tooltip content="Help" enterDelay={20} leaveDelay={20} onOpenChange={onOpenChange}>
        <Button onClick={onClick}>Action</Button>
      </Tooltip>,
    );
    const button = screen.getByRole('button', { name: 'Action' });
    await userEvent.hover(button);
    await waitFor(() => expect(screen.getByRole('tooltip')).toBeInTheDocument());

    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
    expect(button).toHaveFocus();
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    await userEvent.unhover(button);
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
    expect(button).toHaveFocus();
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
  });

  it('does not open on pointer click focus and still closes on pointer leave after Escape', async () => {
    render(
      <Tooltip content="Help" enterDelay={200} leaveDelay={20}>
        <Button>Action</Button>
      </Tooltip>,
    );
    const button = screen.getByRole('button', { name: 'Action' });

    // 指针点击触发聚焦不应直接弹开 Tooltip
    await userEvent.click(button);
    await userEvent.unhover(button);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 40));
    });
    expect(screen.queryByRole('tooltip')).toBeNull();

    // 键盘聚焦展开后按 Escape 收起，后续再悬停并移开仍应自动关闭
    await userEvent.click(document.body);
    await userEvent.tab();
    expect(button).toHaveFocus();
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('tooltip')).toBeNull();
    expect(button).toHaveFocus();

    await userEvent.hover(button);
    await waitFor(() => expect(screen.getByRole('tooltip')).toBeInTheDocument());
    await userEvent.unhover(button);
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
  });

  it('releases keyboard focus hold when clicked so moving pointer away closes it', async () => {
    render(
      <Tooltip content="Help" enterDelay={20} leaveDelay={20}>
        <Button>Action</Button>
      </Tooltip>,
    );
    const button = screen.getByRole('button', { name: 'Action' });
    await userEvent.tab();
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    await userEvent.click(button);
    await userEvent.unhover(button);
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
  });

  it('aligns the arrow toward the trigger on corner, shifted and vertical placements', async () => {
    const clientWidthSpy = vi
      .spyOn(document.documentElement, 'clientWidth', 'get')
      .mockReturnValue(1024);
    const clientHeightSpy = vi
      .spyOn(document.documentElement, 'clientHeight', 'get')
      .mockReturnValue(768);
    let triggerRect = { left: 900, top: 20, width: 54, height: 32 };
    let floatingSize = { width: 180, height: 36 };
    const offsetWidthSpy = vi
      .spyOn(HTMLElement.prototype, 'offsetWidth', 'get')
      .mockImplementation(function (this: HTMLElement) {
        if (this.tagName === 'BUTTON') return triggerRect.width;
        if (this.classList.contains('leaf-tooltip')) return floatingSize.width;
        return 0;
      });
    const offsetHeightSpy = vi
      .spyOn(HTMLElement.prototype, 'offsetHeight', 'get')
      .mockImplementation(function (this: HTMLElement) {
        if (this.tagName === 'BUTTON') return triggerRect.height;
        if (this.classList.contains('leaf-tooltip')) return floatingSize.height;
        return 0;
      });
    const originalComputedStyle = window.getComputedStyle.bind(window);
    const computedSpy = vi
      .spyOn(window, 'getComputedStyle')
      .mockImplementation((element: Element, pseudo?: string | null) => {
        const computed = originalComputedStyle(element, pseudo);
        if (element.classList.contains('leaf-tooltip') && !pseudo) {
          return new Proxy(computed, {
            get(target, property) {
              if (property === 'getPropertyValue') {
                return (name: string) =>
                  name === '--leaf-floating-arrow-size' ? '8px' : target.getPropertyValue(name);
              }
              if (
                property === 'borderTopWidth' ||
                property === 'borderRightWidth' ||
                property === 'borderBottomWidth' ||
                property === 'borderLeftWidth'
              ) {
                return '0px';
              }
              if (
                property === 'borderTopLeftRadius' ||
                property === 'borderTopRightRadius' ||
                property === 'borderBottomLeftRadius' ||
                property === 'borderBottomRightRadius'
              ) {
                return '10px';
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
        if (this.classList.contains('leaf-tooltip')) {
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
        <Tooltip open placement="bottom-end" content="Save project changes">
          <Button>Save</Button>
        </Tooltip>,
      );
      await waitFor(() => {
        const panel = document.querySelector<HTMLElement>('.leaf-tooltip');
        expect(panel).toHaveAttribute('data-side', 'bottom');
        expect(panel).toHaveAttribute('data-align', 'end');
        expect(panel?.style.left).toBe('774px');
        // 触发按钮 [900, 954] 中点 927 - 面板 left 774 = 153px
        expect(panel?.style.getPropertyValue('--leaf-floating-arrow-x')).toBe('153px');
      });

      // 居中 placement 靠右被 shift 左推时，箭头跟随指向触发元素
      triggerRect = { left: 940, top: 20, width: 54, height: 32 };
      rerender(
        <Tooltip open placement="bottom" content="Save project changes">
          <Button>Save</Button>
        </Tooltip>,
      );
      fireEvent(window, new Event('resize'));
      await waitFor(() => {
        const panel = document.querySelector<HTMLElement>('.leaf-tooltip');
        expect(panel?.style.left).toBe('832px');
        // 触发按钮 [940, 994] 中点 967 - 面板 left 832 = 135px
        expect(panel?.style.getPropertyValue('--leaf-floating-arrow-x')).toBe('135px');
      });

      // 竖向角对齐且触发器较矮时，8px 箭头与 10px 圆角将坐标安全夹紧在 16px
      triggerRect = { left: 400, top: 20, width: 54, height: 14 };
      floatingSize = { width: 160, height: 80 };
      rerender(
        <Tooltip open placement="left-start" content="Save project changes">
          <Button>Save</Button>
        </Tooltip>,
      );
      fireEvent(window, new Event('resize'));
      await waitFor(() => {
        const panel = document.querySelector<HTMLElement>('.leaf-tooltip');
        expect(panel).toHaveAttribute('data-side', 'left');
        expect(panel).toHaveAttribute('data-align', 'start');
        expect(panel?.style.getPropertyValue('--leaf-floating-arrow-y')).toBe('16px');
      });

      rerender(
        <Tooltip open arrow={false} placement="bottom-end" content="Save project changes">
          <Button>Save</Button>
        </Tooltip>,
      );
      expect(document.querySelector<HTMLElement>('.leaf-tooltip')).toHaveAttribute(
        'data-arrow',
        'false',
      );
      expect(
        document
          .querySelector<HTMLElement>('.leaf-tooltip')
          ?.style.getPropertyValue('--leaf-floating-arrow-x'),
      ).toBe('');
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
