import { X } from 'lucide-react';
import {
  type ComponentType,
  type ReactNode,
  type RefObject,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { ButtonControl } from '../button/button';
import { useLeafConfig } from '../config-provider/context';
import { ScrollbarControl as Scrollbar } from '../scrollbar/scrollbar';
import { classes } from '../shared/classes';
import { useDialog } from '../shared/dialog';
import { inertProps } from '../shared/inert';
import { OverlayOwner } from '../shared/overlay-owner';
import { useNaturalHeightTransition, usePresence } from '../shared/presence';
import { ScopedPortal } from '../shared/scoped-portal';
import type { ModalFooterActions, ModalProps, ModalTabsProps } from './modal';

export interface ModalTabsRenderProps {
  open: boolean;
  tabs: ModalTabsProps;
  title?: ReactNode;
  titleId: string;
  hasHeading: boolean;
  closeButton: ReactNode;
  contentRef: RefObject<HTMLDivElement | null>;
  snapHeight: () => void;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  scrollbarLabel?: string;
  scrollbarLabelledBy?: string;
  error?: string;
  children?: ReactNode;
}

export interface ModalBaseProps extends ModalProps {
  renderTabsLayout?: ComponentType<ModalTabsRenderProps>;
}

function ModalSurface({
  open,
  title,
  description,
  icon,
  divided = true,
  tabs,
  footer,
  confirmText,
  cancelText,
  confirmLoading = false,
  confirmButtonProps,
  cancelButtonProps,
  onConfirm,
  onCancel,
  width = 480,
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
  renderTabsLayout: RenderTabsLayout,
  children,
  className,
  style,
  ...props
}: ModalBaseProps) {
  const { messages, maskBlur } = useLeafConfig();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
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
    generation.current++;
    accepting.current = false;
    setPending(false);
    if (open) setError(undefined);
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
    setError(undefined);
    try {
      await onConfirm();
    } catch (reason) {
      if (mounted.current && generation.current === request)
        setError(reason instanceof Error ? reason.message : String(reason));
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
        variant="solid"
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
      <div className="leaf-modal__actions">
        {actions.cancelButton}
        {actions.confirmButton}
      </div>
    ) : (
      footer
    );
  const panel = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLButtonElement>(null);
  const present = usePresence(open, backdrop);
  const snapHeight = useNaturalHeightTransition(panel, content, open);
  const titleId = `${useId()}-title`;
  const descriptionId = `${useId()}-description`;
  const modalId = `${useId()}-dialog`;
  const close = useRef(cancel);
  close.current = cancel;
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

  const hasTabs = Boolean(tabs?.items?.length);
  const hasHeading = title != null || description != null || icon != null;
  const closeButton = closable ? (
    <button
      type="button"
      className="leaf-modal__close"
      aria-label={messages.common.close}
      onClick={() => close.current?.()}
    >
      <X size={18} aria-hidden="true" />
    </button>
  ) : null;
  const scrollbarLabel =
    title == null
      ? (props['aria-label'] ?? tabs?.['aria-label'] ?? messages.common.confirm)
      : undefined;
  const scrollbarLabelledBy = title != null ? titleId : undefined;

  return (
    <div
      hidden={!present}
      className="leaf-modal-mask"
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
          if (maskClosable) close.current?.();
        }}
      />
      {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: dialog and alertdialog both support aria-modal. */}
      <div
        {...props}
        ref={panel}
        id={props.id ?? modalId}
        role={props.role ?? 'dialog'}
        aria-modal="true"
        aria-labelledby={title != null ? titleId : props['aria-labelledby']}
        aria-describedby={
          [props['aria-describedby'], description != null && descriptionId]
            .filter(Boolean)
            .join(' ') || undefined
        }
        tabIndex={-1}
        className={classes(
          'leaf-modal',
          divided && 'leaf-modal--divided',
          hasTabs && 'leaf-modal--tabbed',
          hasHeading && 'leaf-modal--headed',
          className,
        )}
        style={{ width, ...style }}
      >
        <OverlayOwner.Provider value={modalId}>
          {(hasHeading || (!hasTabs && closable)) && (
            <div
              className={classes(
                'leaf-modal__header',
                description == null && 'leaf-modal__header--simple',
                icon != null && 'leaf-modal__header--icon',
                !hasHeading && 'leaf-modal__header--compact',
              )}
            >
              {icon != null && (
                <span className="leaf-modal__icon" aria-hidden="true">
                  {icon}
                </span>
              )}
              {(title != null || description != null) && (
                <div className="leaf-modal__heading">
                  {title != null && <h2 id={titleId}>{title}</h2>}
                  {description != null && (
                    <div id={descriptionId} className="leaf-modal__description">
                      {description}
                    </div>
                  )}
                </div>
              )}
              {closeButton}
            </div>
          )}
          {hasTabs && tabs && RenderTabsLayout ? (
            <RenderTabsLayout
              open={open}
              tabs={tabs}
              title={title}
              titleId={titleId}
              hasHeading={hasHeading}
              closeButton={!hasHeading ? closeButton : null}
              contentRef={content}
              snapHeight={snapHeight}
              ariaLabel={props['aria-label']}
              ariaLabelledBy={props['aria-labelledby']}
              scrollbarLabel={scrollbarLabel}
              scrollbarLabelledBy={scrollbarLabelledBy}
              error={error}
            >
              {children}
            </RenderTabsLayout>
          ) : (
            ((children != null && children !== false) || error != null) && (
              <Scrollbar
                className="leaf-modal__body"
                viewportClassName="leaf-modal__viewport"
                orientation="vertical"
                aria-labelledby={scrollbarLabelledBy}
                aria-label={scrollbarLabel}
              >
                <div ref={content} className="leaf-modal__content">
                  {children}
                  {error && (
                    <p role="alert" className="leaf-confirm-error">
                      {error}
                    </p>
                  )}
                </div>
              </Scrollbar>
            )
          )}
          {renderedFooter != null && <div className="leaf-modal__footer">{renderedFooter}</div>}
        </OverlayOwner.Provider>
      </div>
    </div>
  );
}

// 内部复用的对话框基础容器，避免 Confirm / FileList 继承公开 Modal 默认配置或引入 Tabs。
export function ModalBase(props: ModalBaseProps) {
  return (
    <ScopedPortal container={props.container}>
      <ModalSurface {...props} />
    </ScopedPortal>
  );
}
