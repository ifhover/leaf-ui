import { LoaderCircle } from 'lucide-react';
import { type HTMLAttributes, type ReactNode, useEffect, useState } from 'react';
import { useLeafConfig } from '../config-provider/context';
import { classes } from '../shared/classes';
import { inertProps } from '../shared/inert';
import type { ControlSize } from '../shared/types';

export interface LoadingProps extends HTMLAttributes<HTMLDivElement> {
  spinning?: boolean;
  size?: ControlSize;
  tip?: ReactNode;
  delay?: number;
}
export function Loading({
  spinning = true,
  size = 'md',
  tip,
  delay = 0,
  children,
  className,
  ...props
}: LoadingProps) {
  const { messages } = useLeafConfig();
  const [ready, setReady] = useState(spinning && delay <= 0);
  useEffect(() => {
    if (!spinning) {
      setReady(false);
      return;
    }
    if (delay <= 0) {
      setReady(true);
      return;
    }
    setReady(false);
    const timer = setTimeout(() => setReady(true), delay);
    return () => clearTimeout(timer);
  }, [spinning, delay]);
  const visible = spinning && ready;
  const indicator = (
    <div
      className="leaf-loading__indicator"
      role="status"
      aria-label={typeof tip === 'string' ? tip : messages.loading}
    >
      <LoaderCircle className="leaf-loading__spinner" aria-hidden="true" />
      {tip && <span>{tip}</span>}
    </div>
  );
  return (
    <div
      {...props}
      className={classes(
        'leaf-loading',
        `leaf-loading--${size}`,
        children != null && 'leaf-loading--wrapped',
        className,
      )}
      aria-busy={spinning}
    >
      {children != null ? (
        <>
          <div
            className="leaf-loading__content"
            data-loading={visible || undefined}
            {...inertProps(visible)}
          >
            {children}
          </div>
          {visible && <div className="leaf-loading__overlay">{indicator}</div>}
        </>
      ) : visible ? (
        indicator
      ) : null}
    </div>
  );
}
