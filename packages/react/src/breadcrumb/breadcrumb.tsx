import { ChevronRight } from 'lucide-react';
import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { useLeafConfig } from '../config-provider/config-provider';
import { classes } from '../shared/classes';

export interface BreadcrumbItem
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'title' | 'children'> {
  key?: string;
  title: ReactNode;
  icon?: ReactNode;
}
export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  items: readonly BreadcrumbItem[];
  separator?: ReactNode;
}
export function Breadcrumb({
  items,
  separator = <ChevronRight size={13} />,
  className,
  'aria-label': label,
  ...props
}: BreadcrumbProps) {
  const { messages } = useLeafConfig();
  return (
    <nav
      {...props}
      className={classes('leaf-breadcrumb', className)}
      aria-label={label ?? messages.breadcrumb}
    >
      <ol>
        {items.map(({ key, title, icon, ...item }, index) => (
          <li key={key ?? index}>
            {index > 0 && (
              <span className="leaf-breadcrumb__separator" aria-hidden="true">
                {separator}
              </span>
            )}
            {item.href ? (
              <a {...item} aria-current={index === items.length - 1 ? 'page' : undefined}>
                {icon && <span aria-hidden="true">{icon}</span>}
                {title}
              </a>
            ) : (
              <span
                className="leaf-breadcrumb__label"
                aria-current={index === items.length - 1 ? 'page' : undefined}
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
