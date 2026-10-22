import { type ReactNode, useEffect, useRef, useState } from 'react';
import { FeedbackIcon } from '../alert/alert';
import { ButtonControl, type ButtonProps } from '../button/button';
import { useComponentProps } from '../config-provider/component-defaults';
import { useLeafConfig } from '../config-provider/context';
import type { PopoverProps } from '../popover';
import { PopoverControl as Popover } from '../popover/popover';
import { type FeedbackTypeInput, normalizeFeedbackType } from '../shared/feedback';
import { useControllable } from '../shared/use-controllable';
import { useText } from '../shared/use-text';
export interface PopconfirmProps
  extends Omit<PopoverProps, 'title' | 'content' | 'trigger' | 'autoFocus'> {
  title: ReactNode;
  description?: ReactNode;
  type?: FeedbackTypeInput | 'default';
  icon?: ReactNode;
  confirmText?: ReactNode;
  cancelText?: ReactNode;
  confirmButtonProps?: ButtonProps;
  cancelButtonProps?: ButtonProps;
  showCancel?: boolean;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  onError?: (error: unknown) => void;
}
export function Popconfirm(rawProps: PopconfirmProps) {
  const {
    title,
    description,
    type = 'warning',
    icon,
    confirmText,
    cancelText,
    confirmButtonProps,
    cancelButtonProps,
    showCancel = true,
    onConfirm,
    onCancel,
    onError,
    open: controlled,
    defaultOpen = false,
    onOpenChange,
    children,
    ...props
  } = useComponentProps('Popconfirm', rawProps);
  const normalizedType = type === 'default' ? type : normalizeFeedbackType(type);
  const { messages } = useLeafConfig();
  const t = useText();
  const [open, setOpen] = useControllable(controlled, defaultOpen, onOpenChange);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const inFlight = useRef(false);
  const generation = useRef(0);
  useEffect(() => {
    generation.current++;
    inFlight.current = false;
    setBusy(false);
    if (open) setError(false);
    return () => {
      generation.current++;
    };
  }, [open]);
  return (
    <Popover
      {...props}
      trigger="click"
      open={open}
      onOpenChange={(next) => {
        if (!inFlight.current) {
          setError(false);
          setOpen(next);
        }
      }}
      autoFocus={false}
      aria-label={
        props['aria-label'] ?? (typeof title === 'string' ? title : messages.common.confirm)
      }
      className={['leaf-popconfirm', props.className].filter(Boolean).join(' ')}
      content={
        <div className="leaf-popconfirm__content">
          <div className={`leaf-popconfirm__icon leaf-popconfirm__icon--${normalizedType}`}>
            {icon ?? (normalizedType !== 'default' ? <FeedbackIcon type={normalizedType} /> : null)}
          </div>
          <div className="leaf-popconfirm__body">
            <div className="leaf-popconfirm__title">{title}</div>
            {description && <div className="leaf-popconfirm__description">{description}</div>}
            {error && (
              <p role="alert" className="leaf-popconfirm__error">
                {t('popconfirm.actionFailedPleaseRetry')}
              </p>
            )}
            <div className="leaf-popconfirm__actions">
              {showCancel && (
                <ButtonControl
                  {...cancelButtonProps}
                  size={cancelButtonProps?.size ?? 'sm'}
                  variant={cancelButtonProps?.variant ?? 'outline'}
                  disabled={busy || cancelButtonProps?.disabled}
                  onClick={(event) => {
                    cancelButtonProps?.onClick?.(event);
                    if (!event.defaultPrevented) {
                      onCancel?.();
                      setOpen(false);
                    }
                  }}
                >
                  {cancelText ?? messages.common.cancel}
                </ButtonControl>
              )}
              <ButtonControl
                {...confirmButtonProps}
                size={confirmButtonProps?.size ?? 'sm'}
                variant={confirmButtonProps?.variant ?? 'solid'}
                danger={confirmButtonProps?.danger ?? normalizedType === 'danger'}
                loading={busy || confirmButtonProps?.loading}
                onClick={async (event) => {
                  confirmButtonProps?.onClick?.(event);
                  if (event.defaultPrevented || inFlight.current) return;
                  inFlight.current = true;
                  const request = generation.current;
                  setBusy(true);
                  setError(false);
                  try {
                    await onConfirm?.();
                    if (generation.current !== request) return;
                    setOpen(false);
                  } catch (reason) {
                    if (generation.current !== request) return;
                    setError(true);
                    onError?.(reason);
                  } finally {
                    if (generation.current === request) {
                      inFlight.current = false;
                      setBusy(false);
                    }
                  }
                }}
              >
                {confirmText ?? messages.common.confirm}
              </ButtonControl>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </Popover>
  );
}
