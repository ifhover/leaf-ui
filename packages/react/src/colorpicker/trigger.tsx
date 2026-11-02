import { type ButtonHTMLAttributes, cloneElement, type Ref, type RefObject, version } from 'react';
import { useMergedRef } from '../shared/field';
import type { ColorPickerProps } from './colorpicker';

interface ColorPickerTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  custom?: ColorPickerProps['children'];
  triggerRef: RefObject<HTMLButtonElement | null>;
}

export function ColorPickerTrigger({ custom, triggerRef, ...props }: ColorPickerTriggerProps) {
  const childRef = custom
    ? version.startsWith('18.')
      ? (custom as typeof custom & { ref?: Ref<HTMLButtonElement> }).ref
      : custom.props.ref
    : undefined;
  const ref = useMergedRef(triggerRef, childRef);
  if (!custom) return <button {...props} ref={ref} />;
  const { children: _children, className: _className, ...triggerProps } = props;
  return cloneElement(custom, {
    ...Object.fromEntries(Object.entries(triggerProps).filter(([, value]) => value !== undefined)),
    ref,
    'aria-describedby':
      [custom.props['aria-describedby'], props['aria-describedby']].filter(Boolean).join(' ') ||
      undefined,
    onClick: (event) => {
      custom.props.onClick?.(event);
      if (!event.defaultPrevented) props.onClick?.(event);
    },
  });
}
