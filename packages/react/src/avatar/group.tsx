import { Children, cloneElement, type HTMLAttributes, isValidElement, type ReactNode } from 'react';
import { Popover } from '../popover';
import { classes } from '../shared/classes';
import { useText } from '../shared/use-text';
import { Avatar, type AvatarProps } from './avatar';
export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  maxCount?: number;
  size?: AvatarProps['size'];
  shape?: AvatarProps['shape'];
  maxContent?: (hiddenCount: number) => ReactNode;
}
export function AvatarGroup({
  maxCount = Infinity,
  size,
  shape,
  maxContent,
  className,
  children,
  ...props
}: AvatarGroupProps) {
  const t = useText();
  const items = Children.toArray(children).map((child) =>
    isValidElement<AvatarProps>(child)
      ? cloneElement(child, { size: child.props.size ?? size, shape: child.props.shape ?? shape })
      : child,
  );
  const visible = items.slice(0, Math.max(0, maxCount));
  const hidden = items.slice(visible.length);
  return (
    <div {...props} className={classes('leaf-avatar-group', className)}>
      {visible}
      {hidden.length > 0 && (
        <Popover
          trigger="hover"
          content={<div className="leaf-avatar-group__overflow">{hidden}</div>}
        >
          <button
            type="button"
            className="leaf-avatar-group__more"
            aria-label={t(`查看其余 ${hidden.length} 位成员`, `Show ${hidden.length} more members`)}
          >
            <Avatar size={size} shape={shape} alt={t('更多成员', 'More members')}>
              {maxContent?.(hidden.length) ?? `+${hidden.length}`}
            </Avatar>
          </button>
        </Popover>
      )}
    </div>
  );
}
