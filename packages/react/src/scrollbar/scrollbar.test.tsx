import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createRef, StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from '../config-provider';
import { ScrollArea } from '../scrollarea';
import { Scrollbar } from './scrollbar';

let width = 300;
let height = 160;
let scrollWidth = 900;
let scrollHeight = 800;
const callbacks: ResizeObserverCallback[] = [];
const disconnect = vi.fn();

beforeEach(() => {
  width = 300;
  height = 160;
  scrollWidth = 900;
  scrollHeight = 800;
  callbacks.length = 0;
  disconnect.mockClear();
  for (const [property, value] of Object.entries({
    clientWidth: () => width,
    clientHeight: () => height,
    scrollWidth: () => scrollWidth,
    scrollHeight: () => scrollHeight,
  }))
    vi.spyOn(HTMLElement.prototype, property as 'clientWidth', 'get').mockImplementation(value);
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: ResizeObserverCallback) {
        callbacks.push(callback);
      }
      observe() {}
      disconnect = disconnect;
    },
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('Scrollbar', () => {
  it('forwards viewport refs, names and scroll events while preserving native wheel behavior', () => {
    const ref = createRef<HTMLDivElement>();
    const onScroll = vi.fn((event) => event.currentTarget);
    const wheel = vi.fn();
    render(
      <Scrollbar
        ref={ref}
        id="projects"
        aria-label="Projects"
        height={160}
        className="wrapper"
        viewportClassName="viewport"
        onScroll={onScroll}
        onWheel={wheel}
      >
        Items
      </Scrollbar>,
    );
    expect(ref.current).toBe(screen.getByRole('region', { name: 'Projects' }));
    expect(ref.current).toHaveClass('leaf-scrollbar__viewport', 'viewport');
    expect(ref.current).toHaveStyle({ height: '100%' });
    expect(ref.current?.parentElement).toHaveClass('wrapper');
    expect(fireEvent.wheel(ref.current as HTMLDivElement, { deltaY: 100, cancelable: true })).toBe(
      true,
    );
    expect(wheel).toHaveBeenCalledOnce();
    fireEvent.scroll(ref.current as HTMLDivElement);
    expect(onScroll.mock.results[0]?.value).toBe(ref.current);
    expect(ref.current?.parentElement).toHaveAttribute('data-scrolling');
    expect(screen.getAllByRole('scrollbar')).toHaveLength(2);
    expect(screen.getAllByRole('scrollbar')[0]).toHaveAttribute('aria-controls', 'projects');
  });

  it('updates thumbs for native scrolling, keyboard commands and resize', async () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <ConfigProvider locale="en-US">
        <Scrollbar ref={ref} height={160}>
          Items
        </Scrollbar>
      </ConfigProvider>,
    );
    const vertical = screen.getByRole('scrollbar', { name: 'Vertical scrollbar' });
    expect(vertical).toHaveAttribute('aria-valuemax', '640');
    fireEvent.keyDown(vertical, { key: 'End' });
    await waitFor(() => expect(vertical).toHaveAttribute('aria-valuenow', '640'));
    expect(ref.current?.scrollTop).toBe(640);
    fireEvent.keyDown(vertical, { key: 'Home' });
    await waitFor(() => expect(vertical).toHaveAttribute('aria-valuenow', '0'));
    fireEvent.keyDown(vertical, { key: 'PageDown' });
    await waitFor(() => expect(vertical).toHaveAttribute('aria-valuenow', '160'));
    fireEvent.keyDown(vertical, { key: 'End' });
    fireEvent.keyDown(vertical, { key: 'Home' });
    fireEvent.keyDown(vertical, { key: 'PageDown' });
    expect(ref.current?.scrollTop).toBe(160);
    scrollHeight = 160;
    scrollWidth = 300;
    act(() => callbacks[0]?.([], {} as ResizeObserver));
    await waitFor(() => expect(screen.queryByRole('scrollbar')).not.toBeInTheDocument());
  });

  it('preserves RTL horizontal scrolling and honors axes, hidden bars and header offset', async () => {
    const ref = createRef<HTMLDivElement>();
    const { rerender } = render(
      <ConfigProvider locale="en-US">
        <Scrollbar ref={ref} height={160} viewportStyle={{ direction: 'rtl' }} verticalOffset={44}>
          Items
        </Scrollbar>
      </ConfigProvider>,
    );
    expect(screen.getByRole('scrollbar', { name: 'Vertical scrollbar' }).parentElement).toHaveStyle(
      { top: '48px' },
    );
    fireEvent.keyDown(screen.getByRole('scrollbar', { name: 'Horizontal scrollbar' }), {
      key: 'End',
    });
    await waitFor(() => expect(ref.current?.scrollLeft).toBe(-600));
    rerender(
      <Scrollbar ref={ref} orientation="vertical">
        Items
      </Scrollbar>,
    );
    expect(screen.getAllByRole('scrollbar')).toHaveLength(1);
    rerender(
      <Scrollbar ref={ref} scrollbar="hidden">
        Items
      </Scrollbar>,
    );
    expect(screen.queryByRole('scrollbar')).not.toBeInTheDocument();
    expect(ref.current).toHaveStyle({ overflowY: 'auto' });
  });

  it('keeps ScrollArea compatible, cleans observers in StrictMode and supports SSR', () => {
    const ref = createRef<HTMLDivElement>();
    const { unmount } = render(
      <StrictMode>
        <ScrollArea ref={ref} maxHeight={160} aria-label="Items">
          Content
        </ScrollArea>
      </StrictMode>,
    );
    expect(ref.current?.parentElement).toHaveClass('leaf-scroll-area', 'leaf-scrollbar');
    expect(ref.current?.parentElement).toHaveStyle({ maxHeight: '160px' });
    expect(ref.current).toHaveStyle({ overflowX: 'hidden' });
    expect(screen.getAllByRole('scrollbar')).toHaveLength(1);
    unmount();
    expect(disconnect).toHaveBeenCalledTimes(2);
    expect(renderToString(<Scrollbar height={160}>Server content</Scrollbar>)).toContain(
      'Server content',
    );
  });
});
