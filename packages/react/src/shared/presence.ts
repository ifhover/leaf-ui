import { type RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { animateMotion, useMotionEnabled } from './motion';

const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** Interpolate natural dialog height, including state changes inside its children. */
export function useNaturalHeightTransition(
  surfaceRef: RefObject<HTMLElement | null>,
  contentRef: RefObject<HTMLElement | null>,
  open: boolean,
) {
  const enabled = useMotionEnabled();
  const sync = useRef<(() => void) | undefined>(undefined);
  useBrowserLayoutEffect(() => {
    const surface = surfaceRef.current;
    const content = contentRef.current;
    if (!open || !enabled || !surface || !content) return;
    let animation: Animation | undefined;
    let reveal: Animation | undefined;
    let lastHeight = surface.offsetHeight;
    let lastLayout = '';
    const parts = () =>
      Array.from(surface.children).filter(
        (child): child is HTMLElement => child instanceof HTMLElement && !child.contains(content),
      );
    const layout = () =>
      [surface.offsetWidth, content.offsetHeight, ...parts().map((part) => part.offsetHeight)].join(
        ':',
      );
    lastLayout = layout();
    const update = () => {
      const nextLayout = layout();
      if (nextLayout === lastLayout || surface.closest('[data-state="closing"]')) return;
      lastLayout = nextLayout;
      // CSS height is unaffected by the separate entrance scale on the surface.
      const before =
        animation?.playState === 'running'
          ? Number.parseFloat(getComputedStyle(surface).height) || lastHeight
          : lastHeight;
      const opacity = reveal?.playState === 'running' ? getComputedStyle(content).opacity : '0.72';
      animation?.cancel();
      reveal?.cancel();
      const height = surface.offsetHeight;
      lastHeight = height;
      if (!before || !height || Math.abs(before - height) < 1) return;
      animation = animateMotion(surface, [{ height: `${before}px` }, { height: `${height}px` }], {
        durationMultiplier: 1.6,
      });
      if (animation)
        reveal = animateMotion(content, [{ opacity }, { opacity: 1 }], {
          durationMultiplier: 1.25,
        });
    };
    sync.current = update;
    let observer: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(update);
      observer.observe(content);
      for (const part of parts()) observer.observe(part);
    }
    // Viewport constraints change the visible height without changing content.
    // Resizing establishes a fresh baseline instead of animating stale geometry.
    const resize = () => {
      animation?.cancel();
      reveal?.cancel();
      animation = undefined;
      reveal = undefined;
      lastHeight = surface.offsetHeight;
      lastLayout = layout();
    };
    window.addEventListener('resize', resize);
    window.visualViewport?.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      window.visualViewport?.removeEventListener('resize', resize);
      observer?.disconnect();
      animation?.cancel();
      reveal?.cancel();
      sync.current = undefined;
    };
  }, [open, enabled, surfaceRef, contentRef]);
  // React updates to the header/footer are measurable before the next paint.
  useBrowserLayoutEffect(() => {
    sync.current?.();
  });
}

/** Animate a panel's explicit view change without remounting its focused controls. */
export function useContentTransition(
  ref: RefObject<HTMLElement | null>,
  view: string | number,
  direction = 0,
  layoutOnly = false,
) {
  const enabled = useMotionEnabled();
  const travel = useRef(direction);
  travel.current = direction;
  const previous = useRef<{ view: string | number; height: number } | undefined>(undefined);
  useBrowserLayoutEffect(() => {
    const node = ref.current;
    if (!node) {
      previous.current = undefined;
      return;
    }
    const height = Number.parseFloat(getComputedStyle(node).height) || node.offsetHeight;
    const last = previous.current;
    previous.current = { view, height };
    if (!enabled || !last || last.view === view || node.closest('[data-state="closing"]')) return;
    const changesHeight = last.height > 0 && height > 0 && Math.abs(last.height - height) > 1;
    if (layoutOnly && !changesHeight) return;
    const animation = animateMotion(
      node,
      [
        {
          ...(layoutOnly ? {} : { opacity: 0.45, translate: `${travel.current * 12}px 4px` }),
          ...(changesHeight ? { height: `${last.height}px`, overflow: 'clip' } : {}),
        },
        {
          ...(layoutOnly ? {} : { opacity: 1, translate: '0 0' }),
          ...(changesHeight ? { height: `${height}px`, overflow: 'clip' } : {}),
        },
      ],
      { durationMultiplier: 1.25 },
    );
    return () => {
      if (animation && changesHeight && previous.current)
        previous.current.height =
          Number.parseFloat(getComputedStyle(node).height) || node.offsetHeight;
      animation?.cancel();
    };
  }, [enabled, ref, view, layoutOnly]);
}

/** Keep a closing overlay mounted until its CSS transition or animation finishes. */
export function usePresence(open: boolean, ref: RefObject<HTMLElement | null>) {
  const enabled = useMotionEnabled();
  const [present, setPresent] = useState(open);
  if (open && !present) setPresent(true);
  useEffect(() => {
    if (open || !present) return;
    const node = ref.current;
    if (!node || !enabled) {
      setPresent(false);
      return;
    }
    const computed = getComputedStyle(node);
    const durations = [computed.animationDuration, computed.transitionDuration];
    const delays = [computed.animationDelay, computed.transitionDelay];
    const milliseconds = (value: string) => {
      const numeric = Number.parseFloat(value) || 0;
      return value.trim().endsWith('ms') ? numeric : numeric * 1000;
    };
    const duration = Math.max(
      0,
      ...durations.flatMap((list, index) => {
        const delay = (delays[index] || '0s').split(',').map(milliseconds);
        return (list || '0s')
          .split(',')
          .map((value, i) => milliseconds(value) + (delay[i % delay.length] ?? 0));
      }),
    );
    const finish = () => setPresent(false);
    const ended = (event: Event) => {
      if (event.target === node && (!('propertyName' in event) || event.propertyName === 'opacity'))
        finish();
    };
    const timer = setTimeout(finish, duration ? duration + 32 : 0);
    node.addEventListener('animationend', ended);
    node.addEventListener('transitionend', ended);
    return () => {
      clearTimeout(timer);
      node.removeEventListener('animationend', ended);
      node.removeEventListener('transitionend', ended);
    };
  }, [open, present, ref, enabled]);
  return present;
}
