import {
  forwardRef,
  type ReactNode,
  type TextareaHTMLAttributes,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';
import { useFormField } from '../form/form';
import { classes } from '../shared/classes';
import { useFieldValue, useMergedRef } from '../shared/field';
import type { ControlSize, ControlStatus } from '../shared/types';

export interface TextareaAutoSize {
  minRows?: number;
  maxRows?: number;
}
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  size?: ControlSize;
  status?: ControlStatus;
  resize?: 'none' | 'vertical' | 'both';
  autoSize?: boolean | TextareaAutoSize;
  showCount?: boolean | ((value: string, maxLength?: number) => ReactNode);
}

const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    size = 'md',
    status: statusProp,
    resize = 'vertical',
    rows = 3,
    autoSize = false,
    showCount = false,
    value,
    defaultValue,
    onChange,
    className,
    style,
    disabled: disabledProp,
    'aria-invalid': ariaInvalid,
    ...props
  },
  ref,
) {
  const field = useFormField();
  const textarea = useRef<HTMLTextAreaElement>(null);
  const merged = useMergedRef(textarea, ref);
  const [current, setCurrent] = useFieldValue(
    value === undefined ? undefined : String(value),
    String(defaultValue ?? ''),
    textarea,
    props.form,
  );
  const disabled = disabledProp || field?.disabled;
  const status = statusProp ?? (field?.error ? 'error' : undefined);
  const minRows = typeof autoSize === 'object' ? Math.max(1, autoSize.minRows ?? rows) : rows;
  const maxRows =
    typeof autoSize === 'object' ? Math.max(minRows, autoSize.maxRows ?? Infinity) : Infinity;
  useBrowserLayoutEffect(() => {
    if (!autoSize || !textarea.current) return;
    const node = textarea.current;
    const measure = () => {
      const computed = getComputedStyle(node);
      const lineHeight =
        Number.parseFloat(computed.lineHeight) ||
        (Number.parseFloat(computed.fontSize) || 14) * 1.5;
      const padding =
        (Number.parseFloat(computed.paddingTop) || 0) +
        (Number.parseFloat(computed.paddingBottom) || 0);
      const border =
        (Number.parseFloat(computed.borderTopWidth) || 0) +
        (Number.parseFloat(computed.borderBottomWidth) || 0);
      const addition = computed.boxSizing === 'border-box' ? padding + border : 0;
      node.style.height = 'auto';
      const measured =
        node.scrollHeight + (computed.boxSizing === 'border-box' ? border : -padding);
      const maximum = lineHeight * maxRows + addition;
      node.style.height = `${Math.min(maximum, Math.max(lineHeight * minRows + addition, measured))}px`;
      node.style.overflowY = measured > maximum ? 'auto' : 'hidden';
    };
    measure();
    let width = node.clientWidth;
    const observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            if (width !== node.clientWidth) {
              width = node.clientWidth;
              measure();
            }
          });
    observer?.observe(node);
    return () => observer?.disconnect();
  }, [autoSize, minRows, maxRows, current]);
  const control = (
    <textarea
      {...props}
      id={props.id ?? field?.id}
      required={props.required ?? field?.required}
      aria-describedby={
        [props['aria-describedby'], field?.descriptionId].filter(Boolean).join(' ') || undefined
      }
      ref={merged}
      disabled={disabled}
      rows={rows}
      value={current}
      onChange={(event) => {
        setCurrent(event.target.value);
        onChange?.(event);
      }}
      className={classes('leaf-textarea', `leaf-textarea--${size}`, className)}
      style={{ resize: autoSize ? 'none' : resize, ...style }}
      data-status={status}
      aria-invalid={status === 'error' ? true : ariaInvalid}
    />
  );
  return showCount ? (
    <div className="leaf-textarea-wrap">
      {control}
      <span className="leaf-textarea__count">
        {typeof showCount === 'function'
          ? showCount(current, props.maxLength)
          : `${current.length}${props.maxLength === undefined ? '' : ` / ${props.maxLength}`}`}
      </span>
    </div>
  ) : (
    control
  );
});
Textarea.displayName = 'Textarea';
