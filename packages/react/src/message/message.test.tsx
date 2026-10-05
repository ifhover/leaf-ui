import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { StrictMode, useEffect } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, expect, it, vi } from 'vitest';
import { ConfigProvider, MessageProvider } from '../index';
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
    return null;
  }
  render(
    <MessageProvider>
      <Example />
    </MessageProvider>,
  );
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
    return null;
  }
  render(
    <MessageProvider>
      <Example />
    </MessageProvider>,
  );
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
    return null;
  }
  render(
    <MessageProvider>
      <Example />
    </MessageProvider>,
  );
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

it('shares one queue without holders and keeps messages across consumer unmounts', async () => {
  let first: MessageApi | undefined;
  let second: MessageApi | undefined;
  const renders = vi.fn();
  function First() {
    const result = useMessage();
    first = result.message;
    renders();
    expect(result).not.toHaveProperty('contextHolder');
    return null;
  }
  function Second() {
    second = useMessage().message;
    return null;
  }
  const { rerender } = render(
    <ConfigProvider>
      <First />
      <Second />
    </ConfigProvider>,
  );
  const before = renders.mock.calls.length;
  let key = '';
  await act(async () => {
    key = first?.loading('Saving across pages') ?? '';
    second?.info('Another page', 0);
  });
  expect(screen.getAllByRole('status')).toHaveLength(2);
  expect(document.querySelectorAll('.leaf-message-region')).toHaveLength(1);
  expect(renders).toHaveBeenCalledTimes(before);
  rerender(
    <ConfigProvider>
      <Second />
    </ConfigProvider>,
  );
  await act(async () => {
    second?.open({ key, content: 'Saved from another page', duration: 0 });
  });
  expect(screen.getAllByRole('status')).toHaveLength(2);
  expect(screen.queryByText('Saving across pages')).toBeNull();
  expect(screen.getByText('Saved from another page')).toBeInTheDocument();
  act(() => second?.close());
  await waitFor(() => expect(screen.queryByRole('status')).toBeNull());
});

it('applies the calling region settings and updates existing messages when they change', async () => {
  let outer: MessageApi | undefined;
  let inner: MessageApi | undefined;
  function Outer() {
    outer = useMessage().message;
    return null;
  }
  function Inner() {
    inner = useMessage().message;
    return null;
  }
  const app = (english: boolean) => (
    <ConfigProvider theme={{ borderRadius: 8 }}>
      <Outer />
      <ConfigProvider
        locale={english ? 'en-US' : 'zh-CN'}
        theme={{ borderRadius: english ? 4 : 16, appearance: english ? 'dark' : 'light' }}
      >
        <Inner />
      </ConfigProvider>
    </ConfigProvider>
  );
  const { rerender } = render(app(true));
  await act(async () => {
    outer?.open({ content: 'Outer message', duration: 0, closable: true });
    inner?.open({ content: 'Inner message', duration: 0, closable: true });
  });
  expect(document.querySelectorAll('.leaf-message-region')).toHaveLength(1);
  const outerSlot = screen.getByText('Outer message').closest('.leaf-message-slot') as HTMLElement;
  const innerSlot = screen.getByText('Inner message').closest('.leaf-message-slot') as HTMLElement;
  expect(outerSlot.style.getPropertyValue('--leaf-radius')).toBe('8px');
  expect(innerSlot.style.getPropertyValue('--leaf-radius')).toBe('4px');
  expect(innerSlot).toHaveAttribute('data-leaf-theme', 'dark');
  expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  const api = inner;
  rerender(app(false));
  expect(inner).toBe(api);
  expect(innerSlot.style.getPropertyValue('--leaf-radius')).toBe('16px');
  expect(innerSlot).toHaveAttribute('data-leaf-theme', 'light');
  expect(screen.getAllByRole('button', { name: '关闭' })).toHaveLength(2);
});

it('isolates providers and ignores delayed calls after the owning provider unmounts', async () => {
  let first: MessageApi | undefined;
  let second: MessageApi | undefined;
  function First() {
    first = useMessage().message;
    return null;
  }
  function Second() {
    second = useMessage().message;
    return null;
  }
  const root = render(
    <MessageProvider>
      <First />
    </MessageProvider>,
  );
  render(
    <MessageProvider>
      <Second />
    </MessageProvider>,
  );
  await act(async () => {
    first?.open({ key: 'same', content: 'First root', duration: 0 });
    second?.open({ key: 'same', content: 'Second root', duration: 0 });
  });
  act(() => first?.close('same'));
  await waitFor(() => expect(screen.queryByText('First root')).toBeNull());
  expect(screen.getByText('Second root')).toBeInTheDocument();
  root.unmount();
  act(() => first?.success('Late result', 0));
  expect(screen.queryByText('Late result')).toBeNull();
  expect(screen.getByText('Second root')).toBeInTheDocument();
});

it('can open from effects under StrictMode with one managed queue', async () => {
  function Example() {
    const { message } = useMessage();
    useEffect(() => {
      message.open({ key: 'mounted', content: 'Ready', duration: 0 });
    }, [message]);
    return null;
  }
  render(
    <StrictMode>
      <ConfigProvider>
        <Example />
      </ConfigProvider>
    </StrictMode>,
  );
  expect(await screen.findByRole('status')).toHaveTextContent('Ready');
  expect(document.querySelectorAll('.leaf-message-region')).toHaveLength(1);
});

it('renders no queue on the server and hydrates an independent provider', async () => {
  let message: MessageApi | undefined;
  function Example() {
    message = useMessage().message;
    return <button type="button">Save</button>;
  }
  const app = (
    <ConfigProvider>
      <Example />
    </ConfigProvider>
  );
  const container = document.createElement('div');
  container.innerHTML = renderToString(app);
  document.body.append(container);
  const button = container.querySelector('button');
  expect(container.querySelector('.leaf-message-region')).toBeNull();
  const recover = vi.fn();
  const root = hydrateRoot(container, app, { onRecoverableError: recover });
  try {
    await act(async () => {});
    expect(recover).not.toHaveBeenCalled();
    expect(container.querySelector('button')).toBe(button);
    await act(async () => message?.success('Hydrated', 0));
    expect(screen.getByRole('status')).toHaveTextContent('Hydrated');
  } finally {
    await act(async () => root.unmount());
    container.remove();
  }
  expect(screen.queryByRole('status')).toBeNull();
});
