import {
  type ButtonHTMLAttributes,
  cloneElement,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  useEffect,
  useId,
  useRef,
  useState,
  version,
} from 'react';
import { classes } from '../shared/classes';
import { useMergedRef } from '../shared/field';
import { FloatingPanel, useFloatingDismiss } from '../shared/floating';

export interface DropdownItem {
  key: string;
  label?: ReactNode;
  icon?: ReactNode;
  type?: 'item' | 'divider';
  disabled?: boolean;
  danger?: boolean;
  onClick?: () => void;
}
export interface DropdownProps {
  items: readonly DropdownItem[];
  children: ReactElement<
    ButtonHTMLAttributes<HTMLButtonElement> & { ref?: Ref<HTMLButtonElement> }
  >;
  disabled?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelect?: (key: string) => void;
}
export function Dropdown({
  items,
  children,
  disabled,
  open: controlled,
  defaultOpen = false,
  onOpenChange,
  onSelect,
}: DropdownProps) {
  const [internal, setInternal] = useState(defaultOpen);
  const inactive = disabled || children.props.disabled;
  const open = (controlled ?? internal) && !inactive;
  const trigger = useRef<HTMLButtonElement>(null);
  const childRef = version.startsWith('18.')
    ? (children as typeof children & { ref?: Ref<HTMLButtonElement> }).ref
    : children.props.ref;
  const mergedRef = useMergedRef(trigger, childRef);
  const panel = useRef<HTMLDivElement>(null);
  const id = `${useId()}-menu`;
  const [active, setActive] = useState(0);
  const enabled = items
    .map((item, index) => (!item.disabled && item.type !== 'divider' ? index : -1))
    .filter((index) => index >= 0);
  const setOpen = (next: boolean) => {
    if (controlled === undefined) setInternal(next);
    if (next !== open) onOpenChange?.(next);
  };
  useFloatingDismiss(open, () => setOpen(false), trigger, panel);
  useEffect(() => {
    if (inactive && internal) setInternal(false);
  }, [inactive, internal]);
  useEffect(() => {
    if (open)
      (
        panel.current?.querySelector<HTMLButtonElement>(
          `[data-index='${active}']:not(:disabled)`,
        ) ?? panel.current
      )?.focus();
  }, [open, active]);
  const choose = (item: DropdownItem) => {
    if (item.disabled || item.type === 'divider') return;
    setOpen(false);
    trigger.current?.focus();
    item.onClick?.();
    onSelect?.(item.key);
  };
  const navigate = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = enabled.indexOf(active);
    let next: number | undefined;
    if (event.key === 'ArrowDown') next = enabled[(index + 1) % enabled.length];
    else if (event.key === 'ArrowUp') next = enabled[(index - 1 + enabled.length) % enabled.length];
    else if (event.key === 'Home') next = enabled[0];
    else if (event.key === 'End') next = enabled.at(-1);
    else if (event.key.length === 1 && /\S/.test(event.key)) {
      const order = [...enabled.slice(index + 1), ...enabled.slice(0, index + 1)];
      next = order.find((i) =>
        panel.current
          ?.querySelector(`[data-index='${i}']`)
          ?.textContent?.trim()
          .toLocaleLowerCase()
          .startsWith(event.key.toLocaleLowerCase()),
      );
    }
    if (next !== undefined) {
      event.preventDefault();
      setActive(next);
    }
  };
  return (
    <>
      {cloneElement(children, {
        ref: mergedRef,
        type: children.props.type ?? 'button',
        disabled: inactive,
        'aria-haspopup': 'menu',
        'aria-expanded': open,
        'aria-controls': id,
        onClick: (event) => {
          children.props.onClick?.(event);
          if (!event.defaultPrevented && !inactive) {
            setActive(enabled[0] ?? 0);
            setOpen(!open);
          }
        },
        onKeyDown: (event) => {
          children.props.onKeyDown?.(event);
          if (event.defaultPrevented || inactive) return;
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            setActive((event.key === 'ArrowUp' ? enabled.at(-1) : enabled[0]) ?? 0);
            setOpen(true);
          }
        },
      })}
      <FloatingPanel
        open={open}
        triggerRef={trigger}
        panelRef={panel}
        id={id}
        role="menu"
        tabIndex={-1}
        aria-label={
          typeof children.props.children === 'string' ? children.props.children : undefined
        }
        className="leaf-floating leaf-dropdown"
        onKeyDown={navigate}
      >
        {items.map((item, index) =>
          item.type === 'divider' ? (
            <hr key={item.key} className="leaf-dropdown__divider" />
          ) : (
            <button
              key={item.key}
              type="button"
              role="menuitem"
              data-index={index}
              tabIndex={active === index ? 0 : -1}
              disabled={item.disabled}
              className={classes('leaf-floating__option', item.danger && 'leaf-dropdown__danger')}
              onFocus={() => setActive(index)}
              onClick={() => choose(item)}
            >
              {item.icon}
              {item.label}
            </button>
          ),
        )}
      </FloatingPanel>
    </>
  );
}
