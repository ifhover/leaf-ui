import { Inbox } from 'lucide-react';
import type { HTMLAttributes, ReactNode } from 'react';
import { useLeafConfig } from '../config-provider/config-provider';
import { classes } from '../shared/classes';

export interface EmptyProps extends HTMLAttributes<HTMLDivElement> {
  image?: ReactNode;
  description?: ReactNode;
  size?: 'sm' | 'md';
}
export function Empty({
  image,
  description,
  size = 'md',
  children,
  className,
  ...props
}: EmptyProps) {
  const { messages } = useLeafConfig();
  return (
    <div {...props} className={classes('leaf-empty', `leaf-empty--${size}`, className)}>
      {image !== null && (
        <div className="leaf-empty__image" aria-hidden="true">
          {image ?? <Inbox />}
        </div>
      )}
      {description !== null && (
        <div className="leaf-empty__description">{description ?? messages.noData}</div>
      )}
      {children && <div className="leaf-empty__actions">{children}</div>}
    </div>
  );
}
