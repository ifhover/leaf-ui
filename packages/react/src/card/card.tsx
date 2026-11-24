import { type HTMLAttributes, type ReactNode, useId, useMemo, useRef } from 'react';
import { useComponentProps } from '../config-provider/component-defaults';
import { classes } from '../shared/classes';
import { resolvePaddingVars } from '../shared/padding';
import { useContentTransition } from '../shared/presence';
import type { ContainerPadding } from '../shared/types';
import { SkeletonControl as Skeleton } from '../skeleton/skeleton';
import type { TabsProps } from '../tabs';
import { TabsControl as Tabs } from '../tabs/tabs';
import { CardTitleControl } from './title';

/** Tabs controls integrated with the card; Card fixes the line type and top placement. */
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
  /** Show the card's resting shadow; layered cards apply this to the inner content surface. */
  shadow?: boolean;
  /** Visual selection only; use explicit buttons or selection controls for interaction. */
  selected?: boolean;
  /** `layered` separates the content surface from the heading and footer on a muted canvas. */
  variant?: 'default' | 'layered';
  /** Card spacing, heading typography and height, and the default size of embedded tabs. */
  size?: 'sm' | 'md' | 'lg';
  /** Customize inner padding for the card or individual header/body/footer regions. */
  padding?: ContainerPadding;
}
interface CardControlProps extends CardProps {
  titleId?: string;
}

export function CardControl({
  title,
  description,
  extra,
  tabs,
  cover,
  footer,
  loading = false,
  bordered = true,
  shadow = true,
  selected = false,
  variant = 'default',
  size = 'md',
  padding,
  titleId: customTitleId,
  children,
  className,
  style,
  ...props
}: CardControlProps) {
  const paddingStyle = resolvePaddingVars('card', padding);
  const generatedTitleId = useId();
  const titleId = customTitleId ?? generatedTitleId;
  const body = useRef<HTMLDivElement>(null);
  // Skeleton 内部已负责内容显露动效，此处仅保留高度过渡避免叠加。
  useContentTransition(body, loading ? 'loading' : 'content', 0, true);
  const rawTabItems = tabs?.items;
  const hasTabs = Boolean(rawTabItems?.length);
  const hasTabPanels = Boolean(rawTabItems?.some((item) => item.children != null));
  const layered = variant === 'layered';
  const visibleDescription = layered ? undefined : description;
  const hasHeading = title != null || visibleDescription != null;
  // 封面或无面板标签栏可直接搭配 Card children，仅在无标签面板且 loading 时保留空 body 骨架占位。
  const hasBody = children != null || (!hasTabPanels && loading) || (!hasTabs && cover == null);
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
  const tabItems = useMemo(() => {
    if (!rawTabItems?.length) return undefined;
    if (!hasTabPanels) return rawTabItems;
    return rawTabItems.map((item) => ({
      ...item,
      children:
        item.children != null ? (
          <Skeleton loading={loading}>{item.children}</Skeleton>
        ) : (
          item.children
        ),
    }));
  }, [rawTabItems, hasTabPanels, loading]);
  const tabLabel = tabs?.['aria-label'] ?? (typeof title === 'string' ? title : undefined);
  const tabLabelledBy =
    tabs?.['aria-labelledby'] ??
    (tabs?.['aria-label'] == null && title != null ? titleId : undefined);
  const content = (
    <>
      {cover != null && <div className="leaf-card__cover">{cover}</div>}
      {hasTabs && tabs && tabItems && (
        <Tabs
          {...tabs}
          type="line"
          placement="top"
          size={tabs.size ?? size}
          aria-label={tabLabel}
          aria-labelledby={tabLabelledBy}
          extra={tabExtra}
          className={classes('leaf-card__tabs', tabs.className)}
          items={tabItems}
          onReorder={
            tabs.onReorder &&
            (hasTabPanels
              ? (items) => {
                  const originals = new Map(tabs.items.map((item) => [item.key, item]));
                  tabs.onReorder?.(items.map((item) => originals.get(item.key) ?? item));
                }
              : tabs.onReorder)
          }
        />
      )}
      {hasBody && (
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
        !shadow && 'leaf-card--shadowless',
        selected && 'leaf-card--selected',
        layered && 'leaf-card--layered',
        hasHeading && 'leaf-card--headed',
        hasTabs && 'leaf-card--tabbed',
        className,
      )}
      style={paddingStyle || style ? { ...paddingStyle, ...style } : undefined}
    >
      {(hasHeading || (!hasTabs && extra != null)) && (
        <div className="leaf-card__header">
          {hasHeading && (
            <div className="leaf-card__heading">
              {title != null && (
                <CardTitleControl id={titleId} size={size} className="leaf-card__title">
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

export function Card(rawProps: CardProps) {
  const props = useComponentProps('Card', rawProps);
  return <CardControl {...props} />;
}
