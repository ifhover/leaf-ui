import { act, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConfigProvider, VirtualList, type VirtualListHandle } from '../index';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('VirtualList', () => {
  it('renders custom emptyContent and supports responsive string heights', () => {
    const { container } = render(
      <VirtualList
        items={[]}
        itemKey={(item) => String(item)}
        renderItem={() => null}
        height="100%"
        emptyContent={<span>Nothing queued</span>}
      />,
    );
    expect(screen.getByText('Nothing queued')).toBeInTheDocument();
    expect(container.querySelector('.leaf-virtual-list')).toHaveStyle({ height: '100%' });
  });

  it('positions horizontal items for RTL and routes scrollTo calls with motion fallback', () => {
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(120);
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (
      this: HTMLElement,
    ) {
      return this.classList.contains('leaf-virtual-list') ? 240 : 60;
    });
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(240);
    vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(2400);
    const scrollTo = vi.fn();
    HTMLElement.prototype.scrollTo = scrollTo;

    const handle = createRef<VirtualListHandle>();
    const items = Array.from({ length: 40 }, (_, i) => i);
    const { rerender } = render(
      <ConfigProvider direction="rtl" theme={{ motion: false }}>
        <VirtualList
          ref={handle}
          horizontal
          items={items}
          itemKey={(i) => i}
          renderItem={(i) => <span>Item {i}</span>}
          height={120}
          estimateSize={60}
        />
      </ConfigProvider>,
    );
    const second = screen.getByText('Item 1').closest('li');
    expect(second).toHaveStyle({
      transform: 'translateX(-60px)',
    });
    expect(second?.style.insetInlineStart).toBe('0px');

    act(() => {
      handle.current?.scrollToOffset(120, 'smooth');
    });
    expect(scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ left: -120, behavior: 'auto' }),
    );

    rerender(
      <ConfigProvider direction="rtl" theme={{ motion: true }}>
        <VirtualList
          ref={handle}
          horizontal
          items={items}
          itemKey={(i) => i}
          renderItem={(i) => <span>Item {i}</span>}
          height={120}
          estimateSize={60}
        />
      </ConfigProvider>,
    );
    act(() => {
      handle.current?.scrollToIndex(3, 'start', 'smooth');
    });
    expect(scrollTo).toHaveBeenLastCalledWith(
      expect.objectContaining({ left: -180, behavior: 'smooth' }),
    );
  });
});
