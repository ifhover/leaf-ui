import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { StrictMode, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from '../config-provider';
import { SelectionContent } from './selection-content';

vi.mock('./motion', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./motion')>()),
  useListMotion: () => {},
}));

let containerWidth = 180;
let tagWidth = 60;
let tagReads = 0;
let nextFrame = 0;
const frames = new Map<number, FrameRequestCallback>();
const observers: {
  callback: ResizeObserverCallback;
  targets: Set<Element>;
  disconnect: () => void;
}[] = [];
const fonts = new EventTarget();
const items = ['One', 'Two', 'Three'].map((label) => ({ key: label, label, text: label }));

function flushFrame() {
  act(() => {
    for (const [id, callback] of [...frames]) {
      frames.delete(id);
      callback(0);
    }
  });
}

beforeEach(() => {
  containerWidth = 180;
  tagWidth = 60;
  tagReads = 0;
  frames.clear();
  observers.length = 0;
  Object.defineProperty(document, 'fonts', { configurable: true, value: fonts });
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (
    this: HTMLElement,
  ) {
    return this.classList.contains('leaf-selection') ? containerWidth : 0;
  });
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement,
  ) {
    let width = 0;
    if (this.hasAttribute('data-selection-item')) {
      tagReads++;
      width = this.textContent?.includes('Long') ? 140 : tagWidth;
    } else if (this.hasAttribute('data-selection-counter')) width = 30;
    else if (this.hasAttribute('data-selection-query'))
      width = (this.textContent?.length ?? 0) * 10;
    return new DOMRect(0, 0, width, 20);
  });
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++nextFrame, callback);
    return nextFrame;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
  vi.stubGlobal(
    'ResizeObserver',
    class {
      targets = new Set<Element>();
      disconnect = vi.fn(() => this.targets.clear());
      constructor(public callback: ResizeObserverCallback) {
        observers.push(this);
      }
      observe(target: Element) {
        this.targets.add(target);
      }
      unobserve(target: Element) {
        this.targets.delete(target);
      }
    },
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  Reflect.deleteProperty(document, 'fonts');
});

describe('SelectionContent width caching', () => {
  it('reuses natural tag widths across query and unrelated renders while updating the fold', () => {
    const { container, rerender } = render(
      <SelectionContent items={items} maxTagCount="responsive" searchable>
        <input />
      </SelectionContent>,
    );
    const visible = () => container.querySelectorAll('[data-selection-item]:not([hidden])').length;
    expect(visible()).toBe(2);
    expect(tagReads).toBe(3);
    rerender(
      <SelectionContent
        items={items.map((item) => ({ ...item }))}
        maxTagCount="responsive"
        searchable
        query="long"
      >
        <input />
      </SelectionContent>,
    );
    expect(visible()).toBe(1);
    expect(tagReads).toBe(3);
    rerender(
      <SelectionContent items={items} maxTagCount="responsive" searchable>
        <input />
      </SelectionContent>,
    );
    expect(visible()).toBe(2);
    expect(tagReads).toBe(3);
  });

  it('invalidates changed content, including a hidden tag, without remeasuring other tags', () => {
    const { container, rerender } = render(
      <SelectionContent items={items} maxTagCount="responsive" />,
    );
    expect(tagReads).toBe(3);
    const changed = items.map((item, index) =>
      index === 2 ? { ...item, label: 'Long third label' } : item,
    );
    rerender(<SelectionContent items={changed} maxTagCount="responsive" />);
    expect(tagReads).toBe(4);
    expect(container.querySelector('[data-selection-item][hidden]')).toHaveTextContent(
      'Long third label',
    );
  });

  it('tracks custom content updates without mounting a second renderer', async () => {
    const mounted = vi.fn();
    function CustomTag() {
      const [long, setLong] = useState(false);
      mounted();
      return (
        <button type="button" onClick={() => setLong(true)}>
          {long ? 'Long custom label' : 'Short'}
        </button>
      );
    }
    const custom = [
      { key: 'custom', label: 'Custom', text: 'Custom', render: <CustomTag /> },
      ...items,
    ];
    const { container } = render(<SelectionContent items={custom} maxTagCount="responsive" />);
    expect(mounted).toHaveBeenCalledOnce();
    const reads = tagReads;
    await act(async () => fireEvent.click(container.querySelector('button') as HTMLButtonElement));
    flushFrame();
    expect(mounted).toHaveBeenCalledTimes(2);
    expect(tagReads).toBe(reads + 1);
  });

  it('only remeasures the resized visible tag and retains widths when tags are hidden', () => {
    const { container } = render(<SelectionContent items={items} maxTagCount="responsive" />);
    const root = container.querySelector('.leaf-selection') as HTMLElement;
    const observer = observers.find((entry) => entry.targets.has(root));
    const tags = [...container.querySelectorAll<HTMLElement>('[data-selection-item]')];
    const entry = (target: Element): ResizeObserverEntry => ({
      target,
      contentRect: new DOMRect(),
      borderBoxSize: [],
      contentBoxSize: [],
      devicePixelContentBoxSize: [],
    });
    act(() => observer?.callback(tags.map(entry), {} as ResizeObserver));
    flushFrame();
    const reads = tagReads;
    tagWidth = 80;
    act(() => observer?.callback(tags.slice(0, 1).map(entry), {} as ResizeObserver));
    flushFrame();
    expect(tagReads).toBe(reads + 1);
    act(() => observer?.callback(tags.slice(2).map(entry), {} as ResizeObserver));
    flushFrame();
    expect(tagReads).toBe(reads + 1);
  });

  it('coalesces size/font invalidations, observes replacements and cancels work on unmount', () => {
    const { container, rerender, unmount } = render(
      <StrictMode>
        <SelectionContent items={items} maxTagCount="responsive" />
      </StrictMode>,
    );
    const root = container.querySelector('.leaf-selection') as HTMLElement;
    const observer = [...observers].reverse().find((entry) => entry.targets.has(root));
    expect(observer).toBeDefined();
    const entries: ResizeObserverEntry[] = [
      {
        target: root,
        contentRect: new DOMRect(),
        borderBoxSize: [],
        contentBoxSize: [],
        devicePixelContentBoxSize: [],
      },
    ];
    act(() => observer?.callback(entries, {} as ResizeObserver));
    flushFrame();
    const reads = tagReads;
    containerWidth = 100;
    act(() => {
      observer?.callback(entries, {} as ResizeObserver);
      window.dispatchEvent(new Event('resize'));
      fonts.dispatchEvent(new Event('loadingdone'));
    });
    expect(frames.size).toBe(1);
    flushFrame();
    expect(tagReads).toBe(reads + 3);
    expect(container.querySelectorAll('[data-selection-item]:not([hidden])')).toHaveLength(1);
    rerender(
      <StrictMode>
        <SelectionContent
          items={[...items.slice(0, 2), { key: 'new', label: 'New', text: 'New' }]}
          maxTagCount="responsive"
        />
      </StrictMode>,
    );
    const replacement = container.querySelector('[data-motion-key="new"]') as HTMLElement;
    expect(observer?.targets.has(replacement)).toBe(true);
    fireEvent(window, new Event('resize'));
    unmount();
    expect(frames.size).toBe(0);
    expect(observer?.disconnect).toHaveBeenCalled();
  });

  it('invalidates widths after regional density changes', () => {
    const { rerender } = render(
      <ConfigProvider>
        <SelectionContent items={items} maxTagCount="responsive" />
      </ConfigProvider>,
    );
    const reads = tagReads;
    tagWidth = 80;
    rerender(
      <ConfigProvider density="compact">
        <SelectionContent items={items} maxTagCount="responsive" />
      </ConfigProvider>,
    );
    expect(tagReads).toBe(reads + 3);
  });
});
