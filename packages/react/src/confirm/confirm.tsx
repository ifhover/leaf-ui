import { CircleAlert } from 'lucide-react';
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '../button';
import { useLeafConfig } from '../config-provider/config-provider';
import { Modal, type ModalProps } from '../modal';

export interface ConfirmProps extends Omit<ModalProps, 'footer'> {
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
  onConfirm,
  onClose,
  ...props
}: ConfirmProps) {
  const { messages } = useLeafConfig();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const mounted = useRef(true);
  const busy = useRef(false);
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
    if (busy.current) return;
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
  return (
    <Modal
      {...props}
      open={open}
      role="alertdialog"
      title={title}
      maskClosable={pending ? false : (props.maskClosable ?? false)}
      closable={!pending && (props.closable ?? true)}
      keyboard={!pending && (props.keyboard ?? true)}
      onClose={pending ? undefined : onClose}
      footer={
        <>
          <Button variant="outline" disabled={pending} onClick={onClose}>
            {cancelText ?? messages.cancel}
          </Button>
          <Button danger={danger} loading={pending} onClick={accept}>
            {confirmText ?? messages.confirm}
          </Button>
        </>
      }
    >
      <div className="leaf-confirm-content">
        <CircleAlert size={22} aria-hidden="true" />
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
