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
});
