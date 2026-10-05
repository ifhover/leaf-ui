import type { HTMLAttributes } from 'react';
import { useLeafConfig } from '../config-provider/context';
import { classes } from '../shared/classes';

export interface SkeletonProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  loading?: boolean;
  active?: boolean;
  avatar?: boolean;
  title?: boolean;
  titleWidth?: number | string;
  rows?: number;
  rowWidths?: readonly (number | string)[];
  round?: boolean;
}
export function Skeleton({
  loading = true,
  active = true,
  avatar = false,
  title = true,
  titleWidth = '38%',
  rows = 3,
  rowWidths,
  round = false,
  children,
  className,
  ...props
}: SkeletonProps) {
  const { messages } = useLeafConfig();
  if (!loading) return <>{children}</>;
  const count = Math.max(0, Math.min(20, Number.isFinite(rows) ? Math.floor(rows) : 3));
  return (
    <div
      {...props}
      role="status"
      aria-label={props['aria-label'] ?? messages.loading}
      className={classes(
        'leaf-skeleton',
        active && 'leaf-skeleton--active',
        round && 'leaf-skeleton--round',
        className,
      )}
    >
      {avatar && <div className="leaf-skeleton__avatar" aria-hidden="true" />}
      <div className="leaf-skeleton__content" aria-hidden="true">
        {title && <div className="leaf-skeleton__title" style={{ width: titleWidth }} />}
        {Array.from({ length: count }, (_, index) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: Placeholder rows have fixed positional identity and no interactive state.
            key={`row-${index}`}
            className="leaf-skeleton__row"
            style={{ width: rowWidths?.[index] ?? (index === count - 1 ? '65%' : '100%') }}
          />
        ))}
      </div>
    </div>
  );
}
