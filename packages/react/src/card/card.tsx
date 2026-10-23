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
  /** Supporting text for the default appearance; not displayed by layered cards. */
  description?: ReactNode;
  extra?: ReactNode;
  /** Tabs replace the heading when no title is supplied, otherwise sit below it. */
  tabs?: CardTabsProps;
  cover?: ReactNode;
  footer?: ReactNode;
  loading?: boolean;
  bordered?: boolean;
  /** Visual selection only; use explicit buttons or selection controls for interaction. */
  selected?: boolean;
  /** `layered` separates the content surface from the heading and footer on a muted canvas. */
  variant?: 'default' | 'layered';
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
    selected = false,
    variant = 'default',
    size = 'md',
    children,
    className,
    ...props
  } = useComponentProps('Card', rawProps);
  const body = useRef<HTMLDivElement>(null);
  useContentTransition(body, loading ? 'loading' : 'content');
  const hasTabs = Boolean(tabs?.items.length);
  const layered = variant === 'layered';
  const visibleDescription = layered ? undefined : description;
  const hasHeading = title != null || visibleDescription != null;
  const footerContent = footer != null && <div className="leaf-card__footer">{footer}</div>;
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
      {!layered && footerContent}
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
        selected && 'leaf-card--selected',
        layered && 'leaf-card--layered',
        hasHeading && 'leaf-card--headed',
        hasTabs && 'leaf-card--tabbed',
        className,
      )}
    >
      {(hasHeading || (!hasTabs && extra != null)) && (
        <div className="leaf-card__header">
          {hasHeading && (
            <div className="leaf-card__heading">
              {title != null && (
                <CardTitleControl size={size} className="leaf-card__title">
                  {title}
                </CardTitleControl>
              )}
              {visibleDescription != null && (
                <div className="leaf-card__description">{visibleDescription}</div>
              )}
            </div>
          )}
          {extra != null && <div className="leaf-card__extra">{extra}</div>}
        </div>
      )}
      <div className="leaf-card__panel">{content}</div>
      {layered && footerContent}
    </div>
  );
}
