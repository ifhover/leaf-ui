import {
  type AnchorHTMLAttributes,
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useRef,
} from 'react';
import { useLeafConfig } from '../config-provider/context';
import { classes } from '../shared/classes';
import { useMergedRef } from '../shared/field';
import { useControllable } from '../shared/use-controllable';
export interface AppBarProps extends HTMLAttributes<HTMLElement> {
  position?: 'static' | 'sticky' | 'fixed';
  elevation?: boolean;
}
export const AppBar = forwardRef<HTMLElement, AppBarProps>(function AppBar(
  { position = 'static', elevation, className, style, ...props },
  ref,
) {
  return (
    <header
      {...props}
      ref={ref}
      className={classes('leaf-app-bar', elevation && 'leaf-app-bar--elevated', className)}
      style={{ position, top: position === 'static' ? undefined : 0, ...style }}
    />
  );
});
export interface ToolbarProps extends HTMLAttributes<HTMLDivElement> {
  dense?: boolean;
}
export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(function Toolbar(
  { dense, className, onKeyDown, ...props },
  ref,
) {
  const root = useRef<HTMLDivElement>(null);
  const merged = useMergedRef(root, ref);
  const { direction } = useLeafConfig();
  return (
    <div
      role="toolbar"
      {...props}
      ref={merged}
      className={classes('leaf-toolbar', dense && 'leaf-toolbar--dense', className)}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (
          event.defaultPrevented ||
          (event.target as HTMLElement).closest('input,textarea,select,[contenteditable=true]')
        )
          return;
        const items = [
          ...(root.current?.querySelectorAll<HTMLElement>(
            'button:not(:disabled),a[href],[tabindex="0"]',
          ) ?? []),
        ].filter((item) => !item.closest('[inert],[hidden],[aria-disabled="true"]'));
        const index = items.indexOf(event.target as HTMLElement);
        if (index < 0 || !items.length) return;
        let next: number;
        if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = items.length - 1;
        else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft')
          next =
            (index +
              (event.key === (direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight') ? 1 : -1) +
              items.length) %
            items.length;
        else return;
        event.preventDefault();
        items[next]?.focus();
      }}
    />
  );
});
export interface BottomNavigationItem {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  href?: string;
}
export interface BottomNavigationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  items: readonly BottomNavigationItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  showLabels?: boolean;
  linkRender?: (
    item: BottomNavigationItem,
    props: AnchorHTMLAttributes<HTMLAnchorElement>,
  ) => ReactNode;
}
export function BottomNavigation({
  items,
  value,
  defaultValue = '',
  onChange,
  showLabels = true,
  linkRender,
  className,
  ...props
}: BottomNavigationProps) {
  const { direction } = useLeafConfig(),
    root = useRef<HTMLElement>(null);
  const [current, setCurrent] = useControllable(
    value,
    defaultValue || items[0]?.key || '',
    onChange,
  );
  return (
    <nav {...props} ref={root} className={classes('leaf-bottom-navigation', className)}>
      {items.map((item) => {
        const contents = (
          <>
            {item.icon}
            {(showLabels || current === item.key) && <span>{item.label}</span>}
          </>
        );
        const attributes = {
          'data-leaf-navigation': '',
          'aria-label': typeof item.label === 'string' ? item.label : item.key,
          'aria-current': current === item.key ? ('page' as const) : undefined,
          'aria-disabled': item.disabled || undefined,
          tabIndex: item.disabled ? -1 : current === item.key ? 0 : -1,
          onClick: (event: MouseEvent<HTMLElement>) => {
            if (item.disabled) event.preventDefault();
            else setCurrent(item.key);
          },
          onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault();
            const buttons = [
                ...(root.current?.querySelectorAll<HTMLElement>(
                  '[data-leaf-navigation]:not([aria-disabled="true"])',
                ) ?? []),
              ],
              index = buttons.indexOf(event.currentTarget);
            const next =
              event.key === 'Home'
                ? 0
                : event.key === 'End'
                  ? buttons.length - 1
                  : (index +
                      (event.key === 'ArrowRight' ? 1 : -1) * (direction === 'rtl' ? -1 : 1) +
                      buttons.length) %
                    buttons.length;
            buttons[next]?.focus();
          },
        };
        return (
          <span key={item.key} className="leaf-bottom-navigation__item">
            {item.href ? (
              (linkRender?.(item, {
                ...attributes,
                href: item.disabled ? undefined : item.href,
                children: contents,
              }) ?? (
                <a {...attributes} href={item.disabled ? undefined : item.href}>
                  {contents}
                </a>
              ))
            ) : (
              <button {...attributes} type="button" disabled={item.disabled}>
                {contents}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}
