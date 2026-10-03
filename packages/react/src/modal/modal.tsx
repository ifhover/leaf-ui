import { X } from 'lucide-react';
import { type HTMLAttributes, type ReactNode, useEffect, useId, useRef, useState } from 'react';
import { tabbable } from 'tabbable';
import { Button, type ButtonProps } from '../button';
import { useLeafConfig } from '../config-provider/config-provider';
import { classes } from '../shared/classes';
import { inertAttribute } from '../shared/inert';
import { OverlayOwner } from '../shared/overlay-owner';
import { usePresence } from '../shared/presence';
import { ScopedPortal } from '../shared/scoped-portal';

export interface ModalFooterActions {
  confirmButton: ReactNode;
  cancelButton: ReactNode;
}
export interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  open: boolean;
  title?: ReactNode;
  footer?: ReactNode | ((actions: ModalFooterActions) => ReactNode);
  confirmText?: ReactNode;
  cancelText?: ReactNode;
  confirmLoading?: boolean;
  confirmButtonProps?: ButtonProps;
  cancelButtonProps?: ButtonProps;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
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
  confirmText,
  cancelText,
  confirmLoading = false,
  confirmButtonProps,
  cancelButtonProps,
  onConfirm,
  onCancel,
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
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const mounted = useRef(true);
  const accepting = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    if (open) setError(undefined);
  }, [open]);
  const busy = pending || confirmLoading;
  async function accept() {
    if (accepting.current || busy) return;
    if (!onConfirm) {
      if (confirmButtonProps?.type !== 'submit') onClose?.();
      return;
    }
    accepting.current = true;
    setPending(true);
    setError(undefined);
    try {
      await onConfirm();
    } catch (reason) {
      if (mounted.current) setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      accepting.current = false;
      if (mounted.current) setPending(false);
    }
  }
  const cancel = () => {
    if (!busy) (onCancel ?? onClose)?.();
  };
  const actions: ModalFooterActions = {
    cancelButton: (
      <Button
        variant="outline"
        {...cancelButtonProps}
        disabled={busy || cancelButtonProps?.disabled}
        onClick={(event) => {
          cancelButtonProps?.onClick?.(event);
          if (!event.defaultPrevented) cancel();
        }}
      >
        {cancelText ?? messages.cancel}
      </Button>
    ),
    confirmButton: (
      <Button
        {...confirmButtonProps}
        loading={busy || confirmButtonProps?.loading}
        onClick={(event) => {
          confirmButtonProps?.onClick?.(event);
          if (!event.defaultPrevented) void accept();
        }}
      >
        {confirmText ?? messages.confirm}
      </Button>
    ),
  };
  const renderedFooter =
    typeof footer === 'function' ? (
      footer(actions)
    ) : footer === undefined ? (
      <>
        {actions.cancelButton}
        {actions.confirmButton}
      </>
    ) : (
      footer
    );
  const panel = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const present = usePresence(open, root);
  const titleId = `${useId()}-title`;
  const modalId = `${useId()}-dialog`;
  const close = useRef(cancel);
  close.current = cancel;
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
              {title && <h2 id={titleId}>{title}</h2>}
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
          <div className="leaf-modal__body">
            {children}
            {error && (
              <p role="alert" className="leaf-confirm-error">
                {error}
              </p>
            )}
          </div>
          {renderedFooter != null && <div className="leaf-modal__footer">{renderedFooter}</div>}
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
