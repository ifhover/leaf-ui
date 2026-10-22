import { type HTMLAttributes, type ReactNode, useRef } from 'react';
import { useComponentProps } from '../config-provider/component-defaults';
import { classes } from '../shared/classes';
import { useContentTransition } from '../shared/presence';
import { SkeletonControl as Skeleton } from '../skeleton/skeleton';
import type { TabsProps } from '../tabs';
import { TabsControl as Tabs } from '../tabs/tabs';
import { CardTitleControl } from './title';

/** Horizontal line tabs integrated with the card heading and content spacing. */
export interface CardTabsProps extends Omit<TabsProps, 'type' | 'placement' | 'children'> {}

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  description?: ReactNode;
  extra?: ReactNode;
  /** Tabs replace the heading when no title is supplied, otherwise sit below it. */
  tabs?: CardTabsProps;
  cover?: ReactNode;
  footer?: ReactNode;
  loading?: boolean;
  bordered?: boolean;
  /** `inset` places the content surface inside a muted canvas. */
  variant?: 'default' | 'inset';
  /** Card spacing, heading typography and height, and the default size of embedded tabs. */
  size?: 'sm' | 'md' | 'lg';
}
export function Card(rawProps: CardProps) {
  const {
    title,
    description,
    extra,
    tabs,
    cover,
    footer,
    loading = false,
    bordered = true,
    variant = 'default',
    size = 'md',
    children,
    className,
    ...props
  } = useComponentProps('Card', rawProps);
  const body = useRef<HTMLDivElement>(null);
  useContentTransition(body, loading ? 'loading' : 'content');
  const hasTabs = Boolean(tabs?.items.length);
  const hasHeading = title != null || description != null;
  const tabExtra =
    !hasHeading && extra != null ? (
      <div className="leaf-card__tab-extra">
        {tabs?.extra}
        {extra}
      </div>
    ) : (
      tabs?.extra
    );
  const content = (
    <>
      {cover != null && <div className="leaf-card__cover">{cover}</div>}
      {hasTabs && tabs && (
        <Tabs
          {...tabs}
          type="line"
          placement="top"
          size={tabs.size ?? size}
          aria-label={tabs['aria-label'] ?? (typeof title === 'string' ? title : undefined)}
          extra={tabExtra}
          className={classes('leaf-card__tabs', tabs.className)}
          items={tabs.items.map((item) => ({
            ...item,
            children: <Skeleton loading={loading}>{item.children}</Skeleton>,
          }))}
          onReorder={
            tabs.onReorder &&
            ((items) => {
              const originals = new Map(tabs.items.map((item) => [item.key, item]));
              tabs.onReorder?.(items.map((item) => originals.get(item.key) ?? item));
            })
          }
        />
      )}
      {(!hasTabs || children != null) && (
        <div className="leaf-card__body" ref={body}>
          <Skeleton loading={loading}>{children}</Skeleton>
        </div>
      )}
      {footer != null && <div className="leaf-card__footer">{footer}</div>}
    </>
  );
  return (
    <div
      {...props}
      aria-busy={loading || undefined}
      className={classes(
        'leaf-card',
        `leaf-card--${size}`,
        bordered && 'leaf-card--bordered',
        variant === 'inset' && 'leaf-card--inset',
        hasHeading && 'leaf-card--headed',
        hasTabs && 'leaf-card--tabbed',
        className,
      )}
    >
      {(hasHeading || (!hasTabs && extra != null)) && (
        <div className="leaf-card__header">
          {(title != null || description != null) && (
            <div className="leaf-card__heading">
              {title != null && (
                <CardTitleControl size={size} className="leaf-card__title">
                  {title}
                </CardTitleControl>
              )}
              {description != null && <div className="leaf-card__description">{description}</div>}
            </div>
          )}
          {extra != null && <div className="leaf-card__extra">{extra}</div>}
        </div>
      )}
      <div className="leaf-card__panel">{content}</div>
    </div>
  );
}
