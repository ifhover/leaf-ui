import { Check, Inbox, Info, TriangleAlert, X } from 'lucide-react';
import { type HTMLAttributes, type ReactNode, useRef } from 'react';
import { useComponentProps } from '../config-provider/component-defaults';
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
export function ResultControl({
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
        ? messages.common.noData
        : messages.result[
            status === 'success'
              ? 'success'
              : status === 'warning'
                ? 'warning'
                : status === 'error'
                  ? 'error'
                  : 'info'
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

export function Result(rawProps: ResultProps) {
  const props = useComponentProps('Result', rawProps);
  return <ResultControl {...props} />;
}
