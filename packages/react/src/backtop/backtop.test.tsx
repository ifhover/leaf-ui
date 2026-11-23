import { act, fireEvent, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConfigProvider } from '../config-provider';
import { BackTop } from './backtop';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('BackTop', () => {
  it('stays hidden and inert below visibilityHeight, then reveals after RAF scroll throttling and honors motion', async () => {
    const container = document.createElement('div');
    let scrollTop = 0;
    Object.defineProperty(container, 'scrollTop', {
      configurable: true,
      get: () => scrollTop,
    });
    const scrollTo = vi.fn();
    container.scrollTo = scrollTo;
    document.body.appendChild(container);

    render(
      <ConfigProvider locale="en-US" theme={{ motion: false }}>
        <BackTop target={() => container} visibilityHeight={200} />
      </ConfigProvider>,
    );

    const button = document.querySelector('button.leaf-back-top') as HTMLButtonElement;
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-hidden', 'true');
    expect(button).toHaveAttribute('inert');
    expect(button).toHaveAttribute('tabindex', '-1');
    expect(button).not.toHaveAttribute('data-visible');

    scrollTop = 260;
    fireEvent.scroll(container);
    await waitFor(() => {
      expect(button).toHaveAttribute('data-visible');
      expect(button).not.toHaveAttribute('aria-hidden');
      expect(button).not.toHaveAttribute('inert');
    });
    expect(button).toHaveAccessibleName('Back to top');

    await userEvent.click(button);
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    container.remove();
  });

  it('retries binding target on the next animation frame when target mounts late and supports labeled triggers', async () => {
    let targetEl: HTMLDivElement | null = null;
    const delayedTarget = () => targetEl;
    const scrollTo = vi.fn();
    const click = vi.fn((event: React.MouseEvent<HTMLButtonElement>) => event.preventDefault());

    const { rerender } = render(
      <BackTop target={delayedTarget} visibilityHeight={100}>
        Top
      </BackTop>,
    );
    const button = document.querySelector('button.leaf-back-top') as HTMLButtonElement;
    expect(button).toHaveClass('leaf-back-top--labeled');

    const el = document.createElement('div');
    let scrollTop = 150;
    Object.defineProperty(el, 'scrollTop', {
      configurable: true,
      get: () => scrollTop,
    });
    el.scrollTo = scrollTo;
    document.body.appendChild(el);
    targetEl = el;

    await waitFor(() => expect(button).toHaveAttribute('data-visible'));

    scrollTop = 20;
    fireEvent.scroll(el);
    await waitFor(() => expect(button).not.toHaveAttribute('data-visible'));

    scrollTop = 180;
    fireEvent.scroll(el);
    await waitFor(() => expect(button).toHaveAttribute('data-visible'));

    rerender(
      <BackTop target={delayedTarget} visibilityHeight={100} onClick={click}>
        Top
      </BackTop>,
    );
    await act(async () => {
      fireEvent.click(button);
    });
    expect(click).toHaveBeenCalledOnce();
    expect(scrollTo).not.toHaveBeenCalled();
    el.remove();
  });
});
