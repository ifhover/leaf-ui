import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, StrictMode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  Button,
  ConfigProvider,
  ErrorBoundary,
  FileList,
  InfiniteScroll,
  Popconfirm,
  Tree,
  useLoadingBar,
  useNotification,
  VirtualList,
} from './index';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
const wrapper = ({ children }: { children: ReactNode }) => (
  <ConfigProvider locale="en-US">{children}</ConfigProvider>
);
describe('Async components and lifecycle', () => {
  it('updates a notification by key, inherits locale, and closes only that notification', async () => {
    const { result } = renderHook(() => useNotification(), { wrapper });
    act(() => {
      result.current.info({ key: 'a', title: 'Uploading', duration: 0 });
      result.current.success({ key: 'b', title: 'Other', duration: 0 });
    });
    expect(screen.getAllByRole('status')).toHaveLength(2);
    act(() => result.current.success({ key: 'a', title: 'Uploaded', duration: 0 }));
    expect(screen.queryByText('Uploading')).toBeNull();
    expect(screen.getAllByRole('status')).toHaveLength(2);
    act(() => result.current.close('a'));
    await waitFor(() => expect(screen.queryByText('Uploaded')).toBeNull());
    expect(screen.getByText('Other')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });
  it('pauses notification expiry while hovered, then resumes the remaining duration', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useNotification(), { wrapper });
    act(() => result.current.info({ title: 'Read me', duration: 2 }));
    act(() => vi.advanceTimersByTime(500));
    fireEvent.pointerEnter(screen.getByRole('status'));
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.getByText('Read me')).toBeInTheDocument();
    fireEvent.pointerLeave(screen.getByRole('status'));
    act(() => vi.advanceTimersByTime(1600));
    expect(screen.queryByRole('status')).toBeNull();
  });
  it('keeps the loading bar active until every concurrent task has finished', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useLoadingBar(), { wrapper });
    let first = () => {},
      second = () => {};
    act(() => {
      first = result.current.start();
      second = result.current.start();
    });
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    act(() => first());
    act(() => vi.advanceTimersByTime(400));
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    act(() => first());
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    act(() => second());
    act(() => vi.advanceTimersByTime(300));
    expect(screen.queryByRole('progressbar')).toBeNull();
  });
  it('keeps Popconfirm open after a rejected action and permits a retry without duplicate submissions', async () => {
    let reject: (reason: Error) => void = () => {};
    const confirm = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<void>((_resolve, fail) => {
            reject = fail;
          }),
      )
      .mockResolvedValueOnce(undefined);
    const fail = vi.fn();
    render(
      <ConfigProvider locale="en-US">
        <Popconfirm title="Delete file?" onConfirm={confirm} onError={fail}>
          <Button>Delete</Button>
        </Popconfirm>
      </ConfigProvider>,
    );
    await userEvent.click(screen.getByText('Delete'));
    await userEvent.click(screen.getByRole('button', { name: 'OK' }));
    await userEvent.click(screen.getByRole('button', { name: 'OK' }));
    expect(confirm).toHaveBeenCalledOnce();
    await act(async () => reject(new Error('Offline')));
    expect(screen.getByRole('alert')).toHaveTextContent('Action failed');
    expect(fail).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole('button', { name: 'OK' }));
    expect(confirm).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
  it('recovers ErrorBoundary when resetKeys changes and reports the original error', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const reported = vi.fn();
    function Broken({ broken }: { broken: boolean }) {
      if (broken) throw new Error('broken');
      return <span>Recovered</span>;
    }
    const { rerender } = render(
      <ErrorBoundary resetKeys={[0]} onError={reported} fallback={<p>Fallback</p>}>
        <Broken broken />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Fallback')).toBeInTheDocument();
    expect(reported).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'broken' }),
      expect.anything(),
    );
    rerender(
      <ErrorBoundary resetKeys={[1]} onError={reported} fallback={<p>Fallback</p>}>
        <Broken broken={false} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Recovered')).toBeInTheDocument();
  });
  it('offers manual loading without IntersectionObserver and retries failures', async () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const load = vi
      .fn()
      .mockRejectedValueOnce(new Error('Offline'))
      .mockResolvedValueOnce(undefined);
    render(
      <ConfigProvider locale="en-US">
        <InfiniteScroll dataLength={0} hasMore onLoadMore={load} />
      </ConfigProvider>,
    );
    await userEvent.click(await screen.findByRole('button', { name: 'Load more' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Loading failed. Retry' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Load more' }));
    await waitFor(() => expect(load).toHaveBeenCalledTimes(2));
  });
  it('prevents overlapping observer loads, aborts on unmount, and works in StrictMode', async () => {
    const callbacks: ((entries: Partial<IntersectionObserverEntry>[]) => void)[] = [];
    class Observer {
      constructor(callback: (entries: Partial<IntersectionObserverEntry>[]) => void) {
        callbacks.push(callback);
      }
      observe() {}
      disconnect() {}
    }
    vi.stubGlobal('IntersectionObserver', Observer);
    let signal: AbortSignal | undefined;
    const load = vi.fn(async (request: AbortSignal) => {
      signal = request;
      return new Promise<void>(() => {});
    });
    const { unmount } = render(
      <StrictMode>
        <InfiniteScroll dataLength={0} hasMore onLoadMore={load} />
      </StrictMode>,
    );
    act(() => {
      callbacks.at(-1)?.([{ isIntersecting: true }]);
      callbacks.at(-1)?.([{ isIntersecting: true }]);
    });
    await waitFor(() => expect(load).toHaveBeenCalledOnce());
    unmount();
    expect(signal?.aborted).toBe(true);
  });
  it('renders a bounded virtual window for ten thousand rows with list positions', () => {
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (
      this: HTMLElement,
    ) {
      return this.classList.contains('leaf-virtual-list') ? 240 : 40;
    });
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(400);
    const items = Array.from({ length: 10000 }, (_, i) => i);
    render(
      <VirtualList
        items={items}
        itemKey={(item) => item}
        renderItem={(item) => <span>Row {item}</span>}
        height={240}
        estimateSize={40}
      />,
    );
    const rows = screen.getAllByRole('listitem');
    expect(rows.length).toBeLessThan(30);
    expect(rows[0]).toHaveAttribute('aria-setsize', '10000');
    expect(rows[0]).toHaveAttribute('aria-posinset', '1');
  });
  it('retains the active Tree request during StrictMode replay and aborts it on unmount', async () => {
    let signal: AbortSignal | undefined;
    const load = vi.fn(async (_node, request: AbortSignal) => {
      signal = request;
      return new Promise<readonly []>(() => {});
    });
    const { unmount } = render(
      <StrictMode>
        <Tree
          data={[{ key: 'root', title: 'Root', isLeaf: false }]}
          defaultExpandedKeys={['root']}
          loadData={load}
        />
      </StrictMode>,
    );
    await waitFor(() => expect(load).toHaveBeenCalledOnce());
    await act(async () => {});
    unmount();
    expect(signal?.aborted).toBe(true);
  });
  it('provides download without a preview action for document files', () => {
    render(
      <ConfigProvider locale="en-US">
        <FileList items={[{ url: '/report.docx', name: 'report.docx' }]} />
      </ConfigProvider>,
    );
    expect(screen.getByText('report.docx')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Preview/ })).toBeNull();
    expect(screen.getByRole('link', { name: /Download/ })).toHaveAttribute('href', '/report.docx');
  });
});
