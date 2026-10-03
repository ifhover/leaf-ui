import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { MessageApi } from './message';
import { useMessage } from './message';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});
it('keeps the closing slot until its transition finishes and preserves following messages', async () => {
  let message: MessageApi | undefined;
  const onClose = vi.fn();
  function Example() {
    const result = useMessage();
    message = result.message;
    return result.contextHolder;
  }
  render(<Example />);
  await act(async () => {
    message?.open({ key: 'first', content: 'First', duration: 0, onClose });
    message?.open({ key: 'second', content: 'Second', duration: 0, closable: true });
  });
  const firstSlot = screen.getByText('First').closest('.leaf-message-slot');
  if (firstSlot instanceof HTMLElement) firstSlot.style.transitionDuration = '160ms';
  const secondMessage = screen.getByText('Second').closest('.leaf-message');
  const closeButton = screen.getByRole('button', { name: '关闭' });
  closeButton.focus();
  act(() => message?.close('first'));
  expect(firstSlot).toHaveAttribute('data-state', 'closing');
  expect(firstSlot).toBeInTheDocument();
  expect(screen.getAllByRole('status')).toHaveLength(1);
  expect(screen.getByText('Second').closest('.leaf-message')).toBe(secondMessage);
  expect(closeButton).toHaveFocus();
  expect(onClose).toHaveBeenCalledOnce();
  if (firstSlot) fireEvent.transitionEnd(firstSlot, { propertyName: 'opacity' });
  await waitFor(() => expect(firstSlot).not.toBeInTheDocument());
  expect(screen.getByRole('status')).toHaveTextContent('Second');
  expect(closeButton).toHaveFocus();
});
it('updates a loading message by key and closes only once', async () => {
  let message: MessageApi | undefined;
  const onClose = vi.fn();
  function Example() {
    const result = useMessage();
    message = result.message;
    return result.contextHolder;
  }
  render(<Example />);
  await act(async () => {
    message?.open({ key: 'save', content: 'Saving', type: 'loading' });
  });
  await act(async () => {
    message?.open({
      key: 'save',
      content: 'Saved',
      type: 'success',
      duration: 0,
      closable: true,
      onClose,
    });
  });
  expect(screen.getAllByRole('status')).toHaveLength(1);
  expect(screen.getByRole('status')).toHaveTextContent('Saved');
  fireEvent.click(screen.getByRole('button', { name: '关闭' }));
  await waitFor(() => expect(screen.queryByRole('status')).toBeNull());
  expect(onClose).toHaveBeenCalledOnce();
});
it('pauses dismissal while hovered and resumes with the remaining time', async () => {
  let message: MessageApi | undefined;
  function Example() {
    const result = useMessage();
    message = result.message;
    return result.contextHolder;
  }
  render(<Example />);
  await act(async () => {});
  vi.useFakeTimers();
  act(() => {
    message?.open({ content: 'Hello', duration: 1 });
  });
  act(() => vi.advanceTimersByTime(400));
  fireEvent.pointerEnter(screen.getByRole('status'));
  act(() => vi.advanceTimersByTime(2000));
  expect(screen.getByRole('status')).toBeInTheDocument();
  fireEvent.pointerLeave(screen.getByRole('status'));
  act(() => vi.advanceTimersByTime(599));
  expect(screen.getByRole('status')).toBeInTheDocument();
  act(() => vi.advanceTimersByTime(10));
  act(() => vi.runOnlyPendingTimers());
  expect(screen.queryByRole('status')).toBeNull();
});
