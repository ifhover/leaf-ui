import { X } from 'lucide-react';
import {
  type HTMLAttributes,
  type ReactNode,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { useLeafConfig } from '../config-provider/context';
import { classes } from '../shared/classes';
import { type DialogFocusOptions, useDialog } from '../shared/dialog';
import { inertProps } from '../shared/inert';
import { OverlayOwner } from '../shared/overlay-owner';
import { usePresence } from '../shared/presence';
import { ScopedPortal } from '../shared/scoped-portal';

export interface DrawerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'onResize'>,
    DialogFocusOptions {
  open: boolean;
  title?: ReactNode;
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
function DrawerSurface({
  open,
  title,
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
  const { messages } = useLeafConfig();
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const present = usePresence(open, root);
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
      ref={root}
      hidden={!present}
      className={classes('leaf-drawer-mask', `leaf-drawer-mask--${placement}`)}
      data-state={open ? 'open' : 'closing'}
      aria-hidden={!open || undefined}
      {...inertProps(!open)}
    >
      <button
        type="button"
        tabIndex={-1}
        className="leaf-drawer-backdrop"
        aria-label={messages.close}
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
        aria-labelledby={title ? `${id}-title` : props['aria-labelledby']}
        tabIndex={-1}
        className={classes('leaf-drawer', className)}
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
            aria-label={messages.expand}
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
          {(title || closable || extra) && (
            <div className="leaf-drawer__header">
              {title && <h2 id={`${id}-title`}>{title}</h2>}
              {extra && <div className="leaf-drawer__extra">{extra}</div>}
              {closable && (
                <button
                  type="button"
                  className="leaf-modal__close"
                  aria-label={messages.close}
                  onClick={onClose}
                >
                  <X size={18} aria-hidden="true" />
                </button>
              )}
            </div>
          )}
          <div className="leaf-drawer__body">{children}</div>
          {footer != null && <div className="leaf-drawer__footer">{footer}</div>}
        </OverlayOwner.Provider>
      </div>
    </div>
  );
}
export function Drawer(props: DrawerProps) {
  return (
    <ScopedPortal container={props.container}>
      <DrawerSurface {...props} />
    </ScopedPortal>
  );
}
