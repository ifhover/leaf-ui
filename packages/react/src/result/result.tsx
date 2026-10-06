import { Check, Inbox, Info, TriangleAlert, X } from 'lucide-react';
import { type HTMLAttributes, type ReactNode, useRef } from 'react';
import { useLeafConfig } from '../config-provider/context';
import { classes } from '../shared/classes';
import { useContentTransition } from '../shared/presence';

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
  success: Check,
  warning: TriangleAlert,
  error: X,
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
  const root = useRef<HTMLDivElement>(null);
  useContentTransition(root, status);
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
      ref={root}
      className={classes(
        'leaf-result',
        `leaf-result--${status}`,
        `leaf-result--${size}`,
        className,
      )}
    >
      {icon !== null && (
        <div className="leaf-result__icon" aria-hidden="true" key={status}>
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
