import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useLeafConfig } from '../config-provider/config-provider';
import { useFormField } from '../form/form';
import { classes } from '../shared/classes';
import { useFieldValue, useMergedRef } from '../shared/field';
import type { ControlSize, ControlStatus } from '../shared/types';

export interface InputNumberProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'type' | 'size' | 'prefix' | 'value' | 'defaultValue' | 'onChange' | 'min' | 'max' | 'step'
  > {
  value?: number | null;
  defaultValue?: number | null;
  onChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  controls?: boolean;
  keyboard?: boolean;
  size?: ControlSize;
  status?: ControlStatus;
  prefix?: ReactNode;
  suffix?: ReactNode;
}
const parse = (text: string): number | null => {
  if (!text.trim() || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(text.trim()))
    return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
};
const decimals = (value: number) => {
  const [base = '', exponent = '0'] = String(value).toLowerCase().split('e');
  return Math.max(0, (base.split('.')[1]?.length ?? 0) - Number(exponent));
};
export const InputNumber = forwardRef<HTMLInputElement, InputNumberProps>(function InputNumber(
  {
    value,
    defaultValue = null,
    onChange,
    min = -Infinity,
    max = Infinity,
    step = 1,
    precision,
    controls = true,
    keyboard = true,
    size = 'md',
    status: statusProp,
    prefix,
    suffix,
    className,
    style,
    disabled: disabledProp,
    readOnly,
    onBlur,
    onKeyDown,
    onFocus,
    ...props
  },
  forwardedRef,
) {
  const field = useFormField();
  const { messages } = useLeafConfig();
  const input = useRef<HTMLInputElement>(null);
  const ref = useMergedRef(input, forwardedRef);
  const disabled = disabledProp ?? field?.disabled;
  const status = statusProp ?? (field?.error ? 'error' : undefined);
  const [current, setCurrent] = useFieldValue(value, defaultValue, input, props.form);
  const digits =
    precision === undefined ? undefined : Math.max(0, Math.min(15, Math.trunc(precision)));
  const format = (number: number | null) =>
    number == null || !Number.isFinite(number)
      ? ''
      : digits === undefined
        ? String(number)
        : number.toFixed(digits);
  const [draft, setDraft] = useState(() => format(current));
  const editing = useRef(false);
  const inputChanged = useRef(false);
  useEffect(() => {
    if (inputChanged.current && input.current?.value === draft) {
      inputChanged.current = false;
      input.current?.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }, [draft]);
  useEffect(() => {
    setDraft((text) =>
      editing.current && parse(text) === current
        ? text
        : current == null || !Number.isFinite(current)
          ? ''
          : digits === undefined
            ? String(current)
            : current.toFixed(digits),
    );
  }, [current, digits]);
  useEffect(() => {
    const form = input.current?.form;
    if (!form) return;
    const reset = (event: Event) =>
      queueMicrotask(() => {
        if (!event.defaultPrevented && value === undefined) {
          editing.current = false;
          setDraft(
            defaultValue == null
              ? ''
              : digits === undefined
                ? String(defaultValue)
                : defaultValue.toFixed(digits),
          );
        }
      });
    form.addEventListener('reset', reset);
    return () => form.removeEventListener('reset', reset);
  }, [value, defaultValue, digits]);
  useEffect(() => {
    const number = parse(draft);
    input.current?.setCustomValidity(
      draft.trim() && (number === null || number < min || number > max)
        ? messages.invalidNumber
        : '',
    );
  }, [draft, min, max, messages.invalidNumber]);
  const emit = (next: number | null) => {
    setCurrent(next);
    if (next !== current) onChange?.(next);
  };
  const normalize = (number: number) =>
    Math.min(max, Math.max(min, digits === undefined ? number : Number(number.toFixed(digits))));
  const commit = () => {
    if (readOnly || disabled) return;
    const number = parse(draft);
    const next = !draft.trim() ? null : number === null ? current : normalize(number);
    inputChanged.current = format(next) !== draft;
    setDraft(format(next));
    emit(next);
  };
  const changeBy = (direction: number) => {
    if (disabled || readOnly) return;
    const amount = Number.isFinite(step) && step > 0 ? step : 1;
    const base = parse(draft) ?? current ?? 0;
    const places = digits ?? Math.min(15, Math.max(decimals(base), decimals(amount)));
    const next = normalize(Number((base + direction * amount).toFixed(places)));
    inputChanged.current = format(next) !== draft;
    setDraft(format(next));
    emit(next);
    input.current?.focus();
  };
  const number = parse(draft);
  return (
    <div
      className={classes('leaf-input-number', `leaf-input-number--${size}`, className)}
      style={style}
      data-status={status}
      data-disabled={disabled ? '' : undefined}
    >
      {prefix && (
        <span className="leaf-input__affix" aria-hidden="true">
          {prefix}
        </span>
      )}
      <input
        {...props}
        ref={ref}
        type="text"
        inputMode={props.inputMode ?? 'decimal'}
        role="spinbutton"
        className="leaf-input-number__input"
        id={props.id ?? field?.id}
        name={props.name}
        value={draft}
        required={props.required ?? field?.required}
        disabled={disabled}
        readOnly={readOnly}
        aria-valuemin={Number.isFinite(min) ? min : undefined}
        aria-valuemax={Number.isFinite(max) ? max : undefined}
        aria-valuenow={number ?? undefined}
        aria-invalid={status === 'error' ? true : props['aria-invalid']}
        aria-describedby={
          [props['aria-describedby'], field?.descriptionId].filter(Boolean).join(' ') || undefined
        }
        onChange={(event) => {
          const text = event.target.value;
          setDraft(text);
          const next = parse(text);
          if (!text.trim()) emit(null);
          else if (next !== null && next >= min && next <= max) emit(next);
        }}
        onFocus={(event) => {
          editing.current = true;
          onFocus?.(event);
        }}
        onBlur={(event) => {
          editing.current = false;
          commit();
          onBlur?.(event);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || event.nativeEvent.isComposing) return;
          if (event.key === 'Enter') commit();
          if (keyboard && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
            event.preventDefault();
            changeBy(event.key === 'ArrowUp' ? 1 : -1);
          }
        }}
      />
      {suffix && (
        <span className="leaf-input__affix" aria-hidden="true">
          {suffix}
        </span>
      )}
      {controls && (
        <span className="leaf-input-number__controls">
          <button
            type="button"
            tabIndex={-1}
            aria-label={messages.increase}
            disabled={disabled || readOnly || (number !== null && number >= max)}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => changeBy(1)}
          >
            <ChevronUp size={12} aria-hidden="true" />
          </button>
          <button
            type="button"
            tabIndex={-1}
            aria-label={messages.decrease}
            disabled={disabled || readOnly || (number !== null && number <= min)}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => changeBy(-1)}
          >
            <ChevronDown size={12} aria-hidden="true" />
          </button>
        </span>
      )}
    </div>
  );
});
