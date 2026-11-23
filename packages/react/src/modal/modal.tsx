import type { HTMLAttributes, ReactNode } from 'react';
import type { ButtonProps } from '../button/button';
import { useComponentProps } from '../config-provider/component-defaults';
import type { DialogFocusOptions } from '../shared/dialog';
import type { ContainerPadding } from '../shared/types';
import { ModalBase } from './base';

export interface ModalFooterActions {
  confirmButton: ReactNode;
  cancelButton: ReactNode;
}

export interface ModalProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'>,
    DialogFocusOptions {
  open: boolean;
  title?: ReactNode;
  /** Size variant; `mini` uses a compact centered confirmation layout with equal-width footer actions. */
  size?: 'md' | 'mini';
  /** Highlight primary confirmation action and header icon with danger styling. */
  danger?: boolean;
  /** Supporting text displayed below the title. */
  description?: ReactNode;
  /** Decorative header icon. */
  icon?: ReactNode;
  /** Separate the footer action bar with a top border. */
  divided?: boolean;
  /** Customize inner padding for the modal or individual header/body/footer regions. */
  padding?: ContainerPadding;
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

type ModalControlProps = ModalProps;

function ModalControl({
  size = 'md',
  danger = false,
  divided = true,
  confirmLoading = false,
  width = 480,
  closable = true,
  maskClosable = true,
  keyboard = true,
  forceRender = false,
  destroyOnClose = false,
  ...props
}: ModalControlProps) {
  return (
    <ModalBase
      {...props}
      size={size}
      danger={danger}
      divided={divided}
      confirmLoading={confirmLoading}
      width={width}
      closable={closable}
      maskClosable={maskClosable}
      keyboard={keyboard}
      forceRender={forceRender}
      destroyOnClose={destroyOnClose}
    />
  );
}

export function Modal(rawProps: ModalProps) {
  const props = useComponentProps('Modal', rawProps);
  return (
    <ModalControl {...props} width={props.width ?? (props.size === 'mini' ? 340 : undefined)} />
  );
}
