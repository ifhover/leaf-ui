import { X } from 'lucide-react';
import { type HTMLAttributes, type ReactNode, useEffect, useId, useRef } from 'react';
import { useLeafConfig } from '../config-provider/config-provider';
import { classes } from '../shared/classes';
import { useDialog } from '../shared/dialog';
import { inertAttribute } from '../shared/inert';
import { OverlayOwner } from '../shared/overlay-owner';
import { usePresence } from '../shared/presence';
import { ScopedPortal } from '../shared/scoped-portal';

export interface DrawerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
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
  const previous = useRef(false);
  useEffect(() => {
    if (previous.current && !present) afterClose?.();
    previous.current = present;
  }, [present, afterClose]);
  useDialog(open, panel, id, () => onClose?.(), keyboard);
  if (!present) return null;
  const horizontal = placement === 'left' || placement === 'right';
  return (
    <div
      ref={root}
      className={classes('leaf-drawer-mask', `leaf-drawer-mask--${placement}`)}
      data-state={open ? 'open' : 'closing'}
      aria-hidden={!open || undefined}
      inert={inertAttribute(!open)}
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
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? `${id}-title` : props['aria-labelledby']}
        tabIndex={-1}
        className={classes('leaf-drawer', className)}
        style={{
          ...(horizontal ? { width, height: '100%' } : { height, width: '100%' }),
          ...style,
        }}
      >
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
    <ScopedPortal>
      <DrawerSurface {...props} />
    </ScopedPortal>
  );
}
