import { X } from 'lucide-react';
import {
  type ComponentType,
  type ReactNode,
  type Ref,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { ButtonControl } from '../button/button';
import { useLeafConfig } from '../config-provider/context';
import { ScrollbarControl as Scrollbar } from '../scrollbar/scrollbar';
import { classes } from '../shared/classes';
import { useDialog, useOverlayLayer } from '../shared/dialog';
import { inertProps } from '../shared/inert';
import { OverlayOwner } from '../shared/overlay-owner';
import { resolveDialogPaddingFlags, resolvePaddingVars } from '../shared/padding';
import { usePresence } from '../shared/presence';
import { ScopedPortal } from '../shared/scoped-portal';
import type { ModalFooterActions, ModalProps, ModalTabsProps } from './modal';

export interface ModalTabsRenderProps {
  open: boolean;
  tabs: ModalTabsProps;
  title?: ReactNode;
  titleId: string;
  hasHeading: boolean;
  contentRef: Ref<HTMLDivElement>;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  scrollbarLabel?: string;
  scrollbarLabelledBy?: string;
  children?: ReactNode;
}

export interface ModalBaseProps extends ModalProps {
  /** 仅供内部确认服务在异步 onConfirm 完成后自动关闭弹窗。 */
  closeOnConfirm?: boolean;
  /** 仅供内部确认服务在异步 onConfirm 失败后关闭当前框并弹出失败提示。 */
  onConfirmError?: (reason: unknown) => void;
  /** 由公开 Modal 注入内嵌标签页布局，避免 Confirm 与 ConfigProvider 静态依赖 Tabs。 */
  renderTabsLayout?: ComponentType<ModalTabsRenderProps>;
}

export interface ModalBodyProps {
  contentRef: Ref<HTMLDivElement>;
  scrollbarLabel?: string;
  scrollbarLabelledBy?: string;
  children?: ReactNode;
}

/** 排除 null / undefined / 布尔占位节点，避免渲染空壳区域或分隔线。 */
export function hasRenderableNode(value: ReactNode): boolean {
  return value != null && typeof value !== 'boolean';
}

/** 共用的弹窗滚动正文容器，供 Modal、Confirm 等复用。 */
export function ModalBody({
  contentRef,
  scrollbarLabel,
  scrollbarLabelledBy,
  children,
}: ModalBodyProps) {
  return (
    <Scrollbar
      className="leaf-modal__body"
      viewportClassName="leaf-modal__viewport"
      orientation="vertical"
      aria-labelledby={scrollbarLabelledBy}
      aria-label={scrollbarLabel}
    >
      <div ref={contentRef} className="leaf-modal__content">
        {children}
      </div>
    </Scrollbar>
  );
}

function ModalSurface({
  open,
  title,
  description,
  tabs,
  icon,
  size = 'md',
  danger = false,
  divided = true,
  padding,
  footer,
  confirmText,
  cancelText,
  confirmLoading = false,
  confirmButtonProps,
  cancelButtonProps,
  onConfirm,
  onCancel,
  width,
  closable = true,
  maskClosable = true,
  keyboard = true,
  onClose,
  afterClose,
  forceRender = false,
  destroyOnClose = false,
  preserve,
  initialFocus,
  returnFocus,
  container: _container,
  closeOnConfirm = false,
  onConfirmError,
  renderTabsLayout: RenderTabsLayout,
  children,
  className,
  style,
  ...props
}: ModalBaseProps) {
  const { messages, maskBlur, theme } = useLeafConfig();
  const [pending, setPending] = useState(false);
  const mounted = useRef(true);
  const accepting = useRef(false);
  const generation = useRef(0);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    // 开关状态切换时推进提交代次，屏蔽关闭并重开前的旧异步结果。
    void open;
    generation.current++;
    accepting.current = false;
    setPending(false);
  }, [open]);
  const busy = pending || confirmLoading;
  async function accept() {
    if (accepting.current || busy) return;
    if (!onConfirm) {
      if (confirmButtonProps?.type !== 'submit') onClose?.();
      return;
    }
    accepting.current = true;
    const request = generation.current;
    setPending(true);
    try {
      await onConfirm();
      if (closeOnConfirm && mounted.current && generation.current === request) onClose?.();
    } catch (reason) {
      if (mounted.current && generation.current === request) onConfirmError?.(reason);
    } finally {
      if (generation.current === request) {
        accepting.current = false;
        if (mounted.current) setPending(false);
      }
    }
  }
  const cancel = () => {
    if (!busy) (onCancel ?? onClose)?.();
  };
  const actions: ModalFooterActions = {
    cancelButton: (
      <ButtonControl
        type="button"
        variant="outline"
        {...cancelButtonProps}
        disabled={busy || cancelButtonProps?.disabled}
        onClick={(event) => {
          cancelButtonProps?.onClick?.(event);
          if (!event.defaultPrevented) cancel();
        }}
      >
        {cancelText ?? messages.common.cancel}
      </ButtonControl>
    ),
    confirmButton: (
      <ButtonControl
        type="button"
        variant={danger ? 'danger' : 'solid'}
        {...confirmButtonProps}
        loading={busy || confirmButtonProps?.loading}
        onClick={(event) => {
          confirmButtonProps?.onClick?.(event);
          if (!event.defaultPrevented) void accept();
        }}
      >
        {confirmText ?? messages.common.confirm}
      </ButtonControl>
    ),
  };
  const renderedFooter =
    typeof footer === 'function' ? (
      footer(actions)
    ) : footer === undefined ? (
      <>
        {actions.cancelButton}
        {actions.confirmButton}
      </>
    ) : (
      footer
    );
  const panel = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLButtonElement>(null);
  const present = usePresence(open, backdrop);
  const layer = useOverlayLayer(present, open);
  const baseId = useId();
  const titleId = `${baseId}-title`;
  const descriptionId = `${baseId}-description`;
  const modalId = `${baseId}-dialog`;
  const wasPresent = useRef(false);
  useEffect(() => {
    if (wasPresent.current && !present) afterClose?.();
    wasPresent.current = present;
  }, [present, afterClose]);
  useDialog(open, panel, modalId, cancel, keyboard, { initialFocus, returnFocus });
  const visited = useRef(false);
  if (open) visited.current = true;
  if (
    !present &&
    !forceRender &&
    ((preserve === undefined ? destroyOnClose : !preserve) || !visited.current)
  )
    return null;

  const hasTitle = hasRenderableNode(title);
  const hasDescription = hasRenderableNode(description);
  const hasIcon = hasRenderableNode(icon);
  const hasHeading = hasTitle || hasDescription || hasIcon;
  const hasFooter = hasRenderableNode(renderedFooter);
  const hasBody = hasRenderableNode(children);
  const hasTabs = Boolean(tabs?.items?.length && RenderTabsLayout);
  const tabsSize = hasTabs ? (tabs?.size ?? 'md') : undefined;
  const paddingStyle = resolvePaddingVars('modal', padding);
  const paddingFlags = resolveDialogPaddingFlags(padding);
  const modalTheme = theme.components?.Modal;
  const surfaceFlags = {
    ...(modalTheme?.headerBackground !== undefined ? { 'data-header-surface': '' } : {}),
    ...(modalTheme?.footerBackground !== undefined ? { 'data-footer-surface': '' } : {}),
  };
  const closeButton = closable ? (
    <button
      type="button"
      className="leaf-modal__close"
      aria-label={messages.common.close}
      onClick={cancel}
    >
      <X size={16} aria-hidden="true" />
    </button>
  ) : null;
  const resolvedWidth = width ?? (size === 'mini' ? 340 : 480);
  const scrollbarLabelledBy = hasTitle ? titleId : props['aria-labelledby'];
  const scrollbarLabel =
    scrollbarLabelledBy == null ? (props['aria-label'] ?? messages.common.confirm) : undefined;

  return (
    <div
      hidden={!present}
      className="leaf-modal-mask"
      style={layer.maskStyle}
      data-blur={maskBlur ? undefined : 'off'}
      data-state={open ? 'open' : 'closing'}
      aria-hidden={!open || undefined}
      {...inertProps(!open)}
    >
      <button
        ref={backdrop}
        type="button"
        className="leaf-modal-backdrop"
        tabIndex={-1}
        aria-label={messages.common.close}
        onClick={() => {
          if (maskClosable) cancel();
        }}
      />
      {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: dialog and alertdialog both support aria-modal. */}
      <div
        {...props}
        ref={panel}
        id={props.id ?? modalId}
        role={props.role ?? 'dialog'}
        aria-modal="true"
        aria-labelledby={hasTitle ? titleId : props['aria-labelledby']}
        aria-describedby={
          [props['aria-describedby'], hasDescription && descriptionId].filter(Boolean).join(' ') ||
          undefined
        }
        tabIndex={-1}
        className={classes(
          'leaf-modal',
          size === 'mini' && 'leaf-modal--mini',
          danger && 'leaf-modal--danger',
          divided && 'leaf-modal--divided',
          hasHeading && 'leaf-modal--headed',
          hasTabs && 'leaf-modal--tabbed',
          closable && 'leaf-modal--closable',
          className,
        )}
        data-tabs-size={tabsSize}
        {...paddingFlags}
        {...surfaceFlags}
        style={{ width: resolvedWidth, ...layer.popupStyle, ...paddingStyle, ...style }}
      >
        <OverlayOwner.Provider value={modalId}>
          {hasHeading && (
            <div className={classes('leaf-modal__header', hasIcon && 'leaf-modal__header--icon')}>
              {hasIcon && (
                <span className="leaf-modal__icon" aria-hidden="true">
                  {icon}
                </span>
              )}
              {(hasTitle || hasDescription) && (
                <div className="leaf-modal__heading">
                  {hasTitle && <h2 id={titleId}>{title}</h2>}
                  {hasDescription && (
                    <div id={descriptionId} className="leaf-modal__description">
                      {description}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {closeButton}
          {hasTabs && tabs && RenderTabsLayout ? (
            <RenderTabsLayout
              open={open}
              tabs={tabs}
              title={title}
              titleId={titleId}
              hasHeading={hasHeading}
              contentRef={content}
              ariaLabel={props['aria-label']}
              ariaLabelledBy={props['aria-labelledby']}
              scrollbarLabel={scrollbarLabel}
              scrollbarLabelledBy={scrollbarLabelledBy}
            >
              {children}
            </RenderTabsLayout>
          ) : (
            hasBody && (
              <ModalBody
                contentRef={content}
                scrollbarLabel={scrollbarLabel}
                scrollbarLabelledBy={scrollbarLabelledBy}
              >
                {children}
              </ModalBody>
            )
          )}
          {hasFooter && <div className="leaf-modal__footer">{renderedFooter}</div>}
        </OverlayOwner.Provider>
      </div>
    </div>
  );
}

// 内部复用的对话框基础容器，避免 Confirm / FileList 继承公开 Modal 默认配置。
export function ModalBase(props: ModalBaseProps) {
  const visited = useRef(false);
  // 首次打开或显式 forceRender 前保留行内锚点并延迟挂载 ScopedPortal，避免提前在 body 占位。
  if (props.open || props.forceRender) visited.current = true;
  if (!visited.current) return <span hidden />;
  return (
    <ScopedPortal container={props.container}>
      <ModalSurface {...props} />
    </ScopedPortal>
  );
}
