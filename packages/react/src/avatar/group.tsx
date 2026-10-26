import {
  Children,
  cloneElement,
  type HTMLAttributes,
  isValidElement,
  type ReactNode,
  useRef,
} from 'react';
import { useComponentProps } from '../config-provider/component-defaults';
import { PopoverControl as Popover } from '../popover/popover';
import { classes } from '../shared/classes';
import { useListMotion } from '../shared/motion';
import { useFormattedText } from '../shared/use-formatted-text';
import { useText } from '../shared/use-text';
import { AvatarControl as Avatar, type AvatarProps } from './avatar';
export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  maxCount?: number;
  size?: AvatarProps['size'];
  shape?: AvatarProps['shape'];
  maxContent?: (hiddenCount: number) => ReactNode;
}
export function AvatarGroup(rawProps: AvatarGroupProps) {
  const {
    maxCount = Infinity,
    size,
    shape,
    maxContent,
    className,
    children,
    ...props
  } = useComponentProps('AvatarGroup', rawProps);
  const t = useText();
  const format = useFormattedText();
  const root = useRef<HTMLDivElement>(null);
  const items = Children.toArray(children).map((child, index) =>
    isValidElement<AvatarProps & { 'data-avatar-tone'?: number }>(child)
      ? cloneElement(child, {
          size: child.props.size ?? size,
          shape: child.props.shape ?? shape,
          'data-avatar-tone': index % 5,
        })
      : child,
  );
  const visible = items.slice(0, Math.max(0, maxCount));
  const hidden = items.slice(visible.length);
  useListMotion(
    root,
    JSON.stringify(visible.map((child, index) => (isValidElement(child) ? child.key : index))),
    ':scope > .leaf-avatar, :scope > .leaf-avatar-group__more',
  );
  return (
    <div {...props} ref={root} className={classes('leaf-avatar-group', className)}>
      {visible}
      {hidden.length > 0 && (
        <Popover
          trigger="hover"
          content={<div className="leaf-avatar-group__overflow">{hidden}</div>}
        >
          <button
            type="button"
            className="leaf-avatar-group__more"
            aria-label={format('avatar.showMore', { count: hidden.length })}
          >
            <Avatar size={size} shape={shape} alt={t('avatar.moreMembers')}>
              {maxContent?.(hidden.length) ?? `+${hidden.length}`}
            </Avatar>
          </button>
        </Popover>
      )}
    </div>
  );
}
