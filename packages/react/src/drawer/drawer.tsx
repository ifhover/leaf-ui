import { X } from 'lucide-react';
import {
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { useComponentProps } from '../config-provider/component-defaults';
import { useLeafConfig } from '../config-provider/context';
import { ScrollbarControl } from '../scrollbar/scrollbar';
import { classes } from '../shared/classes';
import { type DialogFocusOptions, useDialog, useOverlayLayer } from '../shared/dialog';
import { inertProps } from '../shared/inert';
import { OverlayOwner } from '../shared/overlay-owner';
import { resolveDialogPaddingFlags, resolvePaddingVars } from '../shared/padding';
import { useContentTransition, usePresence } from '../shared/presence';
import { ScopedPortal } from '../shared/scoped-portal';
import type { ContainerPadding } from '../shared/types';

export interface DrawerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'onResize'>,
    DialogFocusOptions {
  open: boolean;
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  /** Separate the header and footer with subtle borders. */
  divided?: boolean;
  /** Customize inner padding for the drawer or individual header/body/footer regions. */
  padding?: ContainerPadding;
  footer?: ReactNode;
  extra?: ReactNode;
  placement?: 'left' | 'right' | 'top' | 'bottom';
  width?: number | string;
  height?: number | string;
  closable?: boolean;
  maskClosable?: boolean;
  keyboard?: boolean;
  onClose?: () => void;
  afterClose?: () => void;
  forceRender?: boolean;
  destroyOnClose?: boolean;
  preserve?: boolean;
  container?: Element | DocumentFragment | (() => Element | DocumentFragment);
  push?: boolean | number;
  /** Show a swipe handle bar along the leading edge and allow pointer dragging to close. Defaults to `true` when `placement="bottom"`. */
  showSwipeHandle?: boolean;
  resizable?: boolean;
  minSize?: number;
  maxSize?: number;
  onResize?: (size: number) => void;
}

interface DrawerInnerProps {
  id: string;
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  extra?: ReactNode;
  footer?: ReactNode;
  closable: boolean;
  onClose?: () => void;
  contentRef: Ref<HTMLDivElement>;
  ariaLabel?: string;
  children?: ReactNode;
}

function DrawerInner({
  id,
  title,
  description,
  icon,
  extra,
  footer,
  closable,
  onClose,
  contentRef,
  ariaLabel,
  children,
}: DrawerInnerProps) {
  const { messages } = useLeafConfig();
  const hasHeading = title != null || description != null || icon != null;
  const closeButton = closable ? (
    <button
      type="button"
      className="leaf-drawer__close"
      aria-label={messages.common.close}
      onClick={onClose}
    >
      <X size={16} aria-hidden="true" />
    </button>
  ) : null;
  const extraNode = extra != null ? <div className="leaf-drawer__extra">{extra}</div> : null;

  return (
    <>
      {(hasHeading || extra != null) && (
        <div
          className={classes('leaf-drawer__header', !hasHeading && 'leaf-drawer__header--compact')}
        >
          {icon != null && (
            <span className="leaf-drawer__icon" aria-hidden="true">
              {icon}
            </span>
          )}
          {(title != null || description != null) && (
            <div className="leaf-drawer__heading">
              {title != null && <h2 id={`${id}-title`}>{title}</h2>}
              {description != null && (
                <div id={`${id}-description`} className="leaf-drawer__description">
                  {description}
                </div>
              )}
            </div>
          )}
          {extraNode}
        </div>
      )}
      {closeButton}
      <ScrollbarControl
        className="leaf-drawer__body"
        viewportClassName="leaf-drawer__viewport"
        orientation="vertical"
        role={title != null || ariaLabel ? 'region' : 'presentation'}
        aria-labelledby={title != null ? `${id}-title` : undefined}
        aria-label={title == null ? ariaLabel : undefined}
      >
        <div ref={contentRef} className="leaf-drawer__content">
          {children}
        </div>
      </ScrollbarControl>
      {footer != null && <div className="leaf-drawer__footer">{footer}</div>}
    </>
  );
}

function DrawerSurface({
  open,
  title,
  description,
  icon,
  divided = false,
  padding,
  footer,
  extra,
  placement = 'right',
  width = 380,
  height = 300,
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
  push = false,
  showSwipeHandle,
  resizable = false,
  minSize = 240,
  maxSize = 900,
  onResize,
  children,
  className,
  style,
  ...props
}: DrawerProps) {
  const { messages, maskBlur, theme } = useLeafConfig();
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLButtonElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const present = usePresence(open, backdrop);
  const layer = useOverlayLayer(present, open);
  const hasHeading = title != null || description != null || icon != null;
  const swipeHandleVisible = showSwipeHandle ?? placement === 'bottom';
  const paddingStyle = resolvePaddingVars('drawer', padding);
  const paddingFlags = resolveDialogPaddingFlags(padding);
  const drawerTheme = theme.components?.Drawer;
  const surfaceFlags = {
    ...(drawerTheme?.headerBackground !== undefined ? { 'data-header-surface': '' } : {}),
    ...(drawerTheme?.footerBackground !== undefined ? { 'data-footer-surface': '' } : {}),
  };
  const contentRevision = useRef({ children, revision: 0 });
  if (children !== contentRevision.current.children)
    contentRevision.current = { children, revision: contentRevision.current.revision + 1 };
  useContentTransition(content, `${open}:${contentRevision.current.revision}`, 0, true);
  const owner = useContext(OverlayOwner);
  const [resized, setResized] = useState<number>();
  const stopDragging = useRef<(() => void) | undefined>(undefined);
  const stopSwiping = useRef<(() => void) | undefined>(undefined);
  useEffect(
    () => () => {
      stopDragging.current?.();
      stopSwiping.current?.();
    },
    [],
  );
  useEffect(() => {
    if (!open) stopSwiping.current?.();
    else {
      panel.current?.removeAttribute('data-swiping');
      panel.current?.style.removeProperty('--leaf-drawer-swipe-transform');
    }
  }, [open]);
  const horizontal = placement === 'left' || placement === 'right';
  // biome-ignore lint/correctness/useExhaustiveDependencies: Resizing resets when the configured dimensions change.
  useEffect(() => {
    setResized(undefined);
  }, [width, height]);
  useEffect(() => {
    if (!open || !push || !owner) return;
    const parent = document.getElementById(owner);
    if (!parent) return;
    const previous = parent.style.transform;
    const distance = typeof push === 'number' ? push : 40;
    parent.style.transform = `translate${horizontal ? 'X' : 'Y'}(${placement === 'right' || placement === 'bottom' ? -distance : distance}px)`;
    return () => {
      parent.style.transform = previous;
    };
  }, [open, push, owner, placement, horizontal]);
  const previous = useRef(false);
  useEffect(() => {
    if (previous.current && !present) afterClose?.();
    previous.current = present;
  }, [present, afterClose]);
  useDialog(open, panel, id, () => onClose?.(), keyboard, { initialFocus, returnFocus });
  const visited = useRef(false);
  if (open) visited.current = true;
  if (
    !present &&
    !forceRender &&
    ((preserve === undefined ? destroyOnClose : !preserve) || !visited.current)
  )
    return null;
  return (
    <div
      hidden={!present}
      className={classes('leaf-drawer-mask', `leaf-drawer-mask--${placement}`)}
      style={layer.maskStyle}
      data-blur={maskBlur ? undefined : 'off'}
      data-state={open ? 'open' : 'closing'}
      aria-hidden={!open || undefined}
      {...inertProps(!open)}
    >
      <button
        ref={backdrop}
        type="button"
        tabIndex={-1}
        className="leaf-drawer-backdrop"
        aria-label={messages.common.close}
        onClick={() => {
          if (maskClosable) onClose?.();
        }}
      />
      <div
        {...props}
        ref={panel}
        id={props.id ?? id}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title != null ? `${id}-title` : props['aria-labelledby']}
        aria-describedby={
          [props['aria-describedby'], description != null && `${id}-description`]
            .filter(Boolean)
            .join(' ') || undefined
        }
        tabIndex={-1}
        className={classes(
          'leaf-drawer',
          `leaf-drawer--placement-${placement}`,
          swipeHandleVisible && 'leaf-drawer--swipeable',
          divided && 'leaf-drawer--divided',
          hasHeading && 'leaf-drawer--headed',
          closable && 'leaf-drawer--closable',
          className,
        )}
        {...paddingFlags}
        {...surfaceFlags}
        style={{
          ...(horizontal
            ? { width: resized ?? width, height: '100%' }
            : { height: resized ?? height, width: '100%' }),
          ...layer.popupStyle,
          ...paddingStyle,
          ...style,
        }}
      >
        {resizable && (
          // biome-ignore lint/a11y/useSemanticElements: This is the adjustable ARIA window-splitter handle, not a decorative separator.
          <div
            role="separator"
            tabIndex={0}
            aria-label={messages.drawer.resize}
            aria-orientation={horizontal ? 'vertical' : 'horizontal'}
            aria-valuemin={minSize}
            aria-valuemax={maxSize}
            aria-valuenow={
              resized ??
              (typeof (horizontal ? width : height) === 'number'
                ? Number(horizontal ? width : height)
                : undefined)
            }
            className="leaf-drawer__resize"
            onPointerDown={(event) => {
              if (!panel.current) return;
              stopDragging.current?.();
              event.preventDefault();
              event.currentTarget.setPointerCapture?.(event.pointerId);
              const start = horizontal ? event.clientX : event.clientY;
              const bounds = panel.current.getBoundingClientRect();
              const size = horizontal ? bounds.width : bounds.height;
              const update = (event: PointerEvent) => {
                const next = Math.min(
                  maxSize,
                  Math.max(
                    minSize,
                    size +
                      ((horizontal ? event.clientX : event.clientY) - start) *
                        (placement === 'right' || placement === 'bottom' ? -1 : 1),
                  ),
                );
                setResized(next);
                onResize?.(next);
              };
              const end = () => {
                window.removeEventListener('pointermove', update);
                window.removeEventListener('pointerup', end);
                window.removeEventListener('pointercancel', end);
                stopDragging.current = undefined;
              };
              stopDragging.current = end;
              window.addEventListener('pointermove', update);
              window.addEventListener('pointerup', end, { once: true });
              window.addEventListener('pointercancel', end, { once: true });
            }}
            onKeyDown={(event) => {
              if (!panel.current) return;
              if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
              event.preventDefault();
              const bounds = panel.current.getBoundingClientRect();
              const size = horizontal ? bounds.width : bounds.height;
              const next = Math.min(
                maxSize,
                Math.max(
                  minSize,
                  size +
                    (['ArrowRight', 'ArrowDown'].includes(event.key) ? 10 : -10) *
                      (placement === 'right' || placement === 'bottom' ? -1 : 1),
                ),
              );
              setResized(next);
              onResize?.(next);
            }}
          />
        )}
        {swipeHandleVisible && (
          <div
            className={classes(
              'leaf-drawer__swipe-handle',
              `leaf-drawer__swipe-handle--${placement}`,
            )}
            data-swipe-handle=""
            aria-hidden="true"
            onPointerDown={(event) => {
              if (!panel.current || (event.button !== 0 && event.pointerType === 'mouse')) return;
              stopSwiping.current?.();
              event.preventDefault();
              event.currentTarget.setPointerCapture?.(event.pointerId);
              const node = panel.current;
              const startX = event.clientX;
              const startY = event.clientY;
              const startTime = Date.now();
              const bounds = node.getBoundingClientRect();
              const panelSize = horizontal ? bounds.width : bounds.height;
              let latestOffset = 0;
              const getOffset = (pointerEvent: PointerEvent) => {
                const raw =
                  placement === 'bottom'
                    ? pointerEvent.clientY - startY
                    : placement === 'top'
                      ? startY - pointerEvent.clientY
                      : placement === 'right'
                        ? pointerEvent.clientX - startX
                        : startX - pointerEvent.clientX;
                return Math.max(0, raw);
              };
              const formatTransform = (offset: number) =>
                placement === 'bottom'
                  ? `translateY(${offset}px)`
                  : placement === 'top'
                    ? `translateY(${-offset}px)`
                    : placement === 'right'
                      ? `translateX(${offset}px)`
                      : `translateX(${-offset}px)`;
              node.setAttribute('data-swiping', 'true');
              const update = (moveEvent: PointerEvent) => {
                latestOffset = getOffset(moveEvent);
                node.style.setProperty(
                  '--leaf-drawer-swipe-transform',
                  formatTransform(latestOffset),
                );
              };
              const cleanup = () => {
                window.removeEventListener('pointermove', update);
                window.removeEventListener('pointerup', finish);
                window.removeEventListener('pointercancel', finish);
                stopSwiping.current = undefined;
              };
              const finish = (endEvent?: PointerEvent) => {
                cleanup();
                const finalOffset = endEvent ? getOffset(endEvent) : latestOffset;
                const elapsed = Math.max(1, Date.now() - startTime);
                const threshold = Math.min(120, Math.max(48, panelSize * 0.3));
                const velocity = finalOffset / elapsed;
                const shouldClose =
                  endEvent?.type === 'pointerup' &&
                  (finalOffset >= threshold || (finalOffset > 24 && velocity > 0.4));
                node.removeAttribute('data-swiping');
                if (shouldClose) {
                  onClose?.();
                  if (typeof requestAnimationFrame === 'function') {
                    requestAnimationFrame(() =>
                      node.style.removeProperty('--leaf-drawer-swipe-transform'),
                    );
                  } else {
                    node.style.removeProperty('--leaf-drawer-swipe-transform');
                  }
                  return;
                }
                node.style.removeProperty('--leaf-drawer-swipe-transform');
              };
              stopSwiping.current = () => {
                cleanup();
                node.removeAttribute('data-swiping');
                node.style.removeProperty('--leaf-drawer-swipe-transform');
              };
              window.addEventListener('pointermove', update);
              window.addEventListener('pointerup', finish, { once: true });
              window.addEventListener('pointercancel', finish, { once: true });
            }}
          >
            <span className="leaf-drawer__swipe-bar" />
          </div>
        )}
        <OverlayOwner.Provider value={id}>
          <DrawerInner
            id={id}
            title={title}
            description={description}
            icon={icon}
            extra={extra}
            footer={footer}
            closable={closable}
            onClose={onClose}
            contentRef={content}
            ariaLabel={props['aria-label']}
          >
            {children}
          </DrawerInner>
        </OverlayOwner.Provider>
      </div>
    </div>
  );
}
export function Drawer(rawProps: DrawerProps) {
  const props = useComponentProps('Drawer', rawProps);
  const visited = useRef(false);
  // 首次打开或显式 forceRender 前保留行内锚点并延迟挂载 ScopedPortal，避免提前在 body 占位。
  if (props.open || props.forceRender) visited.current = true;
  if (!visited.current) return <span hidden />;
  return (
    <ScopedPortal container={props.container}>
      <DrawerSurface {...props} />
    </ScopedPortal>
  );
}
