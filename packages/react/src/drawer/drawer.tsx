import { X } from 'lucide-react';
import {
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
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
import { type DialogFocusOptions, useDialog } from '../shared/dialog';
import { inertProps } from '../shared/inert';
import { OverlayOwner } from '../shared/overlay-owner';
import { useContentTransition, usePresence } from '../shared/presence';
import { ScopedPortal } from '../shared/scoped-portal';
import { type TabItem, type TabsProps, useTabsParts } from '../tabs/tabs';

const emptyTabItems: readonly TabItem[] = [];

/** Tabs controls integrated with the drawer; Drawer fixes the line type and top placement. */
export interface DrawerTabsProps extends Omit<TabsProps, 'type' | 'placement' | 'children'> {}

export interface DrawerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'onResize'>,
    DialogFocusOptions {
  open: boolean;
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  divided?: boolean;
  /** Embedded tabs placed below the heading, or replacing it when no title is supplied. */
  tabs?: DrawerTabsProps;
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
  resizable?: boolean;
  minSize?: number;
  maxSize?: number;
  onResize?: (size: number) => void;
}

interface DrawerInnerProps {
  id: string;
  open: boolean;
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  tabs?: DrawerTabsProps;
  extra?: ReactNode;
  footer?: ReactNode;
  closable: boolean;
  onClose?: () => void;
  contentRef: RefObject<HTMLDivElement | null>;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  children?: ReactNode;
}

function DrawerInner({
  id,
  open,
  title,
  description,
  icon,
  tabs,
  extra,
  footer,
  closable,
  onClose,
  contentRef,
  ariaLabel,
  ariaLabelledBy,
  children,
}: DrawerInnerProps) {
  const { messages } = useLeafConfig();
  const hasTabs = Boolean(tabs?.items?.length);
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
  const tabExtra =
    !hasHeading && (extra != null || closable) ? (
      <div className="leaf-dialog-tab-extra leaf-drawer__tab-extra">
        {tabs?.extra}
        {extraNode}
        {closeButton}
      </div>
    ) : (
      tabs?.extra
    );
  const tabLabel = tabs?.['aria-label'] ?? (typeof title === 'string' ? title : ariaLabel);
  const tabLabelledBy =
    tabs?.['aria-labelledby'] ??
    (tabs?.['aria-label'] == null && title != null
      ? `${id}-title`
      : tabs?.['aria-label'] == null
        ? ariaLabelledBy
        : undefined);
  const parts = useTabsParts({
    ...tabs,
    items: tabs?.items ?? emptyTabItems,
    type: 'line',
    placement: 'top',
    size: tabs?.size ?? 'md',
    'aria-label': tabLabel,
    'aria-labelledby': tabLabelledBy,
    extra: tabExtra,
    className: classes(
      'leaf-dialog-tabs',
      hasHeading && 'leaf-dialog-tabs--headed',
      'leaf-drawer__tabs',
      tabs?.className,
    ),
    panelsClassName: 'leaf-dialog-panels',
    visibilityKey: open,
  });

  return (
    <>
      {(hasHeading || (!hasTabs && (extra != null || closable))) && (
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
          {closeButton}
        </div>
      )}
      {parts && <div {...parts.rootProps}>{parts.header}</div>}
      <ScrollbarControl
        className="leaf-drawer__body"
        viewportClassName="leaf-drawer__viewport"
        orientation="vertical"
        role={title != null || ariaLabel ? 'region' : 'presentation'}
        aria-labelledby={title != null ? `${id}-title` : undefined}
        aria-label={title == null ? (ariaLabel ?? tabs?.['aria-label']) : undefined}
      >
        <div ref={contentRef} className="leaf-drawer__content">
          {parts?.panels}
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
  tabs,
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
  resizable = false,
  minSize = 240,
  maxSize = 900,
  onResize,
  children,
  className,
  style,
  ...props
}: DrawerProps) {
  const { messages, maskBlur } = useLeafConfig();
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLButtonElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const present = usePresence(open, backdrop);
  const hasTabs = Boolean(tabs?.items?.length);
  const hasHeading = title != null || description != null || icon != null;
  const contentRevision = useRef({ children, revision: 0 });
  if (children !== contentRevision.current.children)
    contentRevision.current = { children, revision: contentRevision.current.revision + 1 };
  useContentTransition(
    content,
    hasTabs ? String(open) : `${open}:${contentRevision.current.revision}`,
    0,
    true,
  );
  const owner = useContext(OverlayOwner);
  const [resized, setResized] = useState<number>();
  const stopDragging = useRef<(() => void) | undefined>(undefined);
  useEffect(() => () => stopDragging.current?.(), []);
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
          divided && 'leaf-drawer--divided',
          hasTabs && 'leaf-drawer--tabbed',
          hasHeading && 'leaf-drawer--headed',
          className,
        )}
        style={{
          ...(horizontal
            ? { width: resized ?? width, height: '100%' }
            : { height: resized ?? height, width: '100%' }),
          ...style,
        }}
      >
        {resizable && (
          // biome-ignore lint/a11y/useSemanticElements: This is the adjustable ARIA window-splitter handle, not a decorative separator.
          <div
            role="separator"
            tabIndex={0}
            aria-label={messages.tree.expand}
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
              event.currentTarget.setPointerCapture(event.pointerId);
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
        <OverlayOwner.Provider value={id}>
          <DrawerInner
            id={id}
            open={open}
            title={title}
            description={description}
            icon={icon}
            tabs={tabs}
            extra={extra}
            footer={footer}
            closable={closable}
            onClose={onClose}
            contentRef={content}
            ariaLabel={props['aria-label']}
            ariaLabelledBy={props['aria-labelledby']}
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
  return (
    <ScopedPortal container={props.container}>
      <DrawerSurface {...props} />
    </ScopedPortal>
  );
}
