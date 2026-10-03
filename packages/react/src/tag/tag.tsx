import { X } from 'lucide-react';
import { type HTMLAttributes, type MouseEvent, type ReactNode, useState } from 'react';
import { useLeafConfig } from '../config-provider/config-provider';
import { classes } from '../shared/classes';
import type { ControlSize } from '../shared/types';

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  color?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | (string & {});
  variant?: 'soft' | 'outline' | 'solid';
  size?: ControlSize;
  icon?: ReactNode;
  closable?: boolean;
  onClose?: (event: MouseEvent<HTMLButtonElement>) => void;
}
const presets = ['default', 'primary', 'success', 'warning', 'error', 'info'];
export function Tag({
  color = 'default',
  variant = 'soft',
  size = 'md',
  icon,
  closable = false,
  onClose,
  className,
  style,
  children,
  ...props
}: TagProps) {
  const { messages } = useLeafConfig();
  const [closed, setClosed] = useState(false);
  if (closed) return null;
  return (
    <span
      {...props}
      className={classes('leaf-tag', `leaf-tag--${variant}`, `leaf-tag--${size}`, className)}
      data-color={presets.includes(color) ? color : undefined}
      style={{ ...(!presets.includes(color) ? { '--leaf-tag-color': color } : {}), ...style }}
    >
      {icon && (
        <span className="leaf-tag__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span>{children}</span>
      {closable && (
        <button
          type="button"
          className="leaf-tag__close"
          aria-label={messages.remove}
          onClick={(event) => {
            onClose?.(event);
            if (!event.defaultPrevented) setClosed(true);
          }}
        >
          <X size={12} aria-hidden="true" />
        </button>
      )}
    </span>
  );
}
