import type { OffsetOptions } from '@floating-ui/react-dom';
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
  useRef,
  useState,
  version,
} from 'react';
import { tabbable } from 'tabbable';
import { useButtonGroup } from '../button/group-context';
import { useComponentProps } from '../config-provider/component-defaults';
import { useLeafConfig } from '../config-provider/context';
import { classes } from '../shared/classes';
import { useMergedRef } from '../shared/field';
import type { PopupOptions } from '../shared/floating';
import { FloatingPanel } from '../shared/floating';
import type { ControlSize } from '../shared/types';
export interface DropdownItem {
  key: string;
  label?: ReactNode;
  icon?: ReactNode;
  extra?: ReactNode;
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
  size?: ControlSize;
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
interface NavigationMenu {
  selectedKey?: string;
  title?: ReactNode;
  variant?: 'neutral' | 'raised' | 'primary';
  renderLink?: (item: DropdownItem, link: ReactNode) => ReactNode;
  renderItem?: (item: DropdownItem, content: ReactNode) => ReactNode;
  getItemClassName?: (item: DropdownItem) => string | undefined;
}
interface DropdownControlProps extends DropdownProps {
  navigation?: NavigationMenu;
}
export function DropdownControl({
  items,
  children,
  disabled,
  size = 'md',
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
  navigation,
}: DropdownControlProps) {
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
  const minimumWidth = popupWidth === undefined ? 'min(160px, calc(100vw - 24px))' : undefined;
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
    if (triggers.includes('hover') && !inactive && !open)
      timer.current = setTimeout(() => {
        setPosition(undefined);
        setPointerOpen(true);
        change(true);
      }, mouseEnterDelay);
  };
  const hoverLeave = () => {
    clearTimeout(timer.current);
    if (triggers.includes('hover') && (pointerOpen || !triggers.includes('click')))
      timer.current = setTimeout(() => close(), mouseLeaveDelay);
  };
  const closeRef = useRef(close);
  closeRef.current = close;
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
      if (!inside(event.target)) closeRef.current();
    };
    const focus = (event: FocusEvent) => {
      if (!inside(event.target)) closeRef.current();
    };
    document.addEventListener('pointerdown', pointer);
    document.addEventListener('focusin', focus);
    return () => {
      document.removeEventListener('pointerdown', pointer);
      document.removeEventListener('focusin', focus);
    };
  }, [open]);
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
            setStartAtEnd(false);
            // 仅由悬停展开时，首次点击将其固定而非立即收起
            if (open && pointerOpen) {
              clearTimeout(timer.current);
              setPointerOpen(false);
            } else {
              setPointerOpen(false);
              change(!open);
            }
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
        size={size}
        navigation={navigation}
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
        minWidth={minimumWidth}
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
// 子菜单紧贴父菜单并向内重叠外框内边距与边框厚度，同时顶边与当前触发项平齐（参考 shadcn）。
const SUBMENU_OFFSET: OffsetOptions = { mainAxis: 0, alignmentAxis: 0 };

interface PanelProps extends PopupOptions {
  size: ControlSize;
  navigation?: NavigationMenu;
  items: readonly DropdownItem[];
  open: boolean;
  trigger: RefObject<HTMLElement | null>;
  id: string;
  placement: 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'right-start' | 'left-start';
  popupOffset?: OffsetOptions;
  width?: number | string;
  minWidth?: CSSProperties['minWidth'];
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
  size,
  navigation,
  items,
  open,
  trigger,
  id,
  placement,
  popupOffset,
  width,
  minWidth,
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
  const submenuTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const submenuHover = useRef<string | undefined>(undefined);
  useEffect(() => () => clearTimeout(submenuTimer.current), []);
  const rows = flatten(items);
  const enabled = rows.filter(
    (item) => !item.disabled && item.type !== 'group' && item.type !== 'divider',
  );
  const [active, setActive] = useState<string>();
  const [submenu, setSubmenu] = useState<string>();
  const current = enabled.some((item) => item.key === active)
    ? active
    : startAtEnd
      ? enabled.at(-1)?.key
      : enabled[0]?.key;
  useEffect(() => {
    if (!open) {
      clearTimeout(submenuTimer.current);
      submenuHover.current = undefined;
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
        clearTimeout(submenuTimer.current);
        submenuHover.current = undefined;
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
      clearTimeout(submenuTimer.current);
      submenuHover.current = undefined;
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
        sideFallback={
          Boolean(navigation) || placement === 'right-start' || placement === 'left-start'
        }
        resetSurfaceGeometry
        open={open}
        triggerRef={trigger}
        panelRef={panel}
        id={id}
        placement={placement}
        popupOffset={popupOffset}
        width={width}
        minWidth={minWidth}
        maxWidth={maxWidth}
        className={classes(
          'leaf-floating',
          'leaf-dropdown',
          !navigation && `leaf-dropdown--${size}`,
          navigation && 'leaf-menu__popup',
          navigation && `leaf-menu__popup--${navigation.variant ?? 'neutral'}`,
          popupClassName,
        )}
        position={position}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        style={popupStyle}
        render={popupRender}
        container={getPopupContainer}
        role="menu"
        aria-label={typeof navigation?.title === 'string' ? navigation.title : undefined}
        tabIndex={-1}
        onKeyDown={keyDown}
      >
        {navigation?.title && <div className="leaf-menu__popup-title">{navigation.title}</div>}
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
              navigation={navigation}
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
              aria-current={
                navigation && !item.children?.length && item.key === navigation.selectedKey
                  ? 'page'
                  : undefined
              }
              aria-expanded={item.children?.length ? submenu === item.key : undefined}
              disabled={item.disabled}
              tabIndex={current === item.key ? 0 : -1}
              className={classes(
                'leaf-floating__option',
                item.danger && 'leaf-dropdown__danger',
                navigation?.getItemClassName?.(item),
              )}
              onFocus={() => setActive(item.key)}
              onPointerEnter={(event) => {
                if (item.disabled) return;
                setActive(item.key);
                clearTimeout(submenuTimer.current);
                if (item.children?.length) {
                  submenuTrigger.current = event.currentTarget;
                  submenuHover.current = item.key;
                  if (!submenu || submenu === item.key) {
                    setSubmenu(item.key);
                  } else {
                    const target = event.currentTarget;
                    submenuTimer.current = setTimeout(() => {
                      submenuTrigger.current = target;
                      submenuHover.current = item.key;
                      setSubmenu(item.key);
                    }, 120);
                  }
                } else if (submenu) {
                  // 指针斜向滑向子菜单途中短暂经过兄弟项时不立刻收起子菜单
                  submenuTimer.current = setTimeout(() => {
                    submenuHover.current = undefined;
                    setSubmenu(undefined);
                  }, 120);
                }
              }}
              onClick={(event) => {
                clearTimeout(submenuTimer.current);
                if (item.children?.length) {
                  submenuTrigger.current = event.currentTarget;
                  if (submenu === item.key && submenuHover.current === item.key) {
                    submenuHover.current = undefined;
                    return;
                  }
                  submenuHover.current = undefined;
                  setSubmenu((previous) => (previous === item.key ? undefined : item.key));
                } else choose(item, event);
              }}
            >
              {(() => {
                const defaultContent = (
                  <>
                    {item.type === 'checkbox' ? (
                      <Check
                        size={13}
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
                    ) : navigation && item.icon ? (
                      <span className="leaf-menu__popup-icon" aria-hidden="true">
                        {item.icon}
                      </span>
                    ) : (
                      item.icon
                    )}
                    <span
                      className={classes(
                        'leaf-dropdown__label',
                        navigation && 'leaf-menu__popup-label',
                      )}
                    >
                      {itemRender?.(item) ?? item.label}
                    </span>
                    {item.extra != null && (
                      <>
                        {' '}
                        <span className="leaf-dropdown__extra">{item.extra}</span>
                      </>
                    )}
                    {item.children?.length ? (
                      <ChevronRight size={13} className="leaf-dropdown__arrow" aria-hidden="true" />
                    ) : null}
                  </>
                );
                return navigation?.renderItem
                  ? navigation.renderItem(item, defaultContent)
                  : defaultContent;
              })()}
            </MenuAction>
          ),
        )}
      </FloatingPanel>
      {child?.children && (
        <MenuPanel
          size={size}
          navigation={
            navigation
              ? {
                  selectedKey: navigation.selectedKey,
                  variant: navigation.variant,
                  renderLink: navigation.renderLink,
                  renderItem: navigation.renderItem,
                  getItemClassName: navigation.getItemClassName,
                }
              : undefined
          }
          items={child.children}
          open={open && Boolean(submenu)}
          trigger={submenuTrigger}
          id={`${id}-sub`}
          placement={direction === 'rtl' ? 'left-start' : 'right-start'}
          popupOffset={navigation ? undefined : SUBMENU_OFFSET}
          pointerOpen={pointerOpen}
          onPointerEnter={() => {
            clearTimeout(submenuTimer.current);
            onPointerEnter?.();
          }}
          onPointerLeave={onPointerLeave}
          getPopupContainer={getPopupContainer}
          itemRender={itemRender}
          maxWidth={maxWidth}
          width={navigation ? width : undefined}
          minWidth={minWidth}
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
  navigation,
  children,
  ...props
}: { item: DropdownItem; navigation?: NavigationMenu } & ButtonHTMLAttributes<HTMLButtonElement>) {
  if (item.href && !item.children?.length) {
    const link = (
      <a
        href={item.disabled ? undefined : item.href}
        target={item.target}
        rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
        role={props.role}
        aria-disabled={item.disabled || undefined}
        aria-current={props['aria-current']}
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
    return navigation?.renderLink ? navigation.renderLink(item, link) : link;
  }
  return (
    <button {...props} type="button">
      {children}
    </button>
  );
}

export function Dropdown(rawProps: DropdownProps) {
  const group = useButtonGroup();
  const configProps = useComponentProps('Dropdown', rawProps);
  const size = rawProps.size ?? group?.size ?? configProps.size;
  const disabled = group?.disabled ? true : (rawProps.disabled ?? configProps.disabled);
  const props: DropdownProps = {
    ...configProps,
    ...(size !== undefined ? { size } : undefined),
    ...(disabled !== undefined ? { disabled } : undefined),
  };
  return <DropdownControl {...props} />;
}
