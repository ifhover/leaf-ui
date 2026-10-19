import { act, render } from '@testing-library/react';
import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from '../config-provider';
import { Statistic } from './statistic';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function frames() {
  let now = 0;
  let id = 0;
  const pending = new Map<number, FrameRequestCallback>();
  vi.spyOn(performance, 'now').mockImplementation(() => now);
  const request = vi.fn((callback: FrameRequestCallback) => {
    pending.set(++id, callback);
    return id;
  });
  vi.stubGlobal('requestAnimationFrame', request);
  vi.stubGlobal('cancelAnimationFrame', (frame: number) => pending.delete(frame));
  return {
    pending,
    request,
    advance(milliseconds: number) {
      now += milliseconds;
      const callbacks = [...pending.values()];
      pending.clear();
      act(() => {
        for (const callback of callbacks) callback(now);
      });
    },
  };
}

describe('Statistic counting animation', () => {
  it('counts from zero, keeps the accessible target stable and finishes exactly', () => {
    const clock = frames();
    const { container, rerender } = render(<Statistic value={100} aria-live="polite" />);
    const number = container.querySelector('.leaf-statistic__number');
    expect(number).toHaveTextContent(/^0$/);
    expect(number).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.leaf-statistic__accessible')).toHaveTextContent('100');
    clock.advance(500);
    expect(number).toHaveTextContent(/^88$/);
    rerender(<Statistic value={100} aria-live="polite" />);
    clock.advance(500);
    expect(number).toHaveTextContent(/^100$/);
    expect(number).not.toHaveAttribute('aria-hidden');
    expect(clock.pending.size).toBe(0);
    const requests = clock.request.mock.calls.length;
    rerender(<Statistic value={100} title="Updated title" />);
    expect(clock.request).toHaveBeenCalledTimes(requests);
  });

  it('retargets upward and downward from the currently displayed value', () => {
    const clock = frames();
    const { container, rerender } = render(<Statistic value={100} precision={2} />);
    const number = container.querySelector('.leaf-statistic__number');
    clock.advance(500);
    expect(number).toHaveTextContent('87.50');
    rerender(<Statistic value={-100} precision={2} />);
    expect(number).toHaveTextContent('87.50');
    expect(clock.pending.size).toBe(1);
    clock.advance(500);
    expect(number).toHaveTextContent('-76.56');
    rerender(<Statistic value={200} precision={2} />);
    expect(number).toHaveTextContent('-76.56');
    clock.advance(1000);
    expect(number).toHaveTextContent('200.00');
  });

  it('waits for loading and formats every frame using the locale and precision', () => {
    const clock = frames();
    const { container, rerender } = render(
      <ConfigProvider locale="de-DE">
        <Statistic value={1200.5} initialValue={1000} precision={2} loading />
      </ConfigProvider>,
    );
    expect(clock.pending.size).toBe(0);
    rerender(
      <ConfigProvider locale="de-DE">
        <Statistic value={1200.5} initialValue={1000} precision={2} />
      </ConfigProvider>,
    );
    const number = container.querySelector('.leaf-statistic__number');
    expect(number).toHaveTextContent('1.000,00');
    clock.advance(500);
    expect(number).toHaveTextContent('1.175,44');
    clock.advance(500);
    expect(number).toHaveTextContent('1.200,50');
  });

  it('supports custom formatting without restarting when its function changes', () => {
    const clock = frames();
    const { container, rerender } = render(
      <Statistic value={100} formatter={(value) => <b>{Number(value).toFixed(1)} units</b>} />,
    );
    clock.advance(500);
    expect(container.querySelector('.leaf-statistic__number')).toHaveTextContent('87.5 units');
    rerender(<Statistic value={100} formatter={(value) => <b>{value} items</b>} />);
    clock.advance(500);
    expect(container.querySelector('.leaf-statistic__number')).toHaveTextContent('100 items');
    expect(clock.pending.size).toBe(0);
  });

  it('cancels on disabling, nonnumeric input and unmount, and respects nested motion', () => {
    const clock = frames();
    const { container, rerender, unmount } = render(<Statistic value={100} />);
    rerender(<Statistic value={200} animation={false} />);
    expect(container.querySelector('.leaf-statistic__number')).toHaveTextContent('200');
    expect(clock.pending.size).toBe(0);
    rerender(<Statistic value="Unavailable" />);
    expect(container).toHaveTextContent('Unavailable');
    expect(clock.pending.size).toBe(0);
    rerender(
      <ConfigProvider theme={{ motion: false }}>
        <Statistic value={100} />
        <ConfigProvider theme={{ motion: true }}>
          <Statistic value={200} />
        </ConfigProvider>
      </ConfigProvider>,
    );
    const numbers = container.querySelectorAll('.leaf-statistic__number');
    expect(numbers[0]).toHaveTextContent('100');
    expect(numbers[1]).toHaveTextContent(/^0$/);
    expect(clock.pending.size).toBe(1);
    unmount();
    expect(clock.pending.size).toBe(0);
  });

  it('uses regional duration and immediately finishes when reduced motion changes', () => {
    const clock = frames();
    let reduced = false;
    const listeners = new Set<() => void>();
    vi.stubGlobal('matchMedia', () => ({
      get matches() {
        return reduced;
      },
      addEventListener: (_: string, listener: () => void) => listeners.add(listener),
      removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
    }));
    const { container } = render(
      <Statistic
        value={100}
        duration={500}
        style={{ '--leaf-motion-duration': '400ms' } as React.CSSProperties}
      />,
    );
    clock.advance(500);
    expect(container.querySelector('.leaf-statistic__number')).toHaveTextContent('88');
    act(() => {
      reduced = true;
      for (const listener of listeners) listener();
    });
    expect(container.querySelector('.leaf-statistic__number')).toHaveTextContent('100');
    expect(clock.pending.size).toBe(0);
  });

  it('renders strings, nonfinite values and zero duration without counting', () => {
    const clock = frames();
    const { container } = render(
      <>
        <Statistic value="123" />
        <Statistic value={Number.POSITIVE_INFINITY} />
        <Statistic value={50} duration={0} />
      </>,
    );
    expect(container.textContent).toBe('123∞50');
    expect(clock.pending.size).toBe(0);
  });

  it('hydrates the target without mismatches and cleans up StrictMode frames', async () => {
    const clock = frames();
    const element = (
      <StrictMode>
        <Statistic value={100} initialValue={20} />
      </StrictMode>
    );
    const host = document.createElement('div');
    host.innerHTML = renderToString(element);
    expect(host.textContent).toBe('100');
    const onRecoverableError = vi.fn();
    let root: ReturnType<typeof hydrateRoot>;
    await act(async () => {
      root = hydrateRoot(host, element, { onRecoverableError });
    });
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(host.querySelector('.leaf-statistic__number')).toHaveTextContent('20');
    expect(clock.pending.size).toBe(1);
    clock.advance(1000);
    expect(host.querySelector('.leaf-statistic__number')).toHaveTextContent('100');
    act(() => root.unmount());
    expect(clock.pending.size).toBe(0);
  });
});
