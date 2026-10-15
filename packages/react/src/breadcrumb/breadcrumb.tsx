import { ChevronRight, Ellipsis } from 'lucide-react';
import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { ButtonControl } from '../button/button';
import { useComponentProps } from '../config-provider/component-defaults';
import { useLeafConfig } from '../config-provider/context';
import type { DropdownItem } from '../dropdown';
import { DropdownControl as Dropdown } from '../dropdown/dropdown';
import { classes } from '../shared/classes';

export interface BreadcrumbItem
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'title' | 'children'> {
  key?: string;
  title: ReactNode;
  icon?: ReactNode;
  menu?: readonly DropdownItem[];
}
export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  items: readonly BreadcrumbItem[];
  separator?: ReactNode;
  maxItems?: number;
  itemsBeforeCollapse?: number;
  itemsAfterCollapse?: number;
  itemRender?: (item: BreadcrumbItem, index: number) => ReactNode;
}
export function Breadcrumb(rawProps: BreadcrumbProps) {
  const {
    items,
    separator = <ChevronRight size={13} />,
    maxItems = Infinity,
    itemsBeforeCollapse = 1,
    itemsAfterCollapse = 1,
    itemRender,
    className,
    'aria-label': label,
    ...props
  } = useComponentProps('Breadcrumb', rawProps);
  const { messages } = useLeafConfig();
  const before = Math.max(1, itemsBeforeCollapse),
    after = Math.max(1, itemsAfterCollapse);
  const hidden =
    items.length > Math.max(3, maxItems) && items.length > before + after
      ? items.slice(before, -after)
      : [];
  const visible: BreadcrumbItem[] = hidden.length
    ? [
        ...items.slice(0, before),
        {
          title: (
            <Dropdown
              items={hidden.map((item, index) => ({
                key: item.key ?? String(index),
                label: item.title,
                href: item.href,
                onClick: item.onClick
                  ? (event) => item.onClick?.(event as React.MouseEvent<HTMLAnchorElement>)
                  : undefined,
              }))}
            >
              <ButtonControl
                variant="ghost"
                size="sm"
                aria-label={messages.tree.expand}
                startIcon={<Ellipsis size={16} />}
              />
            </Dropdown>
          ),
          key: 'leaf-collapse',
        },
        ...items.slice(-after),
      ]
    : [...items];
  return (
    <nav
      {...props}
      className={classes('leaf-breadcrumb', className)}
      aria-label={label ?? messages.breadcrumb.label}
    >
      <ol>
        {visible.map(({ key, title, icon, menu, ...item }, index) => (
          <li key={key ?? index}>
            {index > 0 && (
              <span className="leaf-breadcrumb__separator" aria-hidden="true">
                {separator}
              </span>
            )}
            {itemRender ? (
              itemRender(
                { key, title, icon, menu, ...item },
                items.findIndex((entry) => entry.key === key && entry.title === title),
              )
            ) : menu ? (
              <Dropdown items={menu}>
                <ButtonControl variant="ghost" size="sm">
                  {title}
                </ButtonControl>
              </Dropdown>
            ) : item.href ? (
              <a {...item} aria-current={index === visible.length - 1 ? 'page' : undefined}>
                {icon && <span aria-hidden="true">{icon}</span>}
                {title}
              </a>
            ) : (
              <span
                className="leaf-breadcrumb__label"
                aria-current={index === visible.length - 1 ? 'page' : undefined}
              >
                {icon && <span aria-hidden="true">{icon}</span>}
                {title}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
