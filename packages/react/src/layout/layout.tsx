import { forwardRef, type HTMLAttributes, type ReactNode, useEffect, useState } from 'react';
import { Button } from '../button';
import { classes } from '../shared/classes';
import { useControllable } from '../shared/use-controllable';
import { useText } from '../shared/use-text';

export interface LayoutProps extends HTMLAttributes<HTMLDivElement> {
  direction?: 'horizontal' | 'vertical';
}
const LayoutRoot = forwardRef<HTMLDivElement, LayoutProps>(function Layout(
  { direction = 'vertical', className, ...props },
  ref,
) {
  return (
    <div
      {...props}
      ref={ref}
      className={classes('leaf-layout', `leaf-layout--${direction}`, className)}
    />
  );
});
export interface LayoutSiderProps extends HTMLAttributes<HTMLElement> {
  width?: number | string;
  collapsedWidth?: number | string;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  collapsible?: boolean;
  breakpoint?: number;
  onCollapse?: (collapsed: boolean) => void;
  trigger?: ReactNode;
}
export const LayoutSider = forwardRef<HTMLElement, LayoutSiderProps>(function LayoutSider(
  {
    width = 220,
    collapsedWidth = 64,
    collapsed,
    defaultCollapsed = false,
    collapsible = false,
    breakpoint,
    onCollapse,
    trigger,
    className,
    children,
    style,
    ...props
  },
  ref,
) {
  const t = useText();
  const [compact, setCompact] = useControllable(collapsed, defaultCollapsed, onCollapse);
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    if (breakpoint === undefined) return;
    const query = matchMedia(`(max-width: ${breakpoint}px)`);
    const update = () => setNarrow(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, [breakpoint]);
  const folded = compact || narrow;
  return (
    <aside
      {...props}
      ref={ref}
      className={classes('leaf-layout__sider', className)}
      data-collapsed={folded || undefined}
      style={{ width: folded ? collapsedWidth : width, ...style }}
    >
      <div className="leaf-layout__sider-content">{children}</div>
      {collapsible && !narrow && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCompact(!compact)}
          aria-expanded={!folded}
          aria-label={folded ? t('展开侧栏', 'Expand sidebar') : t('收起侧栏', 'Collapse sidebar')}
        >
          {trigger ??
            (folded ? t('展开侧栏', 'Expand sidebar') : t('收起侧栏', 'Collapse sidebar'))}
        </Button>
      )}
    </aside>
  );
});
export const LayoutHeader = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  function LayoutHeader({ className, ...props }, ref) {
    return <header {...props} ref={ref} className={classes('leaf-layout__header', className)} />;
  },
);
export const LayoutContent = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  function LayoutContent({ className, ...props }, ref) {
    return <main {...props} ref={ref} className={classes('leaf-layout__content', className)} />;
  },
);
export const LayoutFooter = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  function LayoutFooter({ className, ...props }, ref) {
    return <footer {...props} ref={ref} className={classes('leaf-layout__footer', className)} />;
  },
);
export const Layout = Object.assign(LayoutRoot, {
  Header: LayoutHeader,
  Sider: LayoutSider,
  Content: LayoutContent,
  Footer: LayoutFooter,
});
