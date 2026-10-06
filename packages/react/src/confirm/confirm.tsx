import { type ReactNode, useEffect, useId, useRef, useState } from 'react';
import { FeedbackIcon } from '../alert/alert';
import { Button } from '../button';
import { useLeafConfig } from '../config-provider/context';
import { Modal, type ModalProps } from '../modal';

export interface ConfirmProps extends Omit<ModalProps, 'footer' | 'onConfirm'> {
  type?: 'default' | 'danger' | 'success' | 'warning' | 'info';
  showCancel?: boolean;
  confirmText?: ReactNode;
  cancelText?: ReactNode;
  danger?: boolean;
  onConfirm?: () => void | Promise<void>;
}
export type ConfirmOptions = Omit<ConfirmProps, 'open' | 'onClose' | 'afterClose'>;

export function Confirm({
  open,
  title,
  children,
  confirmText,
  cancelText,
  danger,
  type: typeProp,
  showCancel,
  confirmLoading = false,
  confirmButtonProps,
  cancelButtonProps,
  onCancel,
  onConfirm,
  onClose,
  ...props
}: ConfirmProps) {
  const { messages } = useLeafConfig();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const mounted = useRef(true);
  const busy = useRef(false);
  const generation = useRef(0);
  const type = typeProp ?? (danger ? 'danger' : 'default');
  const titleId = `${useId()}-confirm-title`;
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    generation.current++;
    busy.current = false;
    setPending(false);
    if (open) setError(undefined);
  }, [open]);
  async function accept() {
    if (busy.current || confirmLoading) return;
    busy.current = true;
    const request = generation.current;
    setPending(true);
    setError(undefined);
    try {
      await onConfirm?.();
      if (mounted.current && generation.current === request) onClose?.();
    } catch (reason) {
      if (mounted.current && generation.current === request)
        setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      if (generation.current === request) {
        busy.current = false;
        if (mounted.current) setPending(false);
      }
    }
  }
  const cancel = () => {
    if (!pending && !confirmLoading) {
      onCancel?.();
      onClose?.();
    }
  };
  return (
    <Modal
      {...props}
      open={open}
      confirmLoading={pending || confirmLoading}
      role="alertdialog"
      className={[
        'leaf-confirm',
        `leaf-confirm--${type}`,
        type !== 'default' && 'leaf-confirm--has-icon',
        props.closable !== false && 'leaf-confirm--closable',
        props.className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-labelledby={title ? titleId : props['aria-labelledby']}
      maskClosable={pending ? false : (props.maskClosable ?? false)}
      closable={!pending && (props.closable ?? true)}
      keyboard={!pending && (props.keyboard ?? true)}
      onClose={cancel}
      onCancel={cancel}
      footer={
        <>
          {(showCancel ?? type !== 'success') && (
            <Button
              variant="outline"
              {...cancelButtonProps}
              disabled={pending || confirmLoading || cancelButtonProps?.disabled}
              onClick={(event) => {
                cancelButtonProps?.onClick?.(event);
                if (!event.defaultPrevented) cancel();
              }}
            >
              {cancelText ?? messages.cancel}
            </Button>
          )}
          <Button
            {...confirmButtonProps}
            danger={type === 'danger'}
            loading={pending || confirmLoading || confirmButtonProps?.loading}
            onClick={(event) => {
              confirmButtonProps?.onClick?.(event);
              if (!event.defaultPrevented) void accept();
            }}
          >
            {confirmText ?? messages.confirm}
          </Button>
        </>
      }
    >
      <div className="leaf-confirm-content">
        {type !== 'default' && (
          <span className="leaf-confirm-icon">
            <FeedbackIcon type={type === 'danger' ? 'error' : type} />
          </span>
        )}
        <div className="leaf-confirm-copy">
          {title && (
            <h2 id={titleId} className="leaf-confirm-title">
              {title}
            </h2>
          )}
          <div className="leaf-confirm-description">{children}</div>
          {error && (
            <p role="alert" className="leaf-confirm-error">
              {error}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
