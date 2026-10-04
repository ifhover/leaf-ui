import type { HTMLAttributes, ReactNode } from 'react';
import { Result } from '../result';

/** @deprecated Use Result with status="empty" instead. */
export interface EmptyProps extends HTMLAttributes<HTMLDivElement> {
  image?: ReactNode;
  description?: ReactNode;
  size?: 'sm' | 'md';
}
/** @deprecated Use Result with status="empty" instead. */
export function Empty({ image, description, children, className, ...props }: EmptyProps) {
  return (
    <Result
      {...props}
      status="empty"
      icon={image}
      title={description}
      extra={children}
      className={['leaf-empty', className].filter(Boolean).join(' ')}
    />
  );
}
