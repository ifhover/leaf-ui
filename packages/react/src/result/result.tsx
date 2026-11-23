import { Check, CircleAlert, Inbox, TriangleAlert } from 'lucide-react';
import { type HTMLAttributes, type ReactNode, useRef } from 'react';
import { useComponentProps } from '../config-provider/component-defaults';
import { useLeafConfig } from '../config-provider/context';
import { classes } from '../shared/classes';
import { useContentTransition } from '../shared/presence';

export interface ResultProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  status?: 'empty' | 'success' | 'warning' | 'danger' | 'error';
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  extra?: ReactNode;
}
const icons = {
  empty: Inbox,
  success: Check,
  warning: TriangleAlert,
  danger: CircleAlert,
};
export function ResultControl({
  status = 'empty',
  title,
  description,
  icon,
  extra,
  children,
  className,
  ...props
}: ResultProps) {
  const { messages } = useLeafConfig();
  const normalizedStatus = status === 'error' ? 'danger' : status;
  const root = useRef<HTMLDivElement>(null);
  useContentTransition(root, normalizedStatus);
  const Icon = icons[normalizedStatus];
  const heading =
    title !== undefined
      ? title
      : normalizedStatus === 'empty'
        ? messages.common.noData
        : messages.result[normalizedStatus === 'danger' ? 'error' : normalizedStatus];
  return (
    <div
      {...props}
      ref={root}
      className={classes('leaf-result', `leaf-result--${normalizedStatus}`, className)}
    >
      {icon !== null && (
        <div className="leaf-result__icon" aria-hidden="true" key={normalizedStatus}>
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
