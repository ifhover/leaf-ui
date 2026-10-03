import { X } from 'lucide-react';
import { type HTMLAttributes, type ReactNode, useEffect, useId, useRef } from 'react';
import { tabbable } from 'tabbable';
import { useLeafConfig } from '../config-provider/config-provider';
import { classes } from '../shared/classes';
import { inertAttribute } from '../shared/inert';
import { OverlayOwner } from '../shared/overlay-owner';
import { usePresence } from '../shared/presence';
import { ScopedPortal } from '../shared/scoped-portal';

export interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  open: boolean;
  title?: ReactNode;
  footer?: ReactNode;
  width?: number | string;
  closable?: boolean;
  maskClosable?: boolean;
  keyboard?: boolean;
  onClose?: () => void;
  afterClose?: () => void;
}
const stack: HTMLElement[] = [];
let savedOverflow = '';

function ModalSurface({
  open,
  title,
  footer,
  width = 480,
  closable = true,
  maskClosable = true,
  keyboard = true,
  onClose,
  afterClose,
  children,
  className,
  style,
  ...props
}: ModalProps) {
  const { messages } = useLeafConfig();
  const panel = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const present = usePresence(open, root);
  const titleId = `${useId()}-title`;
  const modalId = `${useId()}-dialog`;
  const close = useRef(onClose);
  close.current = onClose;
  const keyboardRef = useRef(keyboard);
  keyboardRef.current = keyboard;
  const wasPresent = useRef(false);
  useEffect(() => {
    if (wasPresent.current && !present) afterClose?.();
    wasPresent.current = present;
  }, [present, afterClose]);
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
        close.current?.();
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
        event.target.closest('[data-leaf-owner]')?.getAttribute('data-leaf-owner') !== modalId
      )
        (tabbable(node)[0] ?? node).focus();
    };
    document.addEventListener('keydown', key);
    document.addEventListener('focusin', focus);
    return () => {
      document.removeEventListener('keydown', key);
      document.removeEventListener('focusin', focus);
      const index = stack.indexOf(node);
      if (index >= 0) stack.splice(index, 1);
      if (!stack.length) document.body.style.overflow = savedOverflow;
      if (previous?.isConnected) previous.focus();
    };
  }, [open, modalId]);
  if (!present) return null;
  return (
    <div
      ref={root}
      className="leaf-modal-mask"
      data-state={open ? 'open' : 'closing'}
      aria-hidden={!open || undefined}
      inert={inertAttribute(!open)}
    >
      <button
        type="button"
        className="leaf-modal-backdrop"
        tabIndex={-1}
        aria-label={messages.close}
        onClick={() => {
          if (maskClosable) close.current?.();
        }}
      />
      {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: dialog and alertdialog both support aria-modal. */}
      <div
        {...props}
        ref={panel}
        id={props.id ?? modalId}
        role={props.role ?? 'dialog'}
        aria-modal="true"
        aria-labelledby={title ? titleId : props['aria-labelledby']}
        tabIndex={-1}
        className={classes('leaf-modal', className)}
        style={{ width, ...style }}
      >
        <OverlayOwner.Provider value={modalId}>
          {(title || closable) && (
            <div className="leaf-modal__header">
              <h2 id={titleId}>{title}</h2>
              {closable && (
                <button
                  type="button"
                  className="leaf-modal__close"
                  aria-label={messages.close}
                  onClick={() => close.current?.()}
                >
                  <X size={18} aria-hidden="true" />
                </button>
              )}
            </div>
          )}
          <div className="leaf-modal__body">{children}</div>
          {footer != null && <div className="leaf-modal__footer">{footer}</div>}
        </OverlayOwner.Provider>
      </div>
    </div>
  );
}
export function Modal(props: ModalProps) {
  return (
    <ScopedPortal>
      <ModalSurface {...props} />
    </ScopedPortal>
  );
}
