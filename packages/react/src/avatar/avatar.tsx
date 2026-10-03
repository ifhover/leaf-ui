import { UserRound } from 'lucide-react';
import { type HTMLAttributes, type ReactNode, useState } from 'react';
import { useLeafConfig } from '../config-provider/config-provider';
import { classes } from '../shared/classes';
import type { ControlSize } from '../shared/types';

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  src?: string;
  alt?: string;
  size?: ControlSize | number;
  shape?: 'circle' | 'square';
  icon?: ReactNode;
  onError?: () => void;
}
export function Avatar({
  src,
  alt,
  size = 'md',
  shape = 'circle',
  icon,
  onError,
  children,
  className,
  style,
  ...props
}: AvatarProps) {
  const { messages } = useLeafConfig();
  const [failedSource, setFailedSource] = useState<string>();
  return (
    <span
      {...props}
      role="img"
      aria-label={
        alt ?? props['aria-label'] ?? (typeof children === 'string' ? children : messages.avatar)
      }
      className={classes(
        'leaf-avatar',
        `leaf-avatar--${shape}`,
        typeof size === 'string' && `leaf-avatar--${size}`,
        className,
      )}
      style={{
        ...(typeof size === 'number'
          ? {
              width: Math.max(1, size),
              height: Math.max(1, size),
              fontSize: Math.max(12, size * 0.4),
            }
          : {}),
        ...style,
      }}
    >
      {src && failedSource !== src ? (
        <img
          src={src}
          alt=""
          onError={() => {
            setFailedSource(src);
            onError?.();
          }}
        />
      ) : (
        <span aria-hidden="true">{children ?? icon ?? <UserRound />}</span>
      )}
    </span>
  );
}
