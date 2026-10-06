import {
  Children,
  cloneElement,
  type HTMLAttributes,
  isValidElement,
  type ReactNode,
  useRef,
} from 'react';
import { useLeafConfig } from '../config-provider/context';
import { Loading } from '../loading';
import { Result } from '../result';
import { classes } from '../shared/classes';
import { useListMotion } from '../shared/motion';
export interface ListProps<T = unknown> extends Omit<HTMLAttributes<HTMLUListElement>, 'children'> {
  items?: readonly T[];
  renderItem?: (item: T, index: number) => ReactNode;
  itemKey?: (item: T, index: number) => string | number;
  children?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  divider?: boolean;
  loading?: boolean;
  emptyContent?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}
export function List<T>({
  items,
  renderItem,
  itemKey,
  children,
  header,
  footer,
  divider = false,
  loading,
  emptyContent,
  size = 'md',
  className,
  ...props
}: ListProps<T>) {
  const { messages } = useLeafConfig();
  const root = useRef<HTMLUListElement>(null);
  const rows =
    items && renderItem
      ? items.map((item, index) => {
          const content = renderItem(item, index);
          const key =
            itemKey?.(item, index) ??
            (isValidElement(content) ? content.key : null) ??
            `row-${index}`;
          return { content, key };
        })
      : undefined;
  useListMotion(
    root,
    JSON.stringify(
      rows?.map((row) => row.key) ??
        Children.toArray(children).map((child, index) =>
          isValidElement(child) ? child.key : index,
        ),
    ),
    ':scope > li',
  );
  return (
    <div
      className={classes(
        'leaf-list',
        `leaf-list--${size}`,
        divider && 'leaf-list--divider',
        className,
      )}
    >
      {header && <div className="leaf-list__header">{header}</div>}
      <ul {...props} ref={root} aria-busy={loading || undefined}>
        {rows
          ? rows.map(({ content, key }) => {
              if (isValidElement<ListItemProps>(content) && content.type === ListItem)
                return cloneElement(content, {
                  key,
                  as: 'li',
                  ...{ 'data-motion-key': String(key) },
                });
              return (
                <li key={key} className="leaf-list__row" data-motion-key={key}>
                  {content}
                </li>
              );
            })
          : children}
      </ul>
      {loading && <Loading aria-label={messages.loading} />}
      {!loading &&
        items?.length === 0 &&
        (emptyContent ?? <Result size="sm" icon={null} title={messages.noData} />)}
      {footer && <div className="leaf-list__footer">{footer}</div>}
    </div>
  );
}
export interface ListItemProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode;
  description?: ReactNode;
  avatar?: ReactNode;
  extra?: ReactNode;
  actions?: readonly ReactNode[];
  as?: 'li' | 'div';
}
export function ListItem({
  title,
  description,
  avatar,
  extra,
  actions,
  as: Element = 'li',
  children,
  className,
  ...props
}: ListItemProps) {
  return (
    <Element
      {...props}
      className={classes('leaf-list-item', className)}
      data-interactive={props.onClick ? '' : undefined}
    >
      {avatar && <div className="leaf-list-item__avatar">{avatar}</div>}
      <div className="leaf-list-item__main">
        {title && <div className="leaf-list-item__title">{title}</div>}
        {description && <div className="leaf-list-item__description">{description}</div>}
        {children}
        {actions && (
          <div className="leaf-list-item__actions">
            {Children.toArray(actions).map((action) => (
              <span key={isValidElement(action) ? action.key : String(action)}>{action}</span>
            ))}
          </div>
        )}
      </div>
      {extra && <div className="leaf-list-item__extra">{extra}</div>}
    </Element>
  );
}
