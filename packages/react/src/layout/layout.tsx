import { forwardRef, type HTMLAttributes, type ReactNode, useEffect, useState } from 'react';
import { ButtonControl } from '../button/button';
import { useComponentProps } from '../config-provider/component-defaults';
import { ScrollbarControl } from '../scrollbar/scrollbar';
import { classes } from '../shared/classes';
import { useControllable } from '../shared/use-controllable';
import { useText } from '../shared/use-text';

export interface LayoutProps extends HTMLAttributes<HTMLDivElement> {
  direction?: 'horizontal' | 'vertical';
}
const LayoutRoot = forwardRef<HTMLDivElement, LayoutProps>(function Layout(rawProps, ref) {
  const { direction = 'vertical', className, ...props } = useComponentProps('Layout', rawProps);
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
  rawProps: LayoutSiderProps,
  ref,
) {
  const {
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
  } = useComponentProps('LayoutSider', rawProps);
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
      <ScrollbarControl className="leaf-layout__sider-content" role="presentation" tabIndex={-1}>
        {children}
      </ScrollbarControl>
      {collapsible && !narrow && (
        <ButtonControl
          variant="ghost"
          size="sm"
          onClick={() => setCompact(!compact)}
          aria-expanded={!folded}
          aria-label={folded ? t('layout.expandSidebar') : t('layout.collapseSidebar')}
        >
          {trigger ?? (folded ? t('layout.expandSidebar') : t('layout.collapseSidebar'))}
        </ButtonControl>
      )}
    </aside>
  );
});
export const LayoutHeader = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  function LayoutHeader(rawProps: HTMLAttributes<HTMLElement>, ref) {
    const { className, ...props } = useComponentProps('LayoutHeader', rawProps);
    return <header {...props} ref={ref} className={classes('leaf-layout__header', className)} />;
  },
);
export const LayoutContent = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  function LayoutContent(rawProps: HTMLAttributes<HTMLElement>, ref) {
    const { className, ...props } = useComponentProps('LayoutContent', rawProps);
    return <main {...props} ref={ref} className={classes('leaf-layout__content', className)} />;
  },
);
export const LayoutFooter = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  function LayoutFooter(rawProps: HTMLAttributes<HTMLElement>, ref) {
    const { className, ...props } = useComponentProps('LayoutFooter', rawProps);
    return <footer {...props} ref={ref} className={classes('leaf-layout__footer', className)} />;
  },
);
export const Layout = Object.assign(LayoutRoot, {
  Header: LayoutHeader,
  Sider: LayoutSider,
  Content: LayoutContent,
  Footer: LayoutFooter,
});
