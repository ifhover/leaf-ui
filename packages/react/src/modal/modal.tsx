import type { HTMLAttributes, ReactNode } from 'react';
import type { ButtonProps } from '../button/button';
import { useComponentProps } from '../config-provider/component-defaults';
import { classes } from '../shared/classes';
import type { DialogFocusOptions } from '../shared/dialog';
import type { ContainerPadding } from '../shared/types';
import { type TabsProps, useTabsParts } from '../tabs/tabs';
import { hasRenderableNode, ModalBase, ModalBody, type ModalTabsRenderProps } from './base';

export interface ModalFooterActions {
  confirmButton: ReactNode;
  cancelButton: ReactNode;
}

/** Tabs controls integrated with the modal; Modal fixes the line type and top placement. */
export interface ModalTabsProps extends Omit<TabsProps, 'type' | 'placement' | 'children'> {}

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
  /** Embedded tabs placed below the heading, or replacing it when no title is supplied. */
  tabs?: ModalTabsProps;
  /** Decorative header icon. */
  icon?: ReactNode;
  /** Separate the header and footer with subtle borders. */
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

function ModalTabsLayout({
  open,
  tabs,
  title,
  titleId,
  hasHeading,
  contentRef,
  ariaLabel,
  ariaLabelledBy,
  scrollbarLabel,
  scrollbarLabelledBy,
  children,
}: ModalTabsRenderProps) {
  const hasTitle = hasRenderableNode(title);
  const tabLabel = tabs['aria-label'] ?? (typeof title === 'string' ? title : ariaLabel);
  const tabLabelledBy =
    tabs['aria-labelledby'] ??
    (tabs['aria-label'] == null && hasTitle
      ? titleId
      : tabs['aria-label'] == null
        ? ariaLabelledBy
        : undefined);
  const parts = useTabsParts({
    ...tabs,
    type: 'line',
    placement: 'top',
    size: tabs.size ?? 'md',
    'aria-label': tabLabel,
    'aria-labelledby': tabLabelledBy,
    className: classes(
      'leaf-dialog-tabs',
      hasHeading && 'leaf-dialog-tabs--headed',
      'leaf-modal__tabs',
      tabs.className,
    ),
    panelsClassName: 'leaf-dialog-panels',
    visibilityKey: open,
  });
  const hasContent = Boolean(parts?.hasPanels) || hasRenderableNode(children);

  return (
    <>
      {parts && <div {...parts.rootProps}>{parts.header}</div>}
      {hasContent && (
        <ModalBody
          contentRef={contentRef}
          scrollbarLabel={scrollbarLabel}
          scrollbarLabelledBy={scrollbarLabelledBy}
        >
          {parts?.panels}
          {children}
        </ModalBody>
      )}
    </>
  );
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
      renderTabsLayout={ModalTabsLayout}
    />
  );
}

export function Modal(rawProps: ModalProps) {
  const props = useComponentProps('Modal', rawProps);
  return (
    <ModalControl {...props} width={props.width ?? (props.size === 'mini' ? 340 : undefined)} />
  );
}
