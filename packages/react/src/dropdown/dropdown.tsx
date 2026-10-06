import { Check, ChevronRight, Circle } from 'lucide-react';
import {
  type ButtonHTMLAttributes,
  type CSSProperties,
  cloneElement,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefObject,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  version,
} from 'react';
import { tabbable } from 'tabbable';
import { useLeafConfig } from '../config-provider/context';
import { classes } from '../shared/classes';
import { useMergedRef } from '../shared/field';
import type { PopupOptions } from '../shared/floating';
import { FloatingPanel } from '../shared/floating';
export interface DropdownItem {
  key: string;
  label?: ReactNode;
  icon?: ReactNode;
  type?: 'item' | 'divider' | 'group' | 'checkbox' | 'radio';
  children?: readonly DropdownItem[];
  disabled?: boolean;
  danger?: boolean;
  checked?: boolean;
  group?: string;
  closeOnSelect?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  href?: string;
  target?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
}
export interface DropdownProps extends PopupOptions {
  items: readonly DropdownItem[];
  children: ReactElement<
    ButtonHTMLAttributes<HTMLButtonElement> & { ref?: Ref<HTMLButtonElement> }
  >;
  disabled?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelect?: (key: string) => void;
  placement?: 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';
  popupWidth?: number | string;
  popupMaxWidth?: number | string;
  trigger?: 'click' | 'hover' | 'contextMenu' | readonly ('click' | 'hover' | 'contextMenu')[];
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  itemRender?: (item: DropdownItem) => ReactNode;
}
const flatten = (items: readonly DropdownItem[]): DropdownItem[] =>
  items.flatMap((item) =>
    item.type === 'group'
      ? [{ ...item, children: undefined }, ...flatten(item.children ?? [])]
      : [item],
  );
const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
export function Dropdown({
  items,
  children,
  disabled,
  open: controlled,
  defaultOpen = false,
  onOpenChange,
  onSelect,
  placement = 'bottom-start',
  popupWidth,
  popupMaxWidth = 420,
  trigger: triggerType = 'click',
  mouseEnterDelay = 100,
  mouseLeaveDelay = 150,
  popupPlacement,
  popupClassName,
  popupStyle,
  popupRender,
  getPopupContainer,
  itemRender,
}: DropdownProps) {
  const triggers = Array.isArray(triggerType) ? triggerType : [triggerType];
  const [position, setPosition] = useState<{ x: number; y: number }>();
  const [pointerOpen, setPointerOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const [internal, setInternal] = useState(defaultOpen);
  const [startAtEnd, setStartAtEnd] = useState(false);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const inactive = disabled || children.props.disabled;
  const open = !inactive && (controlled ?? internal);
  const panels = useRef(new Set<HTMLDivElement>());
  const register = useCallback((node: HTMLDivElement | null) => {
    if (node) panels.current.add(node);
  }, []);
  const unregister = useCallback((node: HTMLDivElement) => {
    panels.current.delete(node);
  }, []);
  const childRef = version.startsWith('18.')
    ? (children as typeof children & { ref?: Ref<HTMLButtonElement> }).ref
    : children.props.ref;
  const merged = useMergedRef(trigger, childRef);
  const change = (next: boolean) => {
    if (controlled === undefined) setInternal(next);
    if (next !== open) onOpenChange?.(next);
  };
  const close = (focus = false) => {
    change(false);
    if (focus) trigger.current?.focus();
  };
  const hoverEnter = () => {
    clearTimeout(timer.current);
    if (triggers.includes('hover') && !inactive)
      timer.current = setTimeout(() => {
        setPosition(undefined);
        setPointerOpen(true);
        change(true);
      }, mouseEnterDelay);
  };
  const hoverLeave = () => {
    clearTimeout(timer.current);
    if (triggers.includes('hover')) timer.current = setTimeout(() => close(), mouseLeaveDelay);
  };
  useEffect(() => {
    if (inactive) setInternal(false);
  }, [inactive]);
  useEffect(() => {
    if (!open) return;
    const inside = (target: EventTarget | null) =>
      target instanceof Node &&
      (trigger.current?.contains(target) ||
        [...panels.current].some((panel) => panel.contains(target)));
    const pointer = (event: PointerEvent) => {
      if (!inside(event.target)) close();
    };
    const focus = (event: FocusEvent) => {
      if (!inside(event.target)) close();
    };
    document.addEventListener('pointerdown', pointer);
    document.addEventListener('focusin', focus);
    return () => {
      document.removeEventListener('pointerdown', pointer);
      document.removeEventListener('focusin', focus);
    };
  });
  const choose = (item: DropdownItem, event: MouseEvent<HTMLElement>) => {
    if (item.disabled) return;
    if (item.type === 'checkbox' || item.type === 'radio') {
      const checked = item.type === 'radio' || !(item.checked ?? checks[item.key]);
      setChecks((previous) => {
        const next = { ...previous, [item.key]: checked };
        if (item.type === 'radio') {
          const visit = (entries: readonly DropdownItem[]) => {
            for (const option of entries) {
              if (option.type === 'radio' && option.group === item.group)
                next[option.key] = option.key === item.key;
              if (option.children) visit(option.children);
            }
          };
          visit(items);
        }
        return next;
      });
      item.onCheckedChange?.(checked);
    }
    item.onClick?.(event);
    onSelect?.(item.key);
    if (item.closeOnSelect ?? (item.type !== 'checkbox' && item.type !== 'radio')) close(true);
  };
  const tab = (event: KeyboardEvent) => {
    event.preventDefault();
    const all = tabbable(document.body).filter(
      (element) => ![...panels.current].some((panel) => panel.contains(element)),
    );
    const position = trigger.current ? all.indexOf(trigger.current) : -1;
    close();
    (event.shiftKey ? trigger.current : (all[position + 1] ?? trigger.current))?.focus();
  };
  return (
    <>
      {cloneElement(children, {
        ref: merged,
        type: children.props.type ?? 'button',
        disabled: inactive,
        'aria-haspopup': 'menu',
        'aria-expanded': open,
        'aria-controls': `${id}-root`,
        onClick: (event) => {
          children.props.onClick?.(event);
          if (!event.defaultPrevented && !inactive && triggers.includes('click')) {
            setPosition(undefined);
            setPointerOpen(false);
            setStartAtEnd(false);
            change(!open);
          }
        },
        onPointerEnter: (event) => {
          children.props.onPointerEnter?.(event);
          if (!event.defaultPrevented) hoverEnter();
        },
        onPointerLeave: (event) => {
          children.props.onPointerLeave?.(event);
          if (!event.defaultPrevented) hoverLeave();
        },
        onContextMenu: (event) => {
          children.props.onContextMenu?.(event);
          if (!event.defaultPrevented && !inactive && triggers.includes('contextMenu')) {
            event.preventDefault();
            setPosition({ x: event.clientX, y: event.clientY });
            setPointerOpen(false);
            change(true);
          }
        },
        onKeyDown: (event) => {
          children.props.onKeyDown?.(event);
          if (event.defaultPrevented || inactive) return;
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            setStartAtEnd(event.key === 'ArrowUp');
            setPosition(undefined);
            setPointerOpen(false);
            change(true);
          }
        },
      })}
      <MenuPanel
        items={items}
        open={open}
        trigger={trigger}
        id={`${id}-root`}
        placement={(popupPlacement ?? placement) as PanelProps['placement']}
        position={position}
        pointerOpen={pointerOpen}
        onPointerEnter={() => clearTimeout(timer.current)}
        onPointerLeave={hoverLeave}
        popupClassName={popupClassName}
        popupStyle={popupStyle}
        popupRender={popupRender}
        getPopupContainer={getPopupContainer}
        itemRender={itemRender}
        width={popupWidth}
        maxWidth={popupMaxWidth}
        startAtEnd={startAtEnd}
        register={register}
        unregister={unregister}
        checks={checks}
        choose={choose}
        close={() => close(true)}
        onTab={tab}
      />
    </>
  );
}
interface PanelProps extends PopupOptions {
  items: readonly DropdownItem[];
  open: boolean;
  trigger: RefObject<HTMLElement | null>;
  id: string;
  placement: 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'right-start' | 'left-start';
  width?: number | string;
  maxWidth: number | string;
  startAtEnd?: boolean;
  register: (node: HTMLDivElement | null) => void;
  unregister: (node: HTMLDivElement) => void;
  checks: Record<string, boolean>;
  choose: (item: DropdownItem, event: MouseEvent<HTMLElement>) => void;
  close: () => void;
  onTab: (event: KeyboardEvent) => void;
  position?: { x: number; y: number };
  pointerOpen?: boolean;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
  itemRender?: (item: DropdownItem) => ReactNode;
}
function MenuPanel({
  items,
  open,
  trigger,
  id,
  placement,
  width,
  maxWidth,
  startAtEnd,
  register,
  unregister,
  checks,
  choose,
  close,
  onTab,
  position,
  pointerOpen,
  onPointerEnter,
  onPointerLeave,
  popupClassName,
  popupStyle,
  popupRender,
  getPopupContainer,
  itemRender,
}: PanelProps) {
  const { direction } = useLeafConfig();
  const panel = useRef<HTMLDivElement>(null);
  const submenuTrigger = useRef<HTMLElement | null>(null);
  const rows = flatten(items);
  const enabled = rows.filter(
    (item) => !item.disabled && item.type !== 'group' && item.type !== 'divider',
  );
  const [active, setActive] = useState<string>();
  const [submenu, setSubmenu] = useState<string>();
  const [highlight, setHighlight] = useState<CSSProperties>();
  const current = enabled.some((item) => item.key === active)
    ? active
    : startAtEnd
      ? enabled.at(-1)?.key
      : enabled[0]?.key;
  useBrowserLayoutEffect(() => {
    const node = panel.current;
    if (!open || !node) return;
    const update = () => {
      const row = Array.from(node.querySelectorAll<HTMLElement>('[data-key]')).find(
        (item) => item.dataset.key === current,
      );
      setHighlight(
        row
          ? ({
              '--leaf-menu-highlight-y': `${row.offsetTop}px`,
              '--leaf-menu-highlight-height': `${row.offsetHeight}px`,
            } as CSSProperties)
          : undefined,
      );
    };
    update();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [open, current]);
  useEffect(() => {
    if (!open) {
      setSubmenu(undefined);
      return;
    }
    const node = panel.current;
    register(node);
    const choices = node?.querySelectorAll<HTMLElement>(
      '[data-key]:not(:disabled):not([aria-disabled="true"])',
    );
    const choice = startAtEnd ? choices?.[choices.length - 1] : choices?.[0];
    setActive(choice?.dataset.key);
    if (!pointerOpen) choice?.focus();
    return () => {
      if (node) unregister(node);
    };
  }, [open, startAtEnd, register, unregister, pointerOpen]);
  const focus = (key?: string) => {
    setActive(key);
    if (key)
      Array.from(panel.current?.querySelectorAll<HTMLElement>('[data-key]') ?? [])
        .find((node) => node.dataset.key === key)
        ?.focus();
  };
  const keyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.defaultPrevented) return;
    const index = enabled.findIndex((item) => item.key === current);
    let next: string | undefined;
    if (event.key === 'ArrowDown') next = enabled[(index + 1) % enabled.length]?.key;
    else if (event.key === 'ArrowUp')
      next = enabled[(index - 1 + enabled.length) % enabled.length]?.key;
    else if (event.key === 'Home') next = enabled[0]?.key;
    else if (event.key === 'End') next = enabled.at(-1)?.key;
    else if (
      event.key === 'Escape' ||
      (event.key === (direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft') &&
        (placement === 'right-start' || placement === 'left-start'))
    ) {
      event.preventDefault();
      event.stopPropagation();
      close();
      trigger.current?.focus();
      return;
    } else if (event.key === (direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight')) {
      const item = enabled[index];
      if (item?.children?.length) {
        submenuTrigger.current = event.target as HTMLElement;
        setSubmenu(item.key);
      } else return;
    } else if (event.key === 'Tab') {
      onTab(event);
      return;
    } else if (event.key.length === 1 && /\S/.test(event.key))
      next = [...enabled.slice(index + 1), ...enabled.slice(0, index + 1)].find(
        (item) =>
          typeof item.label === 'string' &&
          item.label.toLocaleLowerCase().startsWith(event.key.toLocaleLowerCase()),
      )?.key;
    else return;
    if (next) {
      setSubmenu(undefined);
      focus(next);
    }
    event.preventDefault();
    event.stopPropagation();
  };
  const child = rows.find((item) => item.key === submenu);
  return (
    <>
      <FloatingPanel
        open={open}
        triggerRef={trigger}
        panelRef={panel}
        id={id}
        placement={placement}
        width={width}
        maxWidth={maxWidth}
        className={classes('leaf-floating', 'leaf-dropdown', popupClassName)}
        position={position}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        style={popupStyle}
        render={popupRender}
        container={getPopupContainer}
        role="menu"
        tabIndex={-1}
        onKeyDown={keyDown}
      >
        <div
          className="leaf-dropdown__highlight"
          aria-hidden="true"
          data-ready={Boolean(highlight)}
          style={highlight}
        />
        {rows.map((item) =>
          item.type === 'divider' ? (
            <hr key={item.key} className="leaf-dropdown__divider" />
          ) : item.type === 'group' ? (
            <div key={item.key} className="leaf-dropdown__group" role="presentation">
              {item.label}
            </div>
          ) : (
            <MenuAction
              item={item}
              key={item.key}
              data-key={item.key}
              role={
                item.type === 'checkbox'
                  ? 'menuitemcheckbox'
                  : item.type === 'radio'
                    ? 'menuitemradio'
                    : 'menuitem'
              }
              aria-checked={
                item.type === 'checkbox' || item.type === 'radio'
                  ? (item.checked ?? Boolean(checks[item.key]))
                  : undefined
              }
              aria-haspopup={item.children?.length ? 'menu' : undefined}
              aria-expanded={item.children?.length ? submenu === item.key : undefined}
              disabled={item.disabled}
              tabIndex={current === item.key ? 0 : -1}
              className={classes('leaf-floating__option', item.danger && 'leaf-dropdown__danger')}
              onFocus={() => setActive(item.key)}
              onPointerEnter={(event) => {
                if (item.disabled) return;
                setActive(item.key);
                if (item.children?.length) {
                  submenuTrigger.current = event.currentTarget;
                  setSubmenu(item.key);
                } else setSubmenu(undefined);
              }}
              onClick={(event) => {
                if (item.children?.length) {
                  submenuTrigger.current = event.currentTarget;
                  setSubmenu((previous) => (previous === item.key ? undefined : item.key));
                } else choose(item, event);
              }}
            >
              {item.type === 'checkbox' ? (
                <Check
                  size={15}
                  className="leaf-dropdown__check"
                  style={{ opacity: (item.checked ?? checks[item.key]) ? 1 : 0 }}
                  aria-hidden="true"
                />
              ) : item.type === 'radio' ? (
                <Circle
                  size={8}
                  className="leaf-dropdown__check"
                  fill="currentColor"
                  style={{ opacity: (item.checked ?? checks[item.key]) ? 1 : 0 }}
                  aria-hidden="true"
                />
              ) : (
                item.icon
              )}
              <span>{itemRender?.(item) ?? item.label}</span>
              {item.children?.length ? (
                <ChevronRight size={14} className="leaf-dropdown__arrow" aria-hidden="true" />
              ) : null}
            </MenuAction>
          ),
        )}
      </FloatingPanel>
      {child?.children && (
        <MenuPanel
          items={child.children}
          open={open && Boolean(submenu)}
          trigger={submenuTrigger}
          id={`${id}-sub`}
          placement={direction === 'rtl' ? 'left-start' : 'right-start'}
          pointerOpen={pointerOpen}
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
          getPopupContainer={getPopupContainer}
          itemRender={itemRender}
          maxWidth={maxWidth}
          register={register}
          unregister={unregister}
          checks={checks}
          choose={choose}
          close={() => setSubmenu(undefined)}
          onTab={onTab}
        />
      )}
    </>
  );
}

function MenuAction({
  item,
  children,
  ...props
}: { item: DropdownItem } & ButtonHTMLAttributes<HTMLButtonElement>) {
  if (item.href && !item.children?.length)
    return (
      <a
        href={item.disabled ? undefined : item.href}
        target={item.target}
        rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
        role={props.role}
        aria-disabled={item.disabled || undefined}
        className={props.className}
        tabIndex={props.tabIndex}
        data-key={item.key}
        onFocus={props.onFocus as never}
        onPointerEnter={props.onPointerEnter as never}
        onClick={(event) => {
          if (item.disabled) event.preventDefault();
          else props.onClick?.(event as never);
        }}
      >
        {children}
      </a>
    );
  return (
    <button {...props} type="button">
      {children}
    </button>
  );
}
