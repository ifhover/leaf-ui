import { CircleAlert } from 'lucide-react';
import { type CSSProperties, type ReactNode, useEffect, useId, useRef, useState } from 'react';
import { FeedbackIcon } from '../alert/alert';
import { ButtonControl, type ButtonProps } from '../button/button';
import { useLeafConfig } from '../config-provider/context';
import { ModalBase } from '../modal/modal';
import type { DialogFocusOptions } from '../shared/dialog';

export interface ConfirmOptions extends DialogFocusOptions {
  title?: ReactNode;
  /** A short explanation of the action being confirmed. */
  children?: ReactNode;
  /** Bare semantic icon beside the title, or content when untitled. Use null to hide it. */
  icon?: ReactNode;
  type?: 'default' | 'danger' | 'success' | 'warning' | 'info';
  showCancel?: boolean;
  confirmText?: ReactNode;
  cancelText?: ReactNode;
  confirmButtonProps?: ButtonProps;
  cancelButtonProps?: ButtonProps;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  width?: number | string;
  closable?: boolean;
  maskClosable?: boolean;
  keyboard?: boolean;
  className?: string;
  style?: CSSProperties;
}
interface ConfirmDialogProps extends ConfirmOptions {
  open: boolean;
  onClose: () => void;
  afterClose?: () => void;
}

// Rendered only by the confirmation queue; consumers call useConfirm().confirm().
export function ConfirmDialog({
  open,
  title,
  icon,
  children,
  confirmText,
  cancelText,
  type = 'default',
  showCancel,
  confirmButtonProps,
  cancelButtonProps,
  onCancel,
  onConfirm,
  onClose,
  ...props
}: ConfirmDialogProps) {
  const { messages } = useLeafConfig();
  const contentId = useId();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const mounted = useRef(true);
  const busy = useRef(false);
  const generation = useRef(0);
  const confirmLoading = confirmButtonProps?.loading ?? false;
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
  const contentIcon =
    icon === undefined && type !== 'default' ? (
      type === 'danger' ? (
        <CircleAlert aria-hidden="true" />
      ) : (
        <FeedbackIcon type={type} />
      )
    ) : (
      icon
    );
  return (
    <ModalBase
      {...props}
      open={open}
      title={
        title != null && contentIcon != null ? (
          <>
            <span className="leaf-confirm__icon" aria-hidden="true">
              {contentIcon}
            </span>
            <span className="leaf-confirm__title">{title}</span>
          </>
        ) : (
          title
        )
      }
      width={props.width ?? 420}
      divided={false}
      confirmLoading={pending || confirmLoading}
      role="alertdialog"
      aria-label={title == null ? messages.common.confirm : undefined}
      aria-describedby={children != null ? contentId : undefined}
      className={[
        'leaf-confirm',
        `leaf-confirm--${type}`,
        title != null && contentIcon != null && 'leaf-confirm--titled-icon',
        (icon != null || (icon === undefined && type !== 'default')) && 'leaf-confirm--has-icon',
        props.className,
      ]
        .filter(Boolean)
        .join(' ')}
      maskClosable={pending ? false : (props.maskClosable ?? false)}
      closable={!pending && (props.closable ?? false)}
      keyboard={!pending && (props.keyboard ?? true)}
      onClose={cancel}
      onCancel={cancel}
      footer={
        <>
          {(showCancel ?? type !== 'success') && (
            <ButtonControl
              type="button"
              variant="outline"
              {...cancelButtonProps}
              disabled={pending || confirmLoading || cancelButtonProps?.disabled}
              onClick={(event) => {
                cancelButtonProps?.onClick?.(event);
                if (!event.defaultPrevented) cancel();
              }}
            >
              {cancelText ?? messages.common.cancel}
            </ButtonControl>
          )}
          <ButtonControl
            type="button"
            variant="solid"
            {...confirmButtonProps}
            danger={type === 'danger'}
            loading={pending || confirmLoading || confirmButtonProps?.loading}
            onClick={(event) => {
              confirmButtonProps?.onClick?.(event);
              if (!event.defaultPrevented) void accept();
            }}
          >
            {confirmText ?? messages.common.confirm}
          </ButtonControl>
        </>
      }
    >
      {(contentIcon != null || children != null || error != null) && (
        <div className="leaf-confirm__body">
          {title == null && contentIcon != null && (
            <span className="leaf-confirm__icon" aria-hidden="true">
              {contentIcon}
            </span>
          )}
          <div className="leaf-confirm__content">
            {children != null && (
              <div id={contentId} className="leaf-confirm-description">
                {children}
              </div>
            )}
            {error && (
              <p role="alert" className="leaf-confirm-error">
                {error}
              </p>
            )}
          </div>
        </div>
      )}
    </ModalBase>
  );
}
