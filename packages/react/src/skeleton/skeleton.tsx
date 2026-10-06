import { type HTMLAttributes, useEffect, useLayoutEffect, useRef } from 'react';
import { useLeafConfig } from '../config-provider/context';
import { classes } from '../shared/classes';
import { animateMotion, useMotionEnabled } from '../shared/motion';

const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

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
  const root = useRef<HTMLDivElement>(null);
  const enabled = useMotionEnabled();
  const location = useRef<
    | {
        parent: HTMLElement;
        before: ChildNode | null;
        after: ChildNode | null;
      }
    | undefined
  >(undefined);
  useBrowserLayoutEffect(() => {
    const node = root.current;
    if (loading && node?.parentElement) {
      location.current = {
        parent: node.parentElement,
        before: node.previousSibling,
        after: node.nextSibling,
      };
      return;
    }
    const position = location.current;
    location.current = undefined;
    if (loading || !enabled || !position?.parent.isConnected) return;
    const { parent, before, after } = position;
    if ((before && before.parentNode !== parent) || (after && after.parentNode !== parent)) return;
    const animations: Animation[] = [];
    let visited = 0;
    let revealed = before ? before.nextSibling : parent.firstChild;
    while (revealed && revealed !== after && visited++ < 200) {
      if (revealed instanceof HTMLElement) {
        const animation = animateMotion(revealed, [
          { opacity: 0, translate: '0 4px' },
          { opacity: 1, translate: '0 0' },
        ]);
        if (animation) animations.push(animation);
      }
      revealed = revealed.nextSibling;
    }
    return () => {
      for (const animation of animations) animation.cancel();
    };
  }, [loading, enabled]);
  if (!loading) return <>{children}</>;
  const count = Math.max(0, Math.min(20, Number.isFinite(rows) ? Math.floor(rows) : 3));
  return (
    <div
      {...props}
      ref={root}
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
