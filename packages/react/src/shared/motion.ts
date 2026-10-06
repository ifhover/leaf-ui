import { type RefObject, useEffect, useLayoutEffect, useRef, useSyncExternalStore } from 'react';
import { useLeafConfig } from '../config-provider/context';

const reducedQuery = '(prefers-reduced-motion: reduce)';
const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

function reducedMotion() {
  return typeof window !== 'undefined' && Boolean(window.matchMedia?.(reducedQuery).matches);
}

function subscribeMotion(listener: () => void) {
  const query = typeof window !== 'undefined' ? window.matchMedia?.(reducedQuery) : undefined;
  query?.addEventListener?.('change', listener);
  return () => query?.removeEventListener?.('change', listener);
}

/** Live preference with a deterministic server snapshot; CSS handles the first frame. */
export function useMotionEnabled() {
  const { theme } = useLeafConfig();
  const reduced = useSyncExternalStore(subscribeMotion, reducedMotion, () => false);
  return theme.motion !== false && !reduced;
}

/** Read the actual region, including variables transferred to a portal. */
export function motionDuration(element: Element, multiplier = 1) {
  if (reducedMotion()) return 0;
  const style = getComputedStyle(element);
  if (style.getPropertyValue('--leaf-motion-play-state').trim() === 'paused') return 0;
  const value = style.getPropertyValue('--leaf-motion-duration').trim();
  const numeric = Number.parseFloat(value);
  const duration = Number.isFinite(numeric)
    ? numeric * (value.endsWith('ms') ? 1 : value.endsWith('s') ? 1000 : 1)
    : 200;
  return Math.max(0, duration * multiplier);
}

export interface MotionOptions {
  durationMultiplier?: number;
  easing?: string;
}

/** Never retain a final keyframe: the component's natural layout stays authoritative. */
export function animateMotion(
  element: HTMLElement | null,
  keyframes: Keyframe[],
  { durationMultiplier = 1, easing }: MotionOptions = {},
) {
  if (!element?.animate) return;
  const duration = motionDuration(element, durationMultiplier);
  if (!duration) return;
  const style = getComputedStyle(element);
  const curve =
    easing === 'spring'
      ? style.getPropertyValue('--leaf-motion-spring').trim()
      : easing || style.getPropertyValue('--leaf-motion-easing').trim();
  return element.animate(keyframes, {
    duration,
    easing: curve || 'cubic-bezier(0.22, 1, 0.36, 1)',
  });
}

interface LayoutPosition {
  left: number;
  top: number;
}

function listGeometry(root: HTMLElement, nodes: HTMLElement[]) {
  const bounds = root.getBoundingClientRect();
  const scaleX = root.offsetWidth ? bounds.width / root.offsetWidth : 1;
  const scaleY = root.offsetHeight ? bounds.height / root.offsetHeight : 1;
  const positions = nodes.map((node) => {
    const rect = node.getBoundingClientRect();
    let left = (rect.left - bounds.left) / (scaleX || 1);
    let top = (rect.top - bounds.top) / (scaleY || 1);
    let parent = node.parentElement;
    while (parent) {
      left += parent.scrollLeft;
      top += parent.scrollTop;
      if (parent === root) break;
      parent = parent.parentElement;
    }
    return { node, rect, key: node.dataset.motionKey ?? node, position: { left, top } };
  });
  return { positions, scaleX: scaleX || 1, scaleY: scaleY || 1 };
}

/** Animate keyed, ordinary rows; virtual window movement must not use this helper. */
export function useListMotion(
  rootRef: RefObject<HTMLElement | null>,
  changeKey: unknown,
  selector = '[data-motion-key]',
  layoutKey?: unknown,
) {
  const enabled = useMotionEnabled();
  const previous = useRef<Map<string | HTMLElement, LayoutPosition> | null>(null);
  const animations = useRef<Animation[]>([]);
  const layout = useRef(layoutKey);
  useBrowserLayoutEffect(() => {
    // The key explicitly opts into a layout update; ordinary renders do not restart it.
    void changeKey;
    const root = rootRef.current;
    if (!root || !selector) {
      for (const animation of animations.current) animation.cancel();
      animations.current = [];
      previous.current = null;
      return;
    }
    const nodes = Array.from(root.querySelectorAll<HTMLElement>(selector));
    if (nodes.length > 200) {
      for (const animation of animations.current) animation.cancel();
      animations.current = [];
      previous.current = null;
      return;
    }
    if (!Object.is(layout.current, layoutKey)) previous.current = null;
    layout.current = layoutKey;
    // React has already changed layout. Recover the remaining visual offset from
    // the running animation, then measure the new, unanimated layout in a batch.
    const live = new Map(
      nodes.map((node) => [
        node,
        {
          rect: node.getBoundingClientRect(),
          opacity: getComputedStyle(node).opacity,
        },
      ]),
    );
    for (const animation of animations.current) animation.cancel();
    animations.current = [];
    const geometry = listGeometry(root, nodes);
    const current = new Map<string | HTMLElement, LayoutPosition>();
    const positions = geometry.positions.map(({ node, key, position, rect }) => {
      current.set(key, position);
      const rendered = live.get(node);
      return {
        node,
        key,
        position,
        offset: {
          left: ((rendered?.rect.left ?? rect.left) - rect.left) / geometry.scaleX,
          top: ((rendered?.rect.top ?? rect.top) - rect.top) / geometry.scaleY,
        },
        opacity: rendered?.opacity ?? '1',
        naturalOpacity: getComputedStyle(node).opacity,
      };
    });
    if (enabled && previous.current) {
      for (const { node, key, position, offset, opacity, naturalOpacity } of positions) {
        const before = previous.current.get(key);
        const x = before ? before.left + offset.left - position.left : 0;
        const y = before ? before.top + offset.top - position.top : 5;
        if (before && Math.abs(x) < 0.5 && Math.abs(y) < 0.5) continue;
        const animation = animateMotion(
          node,
          [
            { translate: `${x}px ${y}px`, opacity: before ? opacity : 0 },
            { translate: '0 0', opacity: naturalOpacity },
          ],
          { durationMultiplier: 1.5 },
        );
        if (animation) animations.current.push(animation);
      }
    }
    previous.current = current;
  }, [changeKey, selector, rootRef, enabled, layoutKey]);
  useBrowserLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !selector || typeof ResizeObserver === 'undefined') return;
    const nodes = Array.from(root.querySelectorAll<HTMLElement>(selector));
    if (nodes.length > 200) return;
    let initial = true;
    const observer = new ResizeObserver(() => {
      // Initial delivery belongs to the keyed update above. Independent resize
      // and font reflow should establish a fresh baseline, without replaying FLIP.
      if (initial) {
        initial = false;
        return;
      }
      for (const animation of animations.current) animation.cancel();
      animations.current = [];
      const geometry = listGeometry(root, nodes);
      previous.current = new Map(geometry.positions.map(({ key, position }) => [key, position]));
    });
    observer.observe(root);
    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, [changeKey, selector, rootRef, enabled, layoutKey]);
  useBrowserLayoutEffect(
    () => () => {
      for (const animation of animations.current) animation.cancel();
    },
    [],
  );
}
