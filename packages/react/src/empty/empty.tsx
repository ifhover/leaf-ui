import type { HTMLAttributes, ReactNode } from 'react';
import { useComponentProps } from '../config-provider/component-defaults';
import { ResultControl as Result } from '../result/result';

/** @deprecated Use Result with status="empty" instead. */
export interface EmptyProps extends HTMLAttributes<HTMLDivElement> {
  image?: ReactNode;
  description?: ReactNode;
  size?: 'sm' | 'md';
}
/** @deprecated Use Result with status="empty" instead. */
export function Empty(rawProps: EmptyProps) {
  const { image, description, children, className, ...props } = useComponentProps(
    'Empty',
    rawProps,
  );
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
