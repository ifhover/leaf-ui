import { type RefObject, useEffect, useRef } from 'react';
import { tabbable } from 'tabbable';

const stack: HTMLElement[] = [];
let savedOverflow = '';

/** Share focus, Escape and scroll ownership between nested dialogs and drawers. */
export function useDialog(
  open: boolean,
  panel: RefObject<HTMLDivElement | null>,
  owner: string,
  onClose: () => void,
  keyboard: boolean,
) {
  const close = useRef(onClose);
  close.current = onClose;
  const keyboardRef = useRef(keyboard);
  keyboardRef.current = keyboard;
  useEffect(() => {
    const node = panel.current;
    if (!open || !node) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!stack.length) {
      savedOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    stack.push(node);
    (tabbable(node)[0] ?? node).focus();
    const key = (event: KeyboardEvent) => {
      if (stack.at(-1) !== node || event.defaultPrevented) return;
      if (event.key === 'Escape' && keyboardRef.current) {
        event.preventDefault();
        event.stopPropagation();
        close.current();
      }
      if (event.key === 'Tab') {
        const items = tabbable(node);
        if (!items.length) {
          event.preventDefault();
          node.focus();
          return;
        }
        const index = items.indexOf(document.activeElement as HTMLElement);
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
      if (
        stack.at(-1) === node &&
        event.target instanceof HTMLElement &&
        !node.contains(event.target) &&
        event.target.closest('[data-leaf-owner]')?.getAttribute('data-leaf-owner') !== owner
      )
        (tabbable(node)[0] ?? node).focus();
    };
    document.addEventListener('keydown', key);
    document.addEventListener('focusin', focus);
    return () => {
      document.removeEventListener('keydown', key);
      document.removeEventListener('focusin', focus);
      const wasTop = stack.at(-1) === node;
      const index = stack.indexOf(node);
      if (index >= 0) stack.splice(index, 1);
      if (!stack.length) document.body.style.overflow = savedOverflow;
      if (wasTop && previous?.isConnected) previous.focus();
    };
  }, [open, panel, owner]);
}
