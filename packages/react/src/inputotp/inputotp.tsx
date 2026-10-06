import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useFormField } from '../form/form';
import { classes } from '../shared/classes';
import { useFieldValue, useMergedRef } from '../shared/field';
import type { ControlSize, ControlStatus } from '../shared/types';
import { useText } from '../shared/use-text';
export interface InputOTPProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'size' | 'value' | 'defaultValue' | 'onChange' | 'type' | 'maxLength'
  > {
  length?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  mode?: 'numeric' | 'alphanumeric';
  mask?: boolean | string;
  separator?: (index: number) => ReactNode;
  size?: ControlSize;
  status?: ControlStatus;
}
export const InputOTP = forwardRef<HTMLInputElement, InputOTPProps>(function InputOTP(
  {
    length = 6,
    value,
    defaultValue = '',
    onChange,
    onComplete,
    mode = 'numeric',
    mask = false,
    separator,
    size = 'md',
    status,
    className,
    style,
    disabled: disabledProp,
    onSelect,
    onFocus,
    onBlur,
    onClick,
    ...props
  },
  ref,
) {
  const t = useText();
  const field = useFormField();
  const input = useRef<HTMLInputElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const merged = useMergedRef(input, ref);
  const count = Math.max(1, Math.min(32, Math.floor(length)));
  const normalize = (text: string) =>
    text.replace(mode === 'numeric' ? /\D/g : /[^a-z0-9]/gi, '').slice(0, count);
  const [current, setCurrent] = useFieldValue(value, normalize(defaultValue), input, props.form);
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(0);
  const completed = useRef('');
  useEffect(() => {
    if (current.length < count) completed.current = '';
  }, [current, count]);
  const disabled = disabledProp || field?.disabled;
  const update = (text: string) => {
    const next = normalize(text);
    setCurrent(next);
    if (next !== current) onChange?.(next);
    if (next.length === count && completed.current !== next) {
      completed.current = next;
      onComplete?.(next);
    }
    if (next.length < count) completed.current = '';
    setActive(Math.min(next.length, count - 1));
  };
  return (
    <div
      ref={root}
      className={classes('leaf-input-otp', `leaf-input-otp--${size}`, className)}
      style={style}
      data-disabled={disabled ? '' : undefined}
      data-status={status ?? (field?.error ? 'error' : undefined)}
    >
      <input
        {...props}
        ref={merged}
        type="text"
        className="leaf-input-otp__input"
        id={props.id ?? field?.id}
        aria-label={props['aria-label'] ?? t('验证码', 'Verification code')}
        aria-describedby={
          [props['aria-describedby'], field?.descriptionId].filter(Boolean).join(' ') || undefined
        }
        aria-invalid={status === 'error' || Boolean(field?.error) || props['aria-invalid']}
        autoComplete={props.autoComplete ?? 'one-time-code'}
        inputMode={props.inputMode ?? (mode === 'numeric' ? 'numeric' : 'text')}
        pattern={
          props.pattern ?? (mode === 'numeric' ? `[0-9]{${count}}` : `[a-zA-Z0-9]{${count}}`)
        }
        required={props.required ?? field?.required}
        maxLength={count}
        value={current}
        disabled={disabled}
        onChange={(event) => update(event.target.value)}
        onPaste={(event) => {
          props.onPaste?.(event);
          if (event.defaultPrevented || props.readOnly) return;
          event.preventDefault();
          const selectionStart = event.currentTarget.selectionStart ?? current.length;
          const selectionEnd = event.currentTarget.selectionEnd ?? selectionStart;
          const pasted = normalize(event.clipboardData.getData('text'));
          const next = current.slice(0, selectionStart) + pasted + current.slice(selectionEnd);
          update(next);
          queueMicrotask(() =>
            input.current?.setSelectionRange(
              Math.min(count, selectionStart + pasted.length),
              Math.min(count, selectionStart + pasted.length),
            ),
          );
        }}
        onFocus={(event) => {
          setFocused(true);
          setActive(Math.min(count - 1, event.currentTarget.selectionStart ?? 0));
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        onSelect={(event) => {
          setActive(Math.min(count - 1, event.currentTarget.selectionStart ?? 0));
          onSelect?.(event);
        }}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          const slots = root.current?.querySelectorAll<HTMLElement>('[data-otp-slot]');
          const index = slots
            ? Array.from(slots).findIndex((slot) => {
                const rect = slot.getBoundingClientRect();
                return event.clientX >= rect.left && event.clientX <= rect.right;
              })
            : -1;
          if (index >= 0) {
            const position = Math.min(index, current.length);
            input.current?.setSelectionRange(position, Math.min(current.length, position + 1));
            setActive(position);
          }
        }}
      />
      <div className="leaf-input-otp__slots" aria-hidden="true">
        {Array.from({ length: count }, (_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: Slots represent fixed character positions, not reorderable data.
          <span key={`slot-${index}`} className="leaf-input-otp__item">
            <span
              data-otp-slot=""
              data-active={focused && active === index ? '' : undefined}
              data-filled={current[index] ? '' : undefined}
              className="leaf-input-otp__slot"
            >
              {current[index] && (
                <span className="leaf-input-otp__character" key={current[index]}>
                  {mask ? (typeof mask === 'string' ? mask : '•') : current[index]}
                </span>
              )}
            </span>
            {index < count - 1 && separator?.(index)}
          </span>
        ))}
      </div>
    </div>
  );
});
