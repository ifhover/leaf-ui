import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { useFormField } from '../form/form';
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
    status: statusProp,
    resize = 'vertical',
    rows = 3,
    className,
    style,
    disabled: disabledProp,
    'aria-invalid': ariaInvalid,
    ...props
  },
  ref,
) {
  const field = useFormField();
  const disabled = disabledProp ?? field?.disabled;
  const status = statusProp ?? (field?.error ? 'error' : undefined);
  return (
    <textarea
      {...props}
      id={props.id ?? field?.id}
      required={props.required ?? field?.required}
      aria-describedby={
        [props['aria-describedby'], field?.descriptionId].filter(Boolean).join(' ') || undefined
      }
      ref={ref}
      disabled={disabled}
      rows={rows}
      className={classes('leaf-textarea', `leaf-textarea--${size}`, className)}
      style={{ resize, ...style }}
      data-status={status}
      aria-invalid={status === 'error' ? true : ariaInvalid}
    />
  );
});
Textarea.displayName = 'Textarea';
