import { act, render, renderHook, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConfigProvider, LoadingBar, useLoadingBar } from '../index';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <ConfigProvider locale="ar-EG" direction="rtl" theme={{ appearance: 'dark' }}>
    {children}
  </ConfigProvider>
);

describe('LoadingBar', () => {
  it('preserves explicit progress across overlapping concurrent start calls and resets on fresh batches', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useLoadingBar(), { wrapper });
    let finishFirst = () => {},
      finishSecond = () => {},
      finishThird = () => {};
    act(() => {
      finishFirst = result.current.start();
      result.current.set(65);
    });
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '65');
    expect(bar.parentElement).toHaveAttribute('lang', 'ar-EG');

    act(() => {
      finishSecond = result.current.start();
    });
    expect(bar).toHaveAttribute('aria-valuenow', '65');

    act(() => {
      finishFirst();
      finishSecond();
    });
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(screen.queryByRole('progressbar')).toBeNull();

    act(() => {
      finishThird = result.current.start();
    });
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow');
    act(() => finishThird());
  });

  it('inherits scoped dir, lang, and data-leaf-theme in standalone and portal output', () => {
    render(
      <ConfigProvider locale="zh-CN" direction="rtl" theme={{ appearance: 'dark' }}>
        <LoadingBar active progress={40} position="bottom" />
      </ConfigProvider>,
    );
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveClass('leaf-loading-bar--bottom');
    const portal = bar.closest('.leaf-portal-scope');
    expect(portal).toHaveAttribute('dir', 'rtl');
    expect(portal).toHaveAttribute('lang', 'zh-CN');
    expect(portal).toHaveAttribute('data-leaf-theme', 'dark');
  });
});
