import { Check, CircleAlert, Info, TriangleAlert } from 'lucide-react';
import { type CSSProperties, type ReactNode, useId } from 'react';
import type { ButtonProps } from '../button/button';
import { useLeafConfig } from '../config-provider/context';
import { hasRenderableNode, ModalBase } from '../modal/base';
import type { DialogFocusOptions } from '../shared/dialog';

export interface ConfirmOptions extends DialogFocusOptions {
  title?: ReactNode;
  /** A short explanation of the action being confirmed. */
  children?: ReactNode;
  /** Decorative or status icon shown in the centered header tray above the title. Use null to hide it. */
  icon?: ReactNode;
  type?: 'default' | 'success' | 'warning' | 'danger';
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
  onConfirmError?: (reason: unknown) => void;
}

const confirmIcons = {
  default: Info,
  success: Check,
  warning: TriangleAlert,
  danger: CircleAlert,
} as const;

// 仅由确认请求队列渲染；外部通过 useConfirm().confirm() 调用。
export function ConfirmDialog({
  open,
  title,
  icon,
  children,
  type = 'default',
  showCancel,
  width = 340,
  closable = false,
  maskClosable = false,
  keyboard = true,
  onCancel,
  onClose,
  onConfirmError,
  className,
  ...props
}: ConfirmDialogProps) {
  const { messages } = useLeafConfig();
  const contentId = useId();
  const hasChildren = hasRenderableNode(children);
  const hasTitle = hasRenderableNode(title);
  const showCancelAction = showCancel ?? type !== 'success';
  const StatusIcon = confirmIcons[type];
  const contentIcon = icon === undefined ? <StatusIcon aria-hidden="true" /> : icon;

  return (
    <ModalBase
      {...props}
      open={open}
      title={title}
      icon={contentIcon}
      size="mini"
      danger={type === 'danger'}
      width={width}
      divided
      closeOnConfirm
      onConfirmError={onConfirmError ?? (() => onClose())}
      role="alertdialog"
      aria-label={!hasTitle ? messages.common.confirm : undefined}
      aria-describedby={hasChildren ? contentId : undefined}
      className={['leaf-confirm', `leaf-confirm--${type}`, className].filter(Boolean).join(' ')}
      maskClosable={maskClosable}
      closable={closable}
      keyboard={keyboard}
      onClose={onClose}
      onCancel={() => {
        onCancel?.();
        onClose();
      }}
      footer={showCancelAction ? undefined : ({ confirmButton }) => confirmButton}
    >
      {hasChildren && (
        <div id={contentId} className="leaf-confirm-description">
          {children}
        </div>
      )}
    </ModalBase>
  );
}
