import { CircleCheck, CircleX, Inbox, Info, TriangleAlert } from 'lucide-react';
import type { HTMLAttributes, ReactNode } from 'react';
import { useLeafConfig } from '../config-provider/config-provider';
import { classes } from '../shared/classes';

export interface ResultProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  status?: 'empty' | 'success' | 'warning' | 'error' | 'info';
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  extra?: ReactNode;
  size?: 'sm' | 'md';
}
const icons = {
  empty: Inbox,
  success: CircleCheck,
  warning: TriangleAlert,
  error: CircleX,
  info: Info,
};
export function Result({
  status = 'empty',
  title,
  description,
  icon,
  extra,
  size = 'md',
  children,
  className,
  ...props
}: ResultProps) {
  const { messages } = useLeafConfig();
  const Icon = icons[status];
  const heading =
    title !== undefined
      ? title
      : status === 'empty'
        ? messages.noData
        : messages[
            status === 'success'
              ? 'resultSuccess'
              : status === 'warning'
                ? 'resultWarning'
                : status === 'error'
                  ? 'resultError'
                  : 'resultInfo'
          ];
  return (
    <div
      {...props}
      className={classes(
        'leaf-result',
        `leaf-result--${status}`,
        `leaf-result--${size}`,
        className,
      )}
    >
      {icon !== null && (
        <div className="leaf-result__icon" aria-hidden="true">
          {icon ?? <Icon />}
        </div>
      )}
      {heading !== null && <div className="leaf-result__title">{heading}</div>}
      {description != null && <div className="leaf-result__description">{description}</div>}
      {children != null && <div className="leaf-result__content">{children}</div>}
      {extra != null && <div className="leaf-result__extra">{extra}</div>}
    </div>
  );
}
