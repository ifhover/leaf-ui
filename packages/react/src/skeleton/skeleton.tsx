import { Image as ImageIcon } from 'lucide-react';
import { type HTMLAttributes, useEffect, useLayoutEffect, useRef } from 'react';
import { useComponentProps } from '../config-provider/component-defaults';
import { useLeafConfig } from '../config-provider/context';
import { classes } from '../shared/classes';
import { animateMotion, useMotionEnabled } from '../shared/motion';
import type { ControlSize } from '../shared/types';

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
export function SkeletonControl({
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
      aria-label={props['aria-label'] ?? messages.common.loading}
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

export interface SkeletonAvatarProps extends HTMLAttributes<HTMLDivElement> {
  size?: ControlSize | number;
  shape?: 'circle' | 'square';
  active?: boolean;
}
export function SkeletonAvatar(rawProps: SkeletonAvatarProps) {
  const {
    size = 'md',
    shape = 'circle',
    active = true,
    className,
    style,
    ...props
  } = useComponentProps('SkeletonAvatar', rawProps);
  const { messages } = useLeafConfig();
  const dimensions =
    typeof size === 'number' && Number.isFinite(size) ? Math.max(8, size) : undefined;
  return (
    <div
      {...props}
      role="status"
      aria-label={props['aria-label'] ?? messages.common.loading}
      className={classes(
        'leaf-skeleton-element',
        'leaf-skeleton-element--avatar',
        typeof size === 'string' && `leaf-skeleton-element--${size}`,
        `leaf-skeleton-element--shape-${shape}`,
        active && 'leaf-skeleton-element--active',
        className,
      )}
      style={{
        ...(dimensions ? { width: dimensions, height: dimensions } : {}),
        ...style,
      }}
    />
  );
}

export interface SkeletonButtonProps extends HTMLAttributes<HTMLDivElement> {
  size?: ControlSize;
  shape?: 'default' | 'circle' | 'round';
  block?: boolean;
  active?: boolean;
}
export function SkeletonButton(rawProps: SkeletonButtonProps) {
  const {
    size = 'md',
    shape = 'default',
    block = false,
    active = true,
    className,
    ...props
  } = useComponentProps('SkeletonButton', rawProps);
  const { messages } = useLeafConfig();
  return (
    <div
      {...props}
      role="status"
      aria-label={props['aria-label'] ?? messages.common.loading}
      className={classes(
        'leaf-skeleton-element',
        'leaf-skeleton-element--button',
        `leaf-skeleton-element--${size}`,
        `leaf-skeleton-element--shape-${shape}`,
        block && 'leaf-skeleton-element--block',
        active && 'leaf-skeleton-element--active',
        className,
      )}
    />
  );
}

export interface SkeletonInputProps extends HTMLAttributes<HTMLDivElement> {
  size?: ControlSize;
  block?: boolean;
  active?: boolean;
}
export function SkeletonInput(rawProps: SkeletonInputProps) {
  const {
    size = 'md',
    block = false,
    active = true,
    className,
    ...props
  } = useComponentProps('SkeletonInput', rawProps);
  const { messages } = useLeafConfig();
  return (
    <div
      {...props}
      role="status"
      aria-label={props['aria-label'] ?? messages.common.loading}
      className={classes(
        'leaf-skeleton-element',
        'leaf-skeleton-element--input',
        `leaf-skeleton-element--${size}`,
        block && 'leaf-skeleton-element--block',
        active && 'leaf-skeleton-element--active',
        className,
      )}
    />
  );
}

export interface SkeletonImageProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  active?: boolean;
}
export function SkeletonImage(rawProps: SkeletonImageProps) {
  const {
    size,
    active = true,
    className,
    style,
    ...props
  } = useComponentProps('SkeletonImage', rawProps);
  const { messages } = useLeafConfig();
  const dimensions = size !== undefined && Number.isFinite(size) ? Math.max(24, size) : undefined;
  return (
    <div
      {...props}
      role="status"
      aria-label={props['aria-label'] ?? messages.common.loading}
      className={classes(
        'leaf-skeleton-element',
        'leaf-skeleton-element--image',
        active && 'leaf-skeleton-element--active',
        className,
      )}
      style={{
        ...(dimensions ? { width: dimensions, height: dimensions } : {}),
        ...style,
      }}
    >
      <ImageIcon aria-hidden="true" />
    </div>
  );
}

function SkeletonRoot(rawProps: SkeletonProps) {
  const props = useComponentProps('Skeleton', rawProps);
  return <SkeletonControl {...props} />;
}

export const Skeleton = Object.assign(SkeletonRoot, {
  Avatar: SkeletonAvatar,
  Button: SkeletonButton,
  Input: SkeletonInput,
  Image: SkeletonImage,
});
