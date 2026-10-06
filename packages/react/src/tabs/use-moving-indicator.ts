import { type RefObject, useEffect, useLayoutEffect, useRef } from 'react';

const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** A single selection surface follows the actual item geometry, including RTL scroll offsets. */
export function useMovingIndicator(
  container: RefObject<HTMLElement | null>,
  indicator: RefObject<HTMLElement | null>,
  selector: string,
  selection: unknown,
  enabled = true,
) {
  const previous = useRef<HTMLElement | null>(null);
  const refresh = useRef<(animate: boolean) => void>(() => {});
  useBrowserLayoutEffect(() => {
    const host = container.current;
    const marker = indicator.current;
    if (!enabled || !host || !marker) return;
    let frame = 0;
    const measure = (animate: boolean) => {
      const active = host.querySelector<HTMLElement>(selector);
      if (!active || active.closest('[inert],[hidden]')) {
        marker.dataset.visible = 'false';
        previous.current = null;
        return;
      }
      const bounds = host.getBoundingClientRect();
      const item = active.getBoundingClientRect();
      const scaleX = host.offsetWidth ? bounds.width / host.offsetWidth : 1;
      const scaleY = host.offsetHeight ? bounds.height / host.offsetHeight : 1;
      const geometry = {
        '--leaf-indicator-x': `${(item.left - bounds.left) / (scaleX || 1) + host.scrollLeft - host.clientLeft}px`,
        '--leaf-indicator-y': `${(item.top - bounds.top) / (scaleY || 1) + host.scrollTop - host.clientTop}px`,
        '--leaf-indicator-width': `${item.width / (scaleX || 1)}px`,
        '--leaf-indicator-height': `${item.height / (scaleY || 1)}px`,
      };
      if (
        marker.dataset.visible === 'true' &&
        Object.entries(geometry).every(
          ([key, value]) => marker.style.getPropertyValue(key) === value,
        )
      )
        return;
      marker.dataset.animate = String(animate && previous.current !== null);
      for (const [key, value] of Object.entries(geometry)) marker.style.setProperty(key, value);
      marker.dataset.visible = String(item.width > 0 && item.height > 0);
      previous.current = active;
    };
    refresh.current = measure;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        for (const node of host.querySelectorAll<HTMLElement>('[data-leaf-indicator-item]'))
          observer?.observe(node);
        measure(false);
      });
    };
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule);
    observer?.observe(host);
    for (const node of host.querySelectorAll<HTMLElement>('[data-leaf-indicator-item]'))
      observer?.observe(node);
    const mutation =
      typeof MutationObserver === 'undefined'
        ? null
        : new MutationObserver((records) => {
            if (records.some((record) => record.target !== marker)) schedule();
          });
    mutation?.observe(host, { childList: true, subtree: true, characterData: true });
    host.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    measure(false);
    // Font loading can change intrinsic widths without a viewport resize.
    document.fonts?.addEventListener('loadingdone', schedule);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      mutation?.disconnect();
      host.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      document.fonts?.removeEventListener('loadingdone', schedule);
      refresh.current = () => {};
    };
  }, [container, indicator, selector, enabled]);
  useBrowserLayoutEffect(() => refresh.current(true), [selection]);
}
