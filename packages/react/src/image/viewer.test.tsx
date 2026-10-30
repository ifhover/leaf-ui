import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Fragment, type ReactNode, StrictMode, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from '../config-provider';
import { ImagePreviewControl } from './image';
import { useImagePreview } from './provider';
import type { ImagePreviewItem } from './types';
import { ImageViewer } from './viewer';

const items = [
  { src: '/one.png', alt: 'First' },
  { src: '/two.png', alt: 'Second' },
  { src: '/three.png', alt: 'Third' },
] as const satisfies readonly ImagePreviewItem[];
function Region({ children }: { children: ReactNode }) {
  return <ConfigProvider theme={{ motion: false }}>{children}</ConfigProvider>;
}
function currentImage() {
  const image = screen
    .getByRole('dialog')
    .querySelector<HTMLImageElement>('.leaf-image-viewer__image');
  if (!image) throw new Error('Missing preview image');
  return image;
}
async function canvas() {
  await screen.findByRole('dialog', { name: '图片预览' });
  const image = currentImage();
  fireEvent.load(image);
  return image;
}
function button(name: string) {
  return screen.getByRole('toolbar').querySelector(`[aria-label="${name}"]`) as HTMLButtonElement;
}
function scale(image: HTMLImageElement) {
  return Number(image.style.transform.match(/scale\(([^,]+)/)?.[1]);
}
let frames: Map<number, FrameRequestCallback>;
function flushFrame() {
  act(() => {
    const pending = [...frames.values()];
    frames.clear();
    for (const callback of pending) callback(0);
  });
}
beforeEach(() => {
  frames = new Map();
  let frame = 0;
  vi.stubGlobal(
    'requestAnimationFrame',
    vi.fn((callback: FrameRequestCallback) => {
      frames.set(++frame, callback);
      return frame;
    }),
  );
  vi.stubGlobal(
    'cancelAnimationFrame',
    vi.fn((id: number) => frames.delete(id)),
  );
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
  vi.stubGlobal(
    'PointerEvent',
    class extends MouseEvent {
      pointerId: number;
      pointerType: string;
      constructor(type: string, options: PointerEventInit = {}) {
        super(type, options);
        this.pointerId = options.pointerId ?? 0;
        this.pointerType = options.pointerType ?? 'mouse';
      }
    },
  );
  vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(960);
  vi.spyOn(HTMLImageElement.prototype, 'naturalHeight', 'get').mockReturnValue(640);
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('self-contained image preview', () => {
  it('shows the shell and controls before the image loads, with no fullscreen action', async () => {
    render(
      <Region>
        <ImageViewer open items={items} onClose={() => {}} />
      </Region>,
    );
    await screen.findByRole('dialog');
    expect(screen.getByRole('toolbar')).toBeInTheDocument();
    expect(screen.getByRole('status', { name: '图片' })).toBeInTheDocument();
    expect(within(screen.getByRole('toolbar')).getAllByRole('button')).toHaveLength(10);
    expect(screen.queryByRole('button', { name: /幻灯片/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /全屏/ })).not.toBeInTheDocument();
    expect(currentImage()).toHaveAttribute('fetchpriority', 'high');
  });
  it('wraps navigation and reports changes without repeating the initial index', async () => {
    const changed = vi.fn();
    render(
      <Region>
        <ImageViewer open items={items} index={2} onIndexChange={changed} onClose={() => {}} />
      </Region>,
    );
    expect(await canvas()).toHaveAttribute('src', '/three.png');
    fireEvent.click(button('下一张'));
    expect(await canvas()).toHaveAttribute('src', '/one.png');
    fireEvent.click(button('上一张'));
    expect(await canvas()).toHaveAttribute('src', '/three.png');
    expect(changed.mock.calls).toEqual([[0], [2]]);
  });
  it('preserves the image and transform during controlled index writeback and locale updates', async () => {
    function Gallery() {
      const [index, setIndex] = useState(0);
      return (
        <ImageViewer
          open
          items={items.map((item) => ({ ...item }))}
          index={index}
          onIndexChange={setIndex}
          onClose={() => {}}
        />
      );
    }
    const { rerender } = render(
      <StrictMode>
        <ConfigProvider theme={{ motion: false }}>
          <Gallery />
        </ConfigProvider>
      </StrictMode>,
    );
    await canvas();
    const dialog = screen.getByRole('dialog');
    fireEvent.click(button('下一张'));
    const image = await canvas();
    fireEvent.click(button('顺时针旋转'));
    rerender(
      <StrictMode>
        <ConfigProvider locale="en-US" theme={{ motion: false }}>
          <Gallery />
        </ConfigProvider>
      </StrictMode>,
    );
    expect(screen.getByRole('dialog')).toBe(dialog);
    expect(currentImage()).toBe(image);
    expect(image.style.transform).toContain('rotate(90deg)');
    expect(screen.getByRole('button', { name: 'Rotate clockwise' })).toBeInTheDocument();
  });
  it('supports zoom below fit, 1:1, rotations, both flips and complete reset', async () => {
    render(
      <Region>
        <ImageViewer open items={items} onClose={() => {}} />
      </Region>,
    );
    const image = await canvas();
    const initial = image.style.transform;
    const ratio = scale(image);
    fireEvent.click(button('缩小'));
    expect(scale(image)).toBeLessThan(ratio);
    fireEvent.click(button('原始尺寸（1:1）'));
    expect(scale(image)).toBe(1);
    fireEvent.click(button('顺时针旋转'));
    fireEvent.click(button('水平翻转'));
    fireEvent.click(button('垂直翻转'));
    expect(image.style.transform).toContain('rotate(90deg) scale(-1, -1)');
    fireEvent.click(button('重置图片'));
    expect(image.style.transform).toBe(initial);
    fireEvent.doubleClick(image, { clientX: 400, clientY: 300 });
    expect(scale(image)).toBe(1);
  });
  it('keeps original URLs separate from thumbnails and retains navigation without thumbnails', async () => {
    render(
      <Region>
        <ImageViewer
          open
          thumbnails={false}
          items={[{ ...items[0], src: '/original.png', thumbnailSrc: '/thumb.png' }, items[1]]}
          onClose={() => {}}
        />
      </Region>,
    );
    expect(await canvas()).toHaveAttribute('src', '/original.png');
    expect(screen.queryByRole('navigation', { name: '图片列表' })).toBeNull();
    fireEvent.click(button('下一张'));
    expect(await canvas()).toHaveAttribute('src', '/two.png');
  });
  it('resets duplicate-URL image selections and handles pointer-captured mouse double-clicks', async () => {
    render(
      <Region>
        <ImageViewer open items={[items[0], items[0]]} onClose={() => {}} />
      </Region>,
    );
    const image = await canvas();
    const surface = image.parentElement;
    if (!surface) throw new Error('Missing canvas');
    fireEvent.pointerDown(image, { pointerId: 1, button: 0 });
    fireEvent.pointerUp(surface, { pointerId: 1 });
    fireEvent.click(surface);
    fireEvent.doubleClick(surface);
    expect(scale(image)).toBe(1);
    fireEvent.click(button('顺时针旋转'));
    fireEvent.click(button('下一张'));
    const next = await canvas();
    expect(next).not.toBe(image);
    expect(next.style.transform).toContain('rotate(0deg)');
  });
  it('drags the thumbnail strip without selecting the released button again', async () => {
    render(
      <Region>
        <ImageViewer open items={items} onClose={() => {}} />
      </Region>,
    );
    await canvas();
    const strip = screen.getByRole('navigation');
    fireEvent.pointerDown(strip, { pointerId: 1, button: 0, clientX: 100 });
    fireEvent.pointerMove(strip, { pointerId: 1, clientX: 69 });
    fireEvent.pointerUp(strip, { pointerId: 1, clientX: 69 });
    fireEvent.click(screen.getByRole('button', { name: '查看第 1 张图片: First' }));
    expect(await canvas()).toHaveAttribute('src', '/two.png');
    fireEvent.click(screen.getByRole('button', { name: '查看第 3 张图片: Third' }));
    expect(await canvas()).toHaveAttribute('src', '/three.png');
  });
  it('warms at most two adjacent originals at low priority only after the current image loads', async () => {
    const preloads: HTMLImageElement[] = [];
    vi.stubGlobal(
      'Image',
      class extends window.Image {
        constructor() {
          super();
          preloads.push(this);
        }
      },
    );
    render(
      <Region>
        <ImageViewer open items={items} onClose={() => {}} />
      </Region>,
    );
    await screen.findByRole('dialog');
    expect(preloads).toHaveLength(0);
    await canvas();
    expect(preloads.map((image) => image.getAttribute('src')).sort()).toEqual([
      '/three.png',
      '/two.png',
    ]);
    expect(preloads.every((image) => image.fetchPriority === 'low')).toBe(true);
  });
  it('selects thumbnails, responds to external order/data changes and resets stale transforms', async () => {
    const props = { open: true, onClose: () => {} };
    const { rerender } = render(
      <Region>
        <ImageViewer {...props} items={items} />
      </Region>,
    );
    await canvas();
    fireEvent.click(screen.getByRole('button', { name: '查看第 3 张图片: Third' }));
    const image = await canvas();
    fireEvent.click(button('顺时针旋转'));
    rerender(
      <Region>
        <ImageViewer
          {...props}
          index={1}
          items={[items[2], { src: '/updated.png', alt: 'Updated' }]}
        />
      </Region>,
    );
    expect(await canvas()).toHaveAttribute('src', '/updated.png');
    expect(currentImage().style.transform).toContain('rotate(0deg)');
    expect(screen.getByRole('button', { name: '查看第 2 张图片: Updated' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    expect(image.isConnected).toBe(false);
  });
  it('uses left/right for navigation and up/down for zoom even after zooming', async () => {
    render(
      <Region>
        <ImageViewer open items={items} onClose={() => {}} />
      </Region>,
    );
    const first = await canvas();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'ArrowUp' });
    expect(scale(first)).toBeGreaterThan(1);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'ArrowRight' });
    expect(await canvas()).toHaveAttribute('src', '/two.png');
  });
  it('coalesces wheel/drag transform writes into animation frames without React rerenders', async () => {
    render(
      <Region>
        <ImageViewer open items={items} onClose={() => {}} />
      </Region>,
    );
    const image = await canvas();
    const surface = image.parentElement;
    if (!surface) throw new Error('Missing canvas');
    const initial = image.style.transform;
    const initialRatio = scale(image);
    fireEvent.wheel(surface, { deltaY: -100, clientX: 512, clientY: 384 });
    fireEvent.wheel(surface, { deltaY: -100, clientX: 512, clientY: 384 });
    expect(image.style.transform).toBe(initial);
    expect(frames.size).toBe(1);
    flushFrame();
    expect(scale(image)).toBeCloseTo(initialRatio * 1.21);
    fireEvent.pointerDown(image, { pointerId: 1, button: 0, clientX: 100, clientY: 100 });
    fireEvent.pointerMove(surface, { pointerId: 1, clientX: 140, clientY: 120 });
    fireEvent.pointerMove(surface, { pointerId: 1, clientX: 180, clientY: 150 });
    expect(frames.size).toBe(1);
    flushFrame();
    expect(image.style.transform).toContain('translate3d(80px, 50px, 0)');
    fireEvent.pointerUp(surface, { pointerId: 1, clientX: 180, clientY: 150 });
    expect(currentImage()).toBe(image);
    expect(screen.getByRole('dialog')).not.toHaveAttribute('data-moving');
  });
  it('handles touch pinch/rotation, cancellation and swipe without accidentally closing', async () => {
    const closed = vi.fn();
    render(
      <Region>
        <ImageViewer open items={items} onClose={closed} />
      </Region>,
    );
    const image = await canvas();
    const initialRatio = scale(image);
    const surface = image.parentElement;
    if (!surface) throw new Error('Missing canvas');
    fireEvent.pointerDown(image, {
      pointerId: 1,
      pointerType: 'touch',
      button: 0,
      clientX: 100,
      clientY: 100,
    });
    fireEvent.pointerDown(image, {
      pointerId: 2,
      pointerType: 'touch',
      button: 0,
      clientX: 200,
      clientY: 100,
    });
    fireEvent.pointerMove(surface, {
      pointerId: 2,
      pointerType: 'touch',
      clientX: 100,
      clientY: 300,
    });
    flushFrame();
    expect(scale(image)).toBeCloseTo(initialRatio * 2);
    expect(image.style.transform).toContain('rotate(90deg)');
    fireEvent.pointerCancel(surface, { pointerId: 2, pointerType: 'touch' });
    fireEvent.pointerCancel(surface, { pointerId: 1, pointerType: 'touch' });
    expect(screen.getByRole('dialog')).not.toHaveAttribute('data-moving');
    fireEvent.click(button('重置图片'));
    fireEvent.pointerDown(image, {
      pointerId: 3,
      pointerType: 'touch',
      button: 0,
      clientX: 200,
      clientY: 100,
    });
    fireEvent.pointerMove(surface, {
      pointerId: 3,
      pointerType: 'touch',
      clientX: 100,
      clientY: 100,
    });
    fireEvent.pointerUp(surface, {
      pointerId: 3,
      pointerType: 'touch',
      clientX: 100,
      clientY: 100,
    });
    fireEvent.click(surface);
    expect(closed).not.toHaveBeenCalled();
    expect(await canvas()).toHaveAttribute('src', '/two.png');
  });
  it('renders only a bounded thumbnail window for a large gallery', async () => {
    const many = Array.from({ length: 10000 }, (_, index) => ({ src: `/${index}.png` }));
    render(
      <Region>
        <ImageViewer open index={5000} items={many} onClose={() => {}} />
      </Region>,
    );
    await screen.findByRole('dialog');
    expect(screen.getByRole('navigation').querySelectorAll('img').length).toBeLessThanOrEqual(11);
    expect(screen.getByRole('dialog').querySelectorAll('.leaf-image-viewer__image')).toHaveLength(
      1,
    );
    expect(screen.getByRole('dialog')).toHaveAccessibleDescription('第 5001 张，共 10000 张');
    const selected = screen.getByRole('button', { name: '查看第 5001 张图片' });
    selected.focus();
    for (let index = 0; index < 8; index++)
      fireEvent.keyDown(document.activeElement ?? selected, { key: 'ArrowRight' });
    expect(screen.getByRole('button', { name: '查看第 5009 张图片' })).toHaveFocus();
  });
  it('supports side navigation without thumbnails, wraps at both ends and never dismisses on navigation', async () => {
    const closed = vi.fn();
    render(
      <Region>
        <ImageViewer open items={items} thumbnails={false} onClose={closed} />
      </Region>,
    );
    await canvas();
    const dialog = screen.getByRole('dialog');
    const previous = dialog.querySelector('.leaf-image-viewer__navigation--previous');
    const next = dialog.querySelector('.leaf-image-viewer__navigation--next');
    if (!previous || !next) throw new Error('Missing side navigation');
    expect(previous).toHaveAccessibleName('上一张');
    expect(next).toHaveAccessibleName('下一张');
    fireEvent.click(previous);
    expect(await canvas()).toHaveAttribute('src', '/three.png');
    fireEvent.click(next);
    expect(await canvas()).toHaveAttribute('src', '/one.png');
    fireEvent.click(next);
    expect(await canvas()).toHaveAttribute('src', '/two.png');
    expect(closed).not.toHaveBeenCalled();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(closed).toHaveBeenCalledOnce();
  });
  it('keeps the closing surface mounted through the final fade and completes once', async () => {
    const closed = vi.fn();
    render(
      <ConfigProvider theme={{ motion: true }}>
        <ImageViewer open items={items} onClose={closed} />
      </ConfigProvider>,
    );
    await canvas();
    const dialog = screen.getByRole('dialog');
    fireEvent.click(screen.getByRole('button', { name: '关闭预览' }));
    expect(dialog).toHaveAttribute('data-state', 'closing');
    expect(closed).not.toHaveBeenCalled();
    fireEvent.transitionEnd(dialog, { propertyName: 'opacity' });
    await waitFor(() => expect(closed).toHaveBeenCalledOnce());
    expect(screen.queryByRole('dialog')).toBeNull();
  });
  it('hides side navigation for one image and never advances automatically', async () => {
    render(
      <Region>
        <ImageViewer open items={[items[0]]} onClose={() => {}} />
      </Region>,
    );
    const image = await canvas();
    expect(screen.getByRole('dialog').querySelector('.leaf-image-viewer__navigation')).toBeNull();
    expect(button('上一张')).toBeDisabled();
    expect(button('下一张')).toBeDisabled();
    vi.useFakeTimers();
    act(() => vi.advanceTimersByTime(15000));
    expect(currentImage()).toBe(image);
    expect(image).toHaveAttribute('src', '/one.png');
  });
  it('cancels downloads on navigation, hides exclusions and offers an original link on failure', async () => {
    const fetcher = vi.fn((_url: string, _options: RequestInit) => new Promise<Response>(() => {}));
    vi.stubGlobal('fetch', fetcher);
    render(
      <Region>
        <ImageViewer
          open
          downloadable
          items={[items[0], { ...items[1], download: false }, items[2]]}
          onClose={() => {}}
        />
      </Region>,
    );
    await canvas();
    fireEvent.click(button('下载图片'));
    const signal = fetcher.mock.calls[0]?.[1].signal;
    fireEvent.click(button('下一张'));
    expect(signal?.aborted).toBe(true);
    expect(screen.queryByRole('button', { name: '下载图片' })).toBeNull();
    fireEvent.click(button('下一张'));
    fetcher.mockRejectedValueOnce(new Error('CORS'));
    fireEvent.click(button('下载图片'));
    expect(await screen.findByRole('alert')).toHaveTextContent('下载失败');
    expect(screen.getByRole('link', { name: '打开原图' })).toHaveAttribute('href', '/three.png');
  });
  it('shows loading failures without losing navigation', async () => {
    render(
      <Region>
        <ImageViewer open items={items} onClose={() => {}} />
      </Region>,
    );
    await screen.findByRole('dialog');
    fireEvent.error(currentImage());
    expect(screen.getByRole('alert')).toHaveTextContent('图片加载失败');
    fireEvent.click(button('下一张'));
    expect(await canvas()).toHaveAttribute('src', '/two.png');
    expect(screen.queryByRole('alert')).toBeNull();
  });
  it('replaces identical-image sessions and releases frames and body locks on StrictMode unmount', async () => {
    const closed = vi.fn();
    const props = { open: true, items, onClose: closed };
    const { rerender, unmount } = render(
      <StrictMode>
        <Region>
          <ImageViewer {...props} session={Symbol()} />
        </Region>
      </StrictMode>,
    );
    const image = await canvas();
    fireEvent.click(button('水平翻转'));
    rerender(
      <StrictMode>
        <Region>
          <ImageViewer {...props} session={Symbol()} />
        </Region>
      </StrictMode>,
    );
    expect(await canvas()).not.toBe(image);
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    unmount();
    expect(document.body.style.overflow).not.toBe('hidden');
    expect(frames.size).toBe(0);
    expect(closed).not.toHaveBeenCalled();
  });
  it('connects the actual service to navigation, external close and focus return', async () => {
    const changed = vi.fn();
    const closed = vi.fn();
    let close = () => {};
    function Caller() {
      const { preview } = useImagePreview();
      return (
        <button
          type="button"
          onClick={() => {
            close = preview(items, { onIndexChange: changed, onClose: closed });
          }}
        >
          Open gallery
        </button>
      );
    }
    render(
      <Region>
        <Caller />
      </Region>,
    );
    const opener = screen.getByRole('button', { name: 'Open gallery' });
    opener.focus();
    fireEvent.click(opener);
    await canvas();
    fireEvent.click(button('下一张'));
    expect(await canvas()).toHaveAttribute('src', '/two.png');
    expect(changed).toHaveBeenCalledExactlyOnceWith(1);
    act(close);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(closed).toHaveBeenCalledOnce();
    expect(opener).toHaveFocus();
  });
  it('returns focus after unmount and does not repeat external close callbacks', async () => {
    const closed = vi.fn();
    const { rerender } = render(
      <Region>
        <Fragment key="fixture">
          <button type="button">Opener</button>
          {null}
        </Fragment>
      </Region>,
    );
    const opener = screen.getByRole('button', { name: 'Opener' });
    opener.focus();
    rerender(
      <Region>
        <Fragment key="fixture">
          <button type="button">Opener</button>
          <ImagePreviewControl open items={items} returnFocus={opener} onClose={closed} />
        </Fragment>
      </Region>,
    );
    await canvas();
    rerender(
      <Region>
        <Fragment key="fixture">
          <button type="button">Opener</button>
          {null}
        </Fragment>
      </Region>,
    );
    await waitFor(() => expect(opener).toHaveFocus());
    expect(document.body.style.overflow).not.toBe('hidden');
    expect(closed).not.toHaveBeenCalled();
  });
});
