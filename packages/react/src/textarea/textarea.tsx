import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { classes } from '../shared/classes';
import type { ControlSize, ControlStatus } from '../shared/types';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  size?: ControlSize;
  status?: ControlStatus;
  resize?: 'none' | 'vertical' | 'both';
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    size = 'md',
    status,
    resize = 'vertical',
    rows = 3,
    className,
    style,
    'aria-invalid': ariaInvalid,
    ...props
  },
  ref,
) {
  return (
    <textarea
      {...props}
      ref={ref}
      rows={rows}
      className={classes('leaf-textarea', `leaf-textarea--${size}`, className)}
      style={{ resize, ...style }}
      data-status={status}
      aria-invalid={status === 'error' ? true : ariaInvalid}
    />
  );
});
Textarea.displayName = 'Textarea';
