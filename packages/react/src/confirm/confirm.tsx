import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { FeedbackIcon } from '../alert/alert';
import { Button } from '../button';
import { useLeafConfig } from '../config-provider/config-provider';
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
  const type = typeProp ?? (danger ? 'danger' : 'default');
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    if (open) setError(undefined);
  }, [open]);
  async function accept() {
    if (busy.current || confirmLoading) return;
    busy.current = true;
    setPending(true);
    setError(undefined);
    try {
      await onConfirm?.();
      if (mounted.current) onClose?.();
    } catch (reason) {
      if (mounted.current) setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      busy.current = false;
      if (mounted.current) setPending(false);
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
      className={['leaf-confirm', `leaf-confirm--${type}`, props.className]
        .filter(Boolean)
        .join(' ')}
      title={
        title ? (
          <span className="leaf-confirm-title">
            {type !== 'default' && <FeedbackIcon type={type === 'danger' ? 'error' : type} />}
            {title}
          </span>
        ) : undefined
      }
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
        {!title && type !== 'default' && <FeedbackIcon type={type === 'danger' ? 'error' : type} />}
        <div>{children}</div>
      </div>
      {error && (
        <p role="alert" className="leaf-confirm-error">
          {error}
        </p>
      )}
    </Modal>
  );
}

/** The holder stays inside its ConfigProvider so imperative confirmations inherit the scope. */
export function useConfirm() {
  const [request, setRequest] = useState<{ id: number; options: ConfirmOptions; open: boolean }>();
  const active = useRef<{ id: number; resolve: (result: boolean) => void } | null>(null);
  const serial = useRef(0);
  const close = useCallback((id: number, result: boolean) => {
    if (active.current?.id !== id) return;
    active.current.resolve(result);
    active.current = null;
    setRequest((current) => (current?.id === id ? { ...current, open: false } : current));
  }, []);
  useEffect(
    () => () => {
      active.current?.resolve(false);
      active.current = null;
    },
    [],
  );
  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        active.current?.resolve(false);
        const id = ++serial.current;
        active.current = { id, resolve };
        setRequest({ id, options, open: true });
      }),
    [],
  );
  const contextHolder = request ? (
    <Confirm
      key={request.id}
      {...request.options}
      open={request.open}
      onConfirm={async () => {
        await request.options.onConfirm?.();
        close(request.id, true);
      }}
      onClose={() => close(request.id, false)}
      afterClose={() =>
        setRequest((current) => (current?.id === request.id && !current.open ? undefined : current))
      }
    />
  ) : null;
  return { confirm, contextHolder };
}
