import { type HTMLAttributes, type ReactNode, useEffect, useLayoutEffect, useRef } from 'react';
import type { ButtonProps } from '../button/button';
import { useComponentProps } from '../config-provider/component-defaults';
import { ScrollbarControl as Scrollbar } from '../scrollbar/scrollbar';
import { classes } from '../shared/classes';
import type { DialogFocusOptions } from '../shared/dialog';
import { type TabsProps, useTabsParts } from '../tabs/tabs';
import { ModalBase, type ModalTabsRenderProps } from './base';

const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

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
  /** Supporting text displayed below the title. */
  description?: ReactNode;
  /** Decorative header icon. */
  icon?: ReactNode;
  /** Separate the header and footer with subtle borders. */
  divided?: boolean;
  /** Embedded tabs placed below the heading, or replacing it when no title is supplied. */
  tabs?: ModalTabsProps;
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
  closeButton,
  contentRef,
  snapHeight,
  ariaLabel,
  ariaLabelledBy,
  scrollbarLabel,
  scrollbarLabelledBy,
  error,
  children,
}: ModalTabsRenderProps) {
  const tabExtra =
    !hasHeading && closeButton != null ? (
      <div className="leaf-dialog-tab-extra leaf-modal__tab-extra">
        {tabs.extra}
        {closeButton}
      </div>
    ) : (
      tabs.extra
    );
  const tabLabel = tabs['aria-label'] ?? (typeof title === 'string' ? title : ariaLabel);
  const tabLabelledBy =
    tabs['aria-labelledby'] ??
    (tabs['aria-label'] == null && title != null
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
    extra: tabExtra,
    className: classes(
      'leaf-dialog-tabs',
      hasHeading && 'leaf-dialog-tabs--headed',
      'leaf-modal__tabs',
      tabs.className,
    ),
    panelsClassName: 'leaf-dialog-panels',
    visibilityKey: open,
  });
  const previousSelected = useRef(parts?.selected);
  useBrowserLayoutEffect(() => {
    if (previousSelected.current === parts?.selected) return;
    previousSelected.current = parts?.selected;
    snapHeight();
  }, [parts?.selected, snapHeight]);

  return (
    <>
      {parts && <div {...parts.rootProps}>{parts.header}</div>}
      {(parts?.hasPanels || (children != null && children !== false) || error != null) && (
        <Scrollbar
          className="leaf-modal__body"
          viewportClassName="leaf-modal__viewport"
          orientation="vertical"
          aria-labelledby={scrollbarLabelledBy}
          aria-label={scrollbarLabel}
        >
          <div ref={contentRef} className="leaf-modal__content">
            {parts?.panels}
            {children}
            {error && (
              <p role="alert" className="leaf-confirm-error">
                {error}
              </p>
            )}
          </div>
        </Scrollbar>
      )}
    </>
  );
}

type ModalControlProps = ModalProps;

function ModalControl({
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
  return <ModalControl {...props} />;
}
