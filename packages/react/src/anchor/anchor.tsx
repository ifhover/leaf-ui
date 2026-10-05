import { type HTMLAttributes, type ReactNode, useEffect, useRef, useState } from 'react';
import { classes } from '../shared/classes';
import { useControllable } from '../shared/use-controllable';
export interface AnchorItem {
  key: string;
  title: ReactNode;
  href: string;
  children?: readonly AnchorItem[];
}
export interface AnchorProps extends HTMLAttributes<HTMLElement> {
  items: readonly AnchorItem[];
  container?: () => HTMLElement | Window;
  offset?: number;
  activeKey?: string;
  onActiveChange?: (key: string) => void;
  smooth?: boolean;
}
export function Anchor({
  items,
  container,
  offset = 12,
  activeKey,
  onActiveChange,
  smooth = true,
  className,
  ...props
}: AnchorProps) {
  const [active, setActive] = useControllable(activeKey, '', onActiveChange);
  const callback = useRef(setActive);
  callback.current = setActive;
  useEffect(() => {
    const scroll = container?.() ?? window;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const top = scroll instanceof HTMLElement ? scroll.getBoundingClientRect().top : 0;
        let key = '';
        const visit = (entries: readonly AnchorItem[]) => {
          for (const item of entries) {
            const target = document.getElementById(decodeURIComponent(item.href.replace(/^#/, '')));
            if (target && target.getBoundingClientRect().top - top <= offset + 24) key = item.key;
            if (item.children) visit(item.children);
          }
        };
        visit(items);
        callback.current(key);
      });
    };
    scroll.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    return () => {
      cancelAnimationFrame(frame);
      scroll.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [container, items, offset]);
  const links = (entries: readonly AnchorItem[]) =>
    entries.map((item) => (
      <li key={item.key}>
        <a
          href={item.href}
          aria-current={active === item.key ? 'location' : undefined}
          onClick={(event) => {
            const target = document.getElementById(decodeURIComponent(item.href.replace(/^#/, '')));
            if (!target) return;
            event.preventDefault();
            const scroll = container?.() ?? window;
            const top =
              target.getBoundingClientRect().top -
              (scroll instanceof HTMLElement ? scroll.getBoundingClientRect().top : 0) +
              (scroll instanceof HTMLElement ? scroll.scrollTop : window.scrollY) -
              offset;
            scroll.scrollTo({
              top,
              behavior:
                smooth && !matchMedia('(prefers-reduced-motion: reduce)').matches
                  ? 'smooth'
                  : 'instant',
            });
            setActive(item.key);
          }}
        >
          {item.title}
        </a>
        {item.children && <ul>{links(item.children)}</ul>}
      </li>
    ));
  return (
    <nav
      {...props}
      aria-label={props['aria-label'] ?? 'Contents'}
      className={classes('leaf-anchor', className)}
    >
      <ul>{links(items)}</ul>
    </nav>
  );
}
export interface AffixProps extends HTMLAttributes<HTMLDivElement> {
  offsetTop?: number;
  offsetBottom?: number;
  container?: () => HTMLElement | Window;
  onAffixChange?: (affixed: boolean) => void;
}
export function Affix({
  offsetTop = 0,
  offsetBottom,
  container,
  onAffixChange,
  className,
  style,
  children,
  ...props
}: AffixProps) {
  const placeholder = useRef<HTMLDivElement>(null),
    content = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<React.CSSProperties>();
  const callback = useRef(onAffixChange);
  callback.current = onAffixChange;
  useEffect(() => {
    const scroll = container?.() ?? window;
    let frame = 0,
      was = false;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!placeholder.current || !content.current) return;
        const bounds = placeholder.current.getBoundingClientRect(),
          view =
            scroll instanceof HTMLElement
              ? scroll.getBoundingClientRect()
              : { top: 0, bottom: innerHeight };
        const affixed =
          offsetBottom === undefined
            ? bounds.top < view.top + offsetTop
            : bounds.bottom > view.bottom - offsetBottom;
        setPosition(
          affixed
            ? {
                position: 'fixed',
                top:
                  offsetBottom === undefined
                    ? view.top + offsetTop
                    : view.bottom - offsetBottom - content.current.offsetHeight,
                left: bounds.left,
                width: bounds.width,
                zIndex: 20,
              }
            : undefined,
        );
        if (affixed !== was) {
          was = affixed;
          callback.current?.(affixed);
        }
      });
    };
    scroll.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    const observer = new ResizeObserver(update);
    if (placeholder.current) observer.observe(placeholder.current);
    if (content.current) observer.observe(content.current);
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      scroll.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [container, offsetTop, offsetBottom]);
  return (
    <div
      {...props}
      ref={placeholder}
      className={classes('leaf-affix', className)}
      style={{ ...style, height: position ? content.current?.offsetHeight : style?.height }}
    >
      <div ref={content} style={position}>
        {children}
      </div>
    </div>
  );
}
