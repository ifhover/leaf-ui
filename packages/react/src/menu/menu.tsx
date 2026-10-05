import { ChevronDown } from 'lucide-react';
import { type HTMLAttributes, type ReactNode, useId, useRef, useState } from 'react';
import { Dropdown, type DropdownItem } from '../dropdown';
import { classes } from '../shared/classes';
import { useControllable } from '../shared/use-controllable';
import { useText } from '../shared/use-text';
export interface MenuItem {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  href?: string;
  disabled?: boolean;
  danger?: boolean;
  children?: readonly MenuItem[];
  type?: 'item' | 'group' | 'divider';
}
export interface MenuProps extends Omit<HTMLAttributes<HTMLElement>, 'onSelect'> {
  items: readonly MenuItem[];
  mode?: 'vertical' | 'horizontal' | 'inline';
  selectedKey?: string;
  defaultSelectedKey?: string;
  onSelect?: (key: string, item: MenuItem) => void;
  openKeys?: readonly string[];
  defaultOpenKeys?: readonly string[];
  onOpenChange?: (keys: string[]) => void;
  collapsed?: boolean;
}
export function Menu({
  items,
  mode = 'vertical',
  selectedKey,
  defaultSelectedKey = '',
  onSelect,
  openKeys,
  defaultOpenKeys = [],
  onOpenChange,
  collapsed = false,
  className,
  ...props
}: MenuProps) {
  const t = useText();
  const id = useId();
  const root = useRef<HTMLElement>(null);
  const [selected, setSelected] = useControllable(selectedKey, defaultSelectedKey);
  const [active, setActive] = useState<string | undefined>(undefined);
  const [opened, setOpened] = useControllable<readonly string[]>(
    openKeys,
    defaultOpenKeys,
    (keys) => onOpenChange?.([...keys]),
  );
  const toggle = (key: string) =>
    setOpened(opened.includes(key) ? opened.filter((value) => value !== key) : [...opened, key]);
  const hasSelected = (item: MenuItem): boolean =>
    item.key === selected || Boolean(item.children?.some(hasSelected));
  const visibleItems: MenuItem[] = [];
  const collect = (entries: readonly MenuItem[]) => {
    for (const item of entries) {
      if (item.type === 'group') collect(item.children ?? []);
      else if (item.type !== 'divider') {
        if (!item.disabled) visibleItems.push(item);
        if (opened.includes(item.key) && mode !== 'horizontal' && !collapsed)
          collect(item.children ?? []);
      }
    }
  };
  collect(items);
  const focusKey = visibleItems.some((item) => item.key === active)
    ? active
    : (visibleItems.find((item) => item.key === selected)?.key ?? visibleItems[0]?.key);
  const convert = (entries: readonly MenuItem[]): DropdownItem[] =>
    entries.map((item) => ({
      ...item,
      children: item.children ? convert(item.children) : undefined,
      onClick: () => {
        if (!item.children?.length) {
          setSelected(item.key);
          onSelect?.(item.key, item);
        }
      },
    }));
  const renderItems = (entries: readonly MenuItem[], depth: number): ReactNode =>
    entries.map((item) => {
      if (item.type === 'divider') return <hr className="leaf-menu__divider" key={item.key} />;
      if (item.type === 'group')
        return (
          <fieldset
            aria-label={typeof item.label === 'string' ? item.label : undefined}
            key={item.key}
            className="leaf-menu__group"
          >
            <legend className="leaf-menu__group-label">{item.label}</legend>
            {renderItems(item.children ?? [], depth)}
          </fieldset>
        );
      const expanded = opened.includes(item.key);
      const hasChildren = Boolean(item.children?.length);
      const content = (
        <>
          {item.icon && (
            <span className="leaf-menu__icon" aria-hidden="true">
              {item.icon}
            </span>
          )}
          {!item.icon && collapsed && (
            <span className="leaf-menu__icon" aria-hidden="true">
              {typeof item.label === 'string' ? item.label.slice(0, 1) : '·'}
            </span>
          )}
          <span className="leaf-menu__label">{item.label}</span>
          {hasChildren && <ChevronDown className="leaf-menu__arrow" size={14} aria-hidden="true" />}
        </>
      );
      const common = {
        role: 'menuitem',
        'aria-current': selected === item.key ? ('page' as const) : undefined,
        'aria-disabled': item.disabled || undefined,
        'aria-expanded': hasChildren ? expanded : undefined,
        'aria-controls': hasChildren ? `${id}-${item.key}` : undefined,
        'data-selected': selected === item.key || undefined,
        'data-active-parent': (hasChildren && hasSelected(item)) || undefined,
        'data-danger': item.danger || undefined,
        className: 'leaf-menu__item',
        tabIndex: !item.disabled && focusKey === item.key ? 0 : -1,
        'data-menu-key': item.key,
        'aria-label': collapsed && typeof item.label === 'string' ? item.label : undefined,
        onFocus: () => setActive(item.key),
        title: collapsed && typeof item.label === 'string' ? item.label : undefined,
        style: { paddingInlineStart: 12 + depth * 16 },
      };
      const activate = () => {
        if (item.disabled) return;
        if (hasChildren) toggle(item.key);
        else {
          setSelected(item.key);
          onSelect?.(item.key, item);
        }
      };
      if (hasChildren && (mode === 'horizontal' || collapsed))
        return (
          <div key={item.key} className="leaf-menu__entry">
            <Dropdown
              items={convert(item.children ?? [])}
              open={expanded}
              disabled={item.disabled}
              onOpenChange={(next) => setOpened(next ? [item.key] : [])}
            >
              <button {...common} type="button">
                {content}
              </button>
            </Dropdown>
          </div>
        );
      return (
        <div key={item.key} className="leaf-menu__entry">
          {item.href && !hasChildren ? (
            <a
              {...common}
              href={item.disabled ? undefined : item.href}
              onClick={(event) => {
                if (item.disabled) event.preventDefault();
                else activate();
              }}
            >
              {content}
            </a>
          ) : (
            <button {...common} type="button" disabled={item.disabled} onClick={activate}>
              {content}
            </button>
          )}
          {hasChildren && expanded && (
            <div
              id={`${id}-${item.key}`}
              role="menu"
              className="leaf-menu__submenu"
              aria-label={typeof item.label === 'string' ? item.label : undefined}
            >
              {renderItems(item.children ?? [], depth + 1)}
            </div>
          )}
        </div>
      );
    });
  return (
    <nav
      {...props}
      ref={root}
      className={classes(
        'leaf-menu',
        `leaf-menu--${mode}`,
        collapsed && 'leaf-menu--collapsed',
        className,
      )}
      aria-label={props['aria-label'] ?? t('导航菜单', 'Navigation menu')}
    >
      {/* biome-ignore lint/a11y/noStaticElementInteractions: This container delegates arrow navigation for the menu or menubar role. */}
      <div
        role={mode === 'horizontal' ? 'menubar' : 'menu'}
        onKeyDown={(event) => {
          if (event.defaultPrevented) return;
          if (
            !['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End', 'Escape'].includes(
              event.key,
            )
          )
            return;
          const target = event.target as HTMLElement;
          if (event.key === 'Escape') {
            setOpened([]);
            root.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
            return;
          }
          const choices = [
            ...(root.current?.querySelectorAll<HTMLElement>(
              '[role="menuitem"]:not([aria-disabled="true"])',
            ) ?? []),
          ];
          const position = choices.indexOf(target.closest('[role="menuitem"]') as HTMLElement);
          const key = choices[position]?.dataset.menuKey;
          const item = visibleItems.find((entry) => entry.key === key);
          const focusItem = (nextKey: string) => {
            setActive(nextKey);
            queueMicrotask(() => {
              const node = [
                ...(root.current?.querySelectorAll<HTMLElement>('[data-menu-key]') ?? []),
              ].find((entry) => entry.dataset.menuKey === nextKey);
              node?.focus();
            });
          };
          if (mode !== 'horizontal' && !collapsed && item) {
            if (event.key === 'ArrowRight') {
              event.preventDefault();
              if (item.children?.length) {
                if (!opened.includes(item.key)) setOpened([...opened, item.key]);
                else {
                  const child = item.children.find(
                    (entry) => !entry.disabled && entry.type !== 'divider',
                  );
                  if (child) focusItem(child.key);
                }
              }
              return;
            }
            if (event.key === 'ArrowLeft') {
              event.preventDefault();
              if (opened.includes(item.key)) toggle(item.key);
              else {
                const parentOf = (entries: readonly MenuItem[]): MenuItem | undefined => {
                  for (const entry of entries) {
                    if (entry.children?.some((child) => child.key === item.key)) return entry;
                    const parent = parentOf(entry.children ?? []);
                    if (parent) return parent;
                  }
                  return undefined;
                };
                const parent = parentOf(items);
                if (parent && parent.type !== 'group') focusItem(parent.key);
              }
              return;
            }
          }
          if (mode === 'horizontal' && event.key === 'ArrowDown' && item?.children?.length) {
            event.preventDefault();
            setOpened([item.key]);
            return;
          }
          const next =
            event.key === 'Home'
              ? 0
              : event.key === 'End'
                ? choices.length - 1
                : (position +
                    (event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? -1 : 1) +
                    choices.length) %
                  choices.length;
          event.preventDefault();
          const nextKey = choices[next]?.dataset.menuKey;
          if (nextKey) setActive(nextKey);
          choices[next]?.focus();
        }}
      >
        {renderItems(items, 0)}
      </div>
    </nav>
  );
}
