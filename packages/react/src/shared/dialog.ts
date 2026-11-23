import {
  type CSSProperties,
  type RefObject,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { tabbable } from 'tabbable';
import { composedEventTarget, deepActiveElement } from './dom';

const stack: HTMLElement[] = [];
const layers: { id: symbol; level: number }[] = [];
const OVERLAY_Z_STEP = 2;
const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

const overlayZIndex = (addend: number) => `calc(var(--leaf-z-index-modal, 1100) + ${addend})`;

function releaseLayer(current: { id: symbol; level: number } | null) {
  if (current) {
    const index = layers.indexOf(current);
    if (index >= 0) layers.splice(index, 1);
  }
  return null;
}

export interface OverlayLayer {
  level: number | null;
  offset: number;
  maskStyle: CSSProperties | undefined;
  popupStyle: CSSProperties | undefined;
  floatingStyle: CSSProperties | undefined;
}

/** 按浮层实际激活生命周期分配递增叠层，退场期间保留原层级直至完全卸载/隐藏。 */
export function useOverlayLayer(present: boolean, open = present): OverlayLayer {
  const [level, setLevel] = useState<number | null>(null);
  const entry = useRef<{ id: symbol; level: number } | null>(null);
  const wasOpen = useRef(false);

  useBrowserLayoutEffect(() => {
    const opened = open && !wasOpen.current;
    wasOpen.current = open;
    if (!present) {
      entry.current = releaseLayer(entry.current);
      setLevel(null);
      return;
    }
    // 首次进入展示态，或在关闭动画尚未结束时重新打开，都分配当前最高叠层。
    if (!entry.current || opened) {
      entry.current = releaseLayer(entry.current);
      const next = layers.length ? Math.max(...layers.map((item) => item.level)) + 1 : 0;
      const item = { id: Symbol(), level: next };
      layers.push(item);
      entry.current = item;
      setLevel(next);
    }
  }, [present, open]);

  useBrowserLayoutEffect(
    () => () => {
      entry.current = releaseLayer(entry.current);
    },
    [],
  );

  return useMemo(() => {
    const offset = level !== null && level > 0 ? level * OVERLAY_Z_STEP : 0;
    if (offset === 0) {
      return {
        level,
        offset: 0,
        maskStyle: undefined,
        popupStyle: undefined,
        floatingStyle: undefined,
      };
    }
    const popupValue = overlayZIndex(offset + 1);
    return {
      level,
      offset,
      maskStyle: { zIndex: overlayZIndex(offset) },
      popupStyle: { '--leaf-z-index-popup': popupValue } as CSSProperties,
      floatingStyle: {
        zIndex: popupValue,
        '--leaf-z-index-popup': popupValue,
      } as CSSProperties,
    };
  }, [level]);
}
export type FocusTarget = RefObject<HTMLElement | null> | (() => HTMLElement | null);
export interface DialogFocusOptions {
  initialFocus?: FocusTarget;
  returnFocus?: boolean | FocusTarget;
}
let savedOverflow = '';
let scrollLocks = 0;

/** Share focus, Escape and scroll ownership between nested dialogs and drawers. */
export function useDialog(
  open: boolean,
  panel: RefObject<HTMLDivElement | null>,
  owner: string,
  onClose: () => void,
  keyboard: boolean,
  options: DialogFocusOptions = {},
  ready = true,
  modal = true,
) {
  const focusOptions = useRef(options);
  focusOptions.current = options;
  const close = useRef(onClose);
  close.current = onClose;
  const keyboardRef = useRef(keyboard);
  keyboardRef.current = keyboard;
  useEffect(() => {
    const node = panel.current;
    if (!open || !node || !ready) return;
    const active = deepActiveElement();
    const previous = active instanceof HTMLElement ? active : null;
    const focusable = () =>
      tabbable(node, { getShadowRoot: (element) => element.shadowRoot ?? undefined });
    if (modal && scrollLocks++ === 0) {
      savedOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    stack.push(node);
    const resolve = (target?: FocusTarget) =>
      typeof target === 'function' ? target() : target?.current;
    (resolve(focusOptions.current.initialFocus) ?? focusable()[0] ?? node).focus({
      preventScroll: true,
    });
    const key = (event: KeyboardEvent) => {
      if (stack.at(-1) !== node || event.defaultPrevented) return;
      if (event.key === 'Escape' && keyboardRef.current) {
        event.preventDefault();
        event.stopPropagation();
        close.current();
      }
      if (event.key === 'Tab') {
        if (!modal) return;
        const items = focusable();
        if (!items.length) {
          event.preventDefault();
          node.focus();
          return;
        }
        const index = items.indexOf(deepActiveElement() as HTMLElement);
        if (event.shiftKey && index <= 0) {
          event.preventDefault();
          items.at(-1)?.focus();
        } else if (!event.shiftKey && (index < 0 || index === items.length - 1)) {
          event.preventDefault();
          items[0]?.focus();
        }
      }
    };
    const focus = (event: FocusEvent) => {
      const target = composedEventTarget(event);
      if (
        stack.at(-1) === node &&
        modal &&
        target instanceof HTMLElement &&
        !event.composedPath().includes(node) &&
        target.closest('[data-leaf-owner]')?.getAttribute('data-leaf-owner') !== owner
      )
        (focusable()[0] ?? node).focus();
    };
    document.addEventListener('keydown', key);
    document.addEventListener('focusin', focus);
    return () => {
      document.removeEventListener('keydown', key);
      document.removeEventListener('focusin', focus);
      const wasTop = stack.at(-1) === node;
      const index = stack.indexOf(node);
      if (index >= 0) stack.splice(index, 1);
      if (modal && --scrollLocks === 0) document.body.style.overflow = savedOverflow;
      if (wasTop && focusOptions.current.returnFocus !== false) {
        const destination =
          typeof focusOptions.current.returnFocus === 'object' ||
          typeof focusOptions.current.returnFocus === 'function'
            ? resolve(focusOptions.current.returnFocus)
            : previous;
        if (destination?.isConnected) destination.focus({ preventScroll: true });
      }
    };
  }, [open, panel, owner, ready, modal]);
}
