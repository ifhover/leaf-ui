import { type RefObject, useEffect, useRef } from 'react';
import { tabbable } from 'tabbable';
import { composedEventTarget, deepActiveElement } from './dom';

const stack: HTMLElement[] = [];
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
    (resolve(focusOptions.current.initialFocus) ?? focusable()[0] ?? node).focus();
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
        if (destination?.isConnected) destination.focus();
      }
    };
  }, [open, panel, owner, ready, modal]);
}
