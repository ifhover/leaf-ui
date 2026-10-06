import { type ReactNode, useEffect, useRef, useState } from 'react';
import { FeedbackIcon, type FeedbackType } from '../alert/alert';
import { Button, type ButtonProps } from '../button';
import { useLeafConfig } from '../config-provider/context';
import { Popover, type PopoverProps } from '../popover';
import { useControllable } from '../shared/use-controllable';
import { useText } from '../shared/use-text';
export interface PopconfirmProps
  extends Omit<PopoverProps, 'title' | 'content' | 'trigger' | 'autoFocus'> {
  title: ReactNode;
  description?: ReactNode;
  type?: FeedbackType | 'default';
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
export function Popconfirm({
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
}: PopconfirmProps) {
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
      aria-label={props['aria-label'] ?? (typeof title === 'string' ? title : messages.confirm)}
      className={['leaf-popconfirm', props.className].filter(Boolean).join(' ')}
      content={
        <div className="leaf-popconfirm__content">
          <div className={`leaf-popconfirm__icon leaf-popconfirm__icon--${type}`}>
            {icon ?? (type !== 'default' ? <FeedbackIcon type={type} /> : null)}
          </div>
          <div className="leaf-popconfirm__body">
            <div className="leaf-popconfirm__title">{title}</div>
            {description && <div className="leaf-popconfirm__description">{description}</div>}
            {error && (
              <p role="alert" className="leaf-popconfirm__error">
                {t('操作失败，请重试', 'Action failed. Please retry.')}
              </p>
            )}
            <div className="leaf-popconfirm__actions">
              {showCancel && (
                <Button
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
                  {cancelText ?? messages.cancel}
                </Button>
              )}
              <Button
                {...confirmButtonProps}
                size={confirmButtonProps?.size ?? 'sm'}
                danger={confirmButtonProps?.danger ?? type === 'error'}
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
                {confirmText ?? messages.confirm}
              </Button>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </Popover>
  );
}
