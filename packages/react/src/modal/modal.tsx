import { X } from 'lucide-react';
import { type HTMLAttributes, type ReactNode, useEffect, useId, useRef, useState } from 'react';
import { Button, type ButtonProps } from '../button';
import { useLeafConfig } from '../config-provider/context';
import { Scrollbar } from '../scrollbar';
import { classes } from '../shared/classes';
import { type DialogFocusOptions, useDialog } from '../shared/dialog';
import { inertProps } from '../shared/inert';
import { OverlayOwner } from '../shared/overlay-owner';
import { useNaturalHeightTransition, usePresence } from '../shared/presence';
import { ScopedPortal } from '../shared/scoped-portal';

export interface ModalFooterActions {
  confirmButton: ReactNode;
  cancelButton: ReactNode;
}
export interface ModalProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'>,
    DialogFocusOptions {
  open: boolean;
  title?: ReactNode;
  /** Supporting text displayed below the title. */
  description?: ReactNode;
  /** Decorative header icon. */
  icon?: ReactNode;
  /** Separate the header and footer with subtle borders. */
  divided?: boolean;
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
  forceRender?: boolean;
  destroyOnClose?: boolean;
  preserve?: boolean;
  container?: Element | DocumentFragment | (() => Element | DocumentFragment);
}

function ModalSurface({
  open,
  title,
  description,
  icon,
  divided = true,
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
  forceRender = false,
  destroyOnClose = false,
  preserve,
  initialFocus,
  returnFocus,
  container: _container,
  children,
  className,
  style,
  ...props
}: ModalProps) {
  const { messages, maskBlur } = useLeafConfig();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const mounted = useRef(true);
  const accepting = useRef(false);
  const generation = useRef(0);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    generation.current++;
    accepting.current = false;
    setPending(false);
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
    const request = generation.current;
    setPending(true);
    setError(undefined);
    try {
      await onConfirm();
    } catch (reason) {
      if (mounted.current && generation.current === request)
        setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      if (generation.current === request) {
        accepting.current = false;
        if (mounted.current) setPending(false);
      }
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
  const content = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLButtonElement>(null);
  const present = usePresence(open, backdrop);
  useNaturalHeightTransition(panel, content, open);
  const titleId = `${useId()}-title`;
  const descriptionId = `${useId()}-description`;
  const modalId = `${useId()}-dialog`;
  const close = useRef(cancel);
  close.current = cancel;
  const wasPresent = useRef(false);
  useEffect(() => {
    if (wasPresent.current && !present) afterClose?.();
    wasPresent.current = present;
  }, [present, afterClose]);
  useDialog(open, panel, modalId, cancel, keyboard, { initialFocus, returnFocus });
  const visited = useRef(false);
  if (open) visited.current = true;
  if (
    !present &&
    !forceRender &&
    ((preserve === undefined ? destroyOnClose : !preserve) || !visited.current)
  )
    return null;
  return (
    <div
      hidden={!present}
      className="leaf-modal-mask"
      data-blur={maskBlur ? undefined : 'off'}
      data-state={open ? 'open' : 'closing'}
      aria-hidden={!open || undefined}
      {...inertProps(!open)}
    >
      <button
        ref={backdrop}
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
        aria-labelledby={title != null ? titleId : props['aria-labelledby']}
        aria-describedby={
          [props['aria-describedby'], description != null && descriptionId]
            .filter(Boolean)
            .join(' ') || undefined
        }
        tabIndex={-1}
        className={classes('leaf-modal', divided && 'leaf-modal--divided', className)}
        style={{ width, ...style }}
      >
        <OverlayOwner.Provider value={modalId}>
          {(title != null || description != null || icon != null || closable) && (
            <div
              className={classes(
                'leaf-modal__header',
                description == null && 'leaf-modal__header--simple',
                title == null &&
                  description == null &&
                  icon == null &&
                  'leaf-modal__header--compact',
              )}
            >
              {icon != null && (
                <span className="leaf-modal__icon" aria-hidden="true">
                  {icon}
                </span>
              )}
              {(title != null || description != null) && (
                <div className="leaf-modal__heading">
                  {title != null && <h2 id={titleId}>{title}</h2>}
                  {description != null && (
                    <div id={descriptionId} className="leaf-modal__description">
                      {description}
                    </div>
                  )}
                </div>
              )}
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
          {((children != null && children !== false) || error != null) && (
            <Scrollbar
              className="leaf-modal__body"
              viewportClassName="leaf-modal__viewport"
              orientation="vertical"
              aria-labelledby={title != null ? titleId : undefined}
              aria-label={title == null ? (props['aria-label'] ?? messages.confirm) : undefined}
            >
              <div ref={content} className="leaf-modal__content">
                {children}
                {error && (
                  <p role="alert" className="leaf-confirm-error">
                    {error}
                  </p>
                )}
              </div>
            </Scrollbar>
          )}
          {renderedFooter != null && <div className="leaf-modal__footer">{renderedFooter}</div>}
        </OverlayOwner.Provider>
      </div>
    </div>
  );
}
export function Modal(props: ModalProps) {
  return (
    <ScopedPortal container={props.container}>
      <ModalSurface {...props} />
    </ScopedPortal>
  );
}
