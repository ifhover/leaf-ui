import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { useLeafConfig } from '../config-provider/context';
import { useFormField } from '../form/form';
import { useFieldValue, useMergedRef } from '../shared/field';
import { addDecimal, compareDecimal, decimalParts, roundDecimal } from './decimal';
import { InputNumberFrame } from './frame';
import type { NumericInputNumberProps } from './inputnumber';
export interface StringInputNumberProps
  extends Omit<
    NumericInputNumberProps,
    'stringMode' | 'value' | 'defaultValue' | 'onChange' | 'min' | 'max' | 'step'
  > {
  stringMode: true;
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
  min?: string;
  max?: string;
  step?: string;
}
export const ExactInputNumber = forwardRef<HTMLInputElement, StringInputNumberProps>(
  function ExactInputNumber(
    {
      value,
      defaultValue = null,
      onChange,
      min,
      max,
      step = '1',
      precision,
      formatter,
      parser,
      grouping,
      locale: numberLocale,
      controls = true,
      variant = 'default',
      keyboard = true,
      size = 'md',
      status: statusProp,
      prefix,
      suffix,
      disabled: disabledProp,
      readOnly,
      onBlur,
      onKeyDown,
      onFocus,
      className,
      style,
      stringMode: _stringMode,
      name,
      ...props
    },
    ref,
  ) {
    const field = useFormField();
    const config = useLeafConfig();
    const disabled = disabledProp || field?.disabled;
    const input = useRef<HTMLInputElement>(null);
    const merged = useMergedRef(input, ref);
    const [current, setCurrent] = useFieldValue(value, defaultValue, input, props.form);
    const symbols = new Intl.NumberFormat(numberLocale ?? config.locale).formatToParts(10000.1);
    const group = symbols.find((part) => part.type === 'group')?.value ?? ',';
    const decimal = symbols.find((part) => part.type === 'decimal')?.value ?? '.';
    const format = useCallback(
      (raw: string | null) => {
        if (formatter) return formatter(raw, { userTyping: false, input: '' });
        if (raw === null) return '';
        const text = roundDecimal(raw, precision);
        if (!grouping) return text;
        const [whole = '', fraction] = text.split('.');
        return (
          whole.replace(/\B(?=(\d{3})+(?!\d))/g, group) +
          (fraction === undefined ? '' : decimal + fraction)
        );
      },
      [formatter, precision, grouping, group, decimal],
    );
    const parse = useCallback(
      (text: string) => {
        const raw = parser
          ? String(parser(text))
          : grouping
            ? text.split(group).join('').replace(decimal, '.')
            : text;
        return decimalParts(raw) ? roundDecimal(raw) : null;
      },
      [parser, grouping, group, decimal],
    );
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
        editing.current && parse(text) === current ? text : current === null ? '' : format(current),
      );
    }, [current, format, parse]);
    useEffect(() => {
      const owner = input.current?.form;
      const reset = (event: Event) =>
        queueMicrotask(() => {
          if (!event.defaultPrevented && value === undefined) {
            editing.current = false;
            setDraft(format(defaultValue));
          }
        });
      owner?.addEventListener('reset', reset);
      return () => owner?.removeEventListener('reset', reset);
    }, [value, defaultValue, format]);
    const parsed = parse(draft);
    const within = useCallback(
      (raw: string) =>
        (min === undefined || compareDecimal(raw, min) >= 0) &&
        (max === undefined || compareDecimal(raw, max) <= 0),
      [min, max],
    );
    useEffect(() => {
      input.current?.setCustomValidity(
        draft.trim() && (parsed === null || !within(parsed))
          ? config.messages.inputNumber.invalid
          : '',
      );
    }, [draft, parsed, within, config.messages.inputNumber.invalid]);
    const emit = (next: string | null) => {
      if (disabled || readOnly) return;
      setCurrent(next);
      if (next !== current) onChange?.(next);
    };
    const normalize = (raw: string) => {
      let next = roundDecimal(raw, precision);
      if (min !== undefined && compareDecimal(next, min) < 0) next = min;
      if (max !== undefined && compareDecimal(next, max) > 0) next = max;
      return next;
    };
    const commit = () => {
      if (disabled || readOnly) return;
      const next = !draft.trim() ? null : parsed === null ? current : normalize(parsed);
      const nextDraft = format(next);
      inputChanged.current = nextDraft !== draft;
      setDraft(nextDraft);
      emit(next);
    };
    const increment = (direction: number) => {
      if (disabled || readOnly) return;
      const amount = decimalParts(step) && compareDecimal(step, 0) > 0 ? step : '1';
      const next = normalize(addDecimal(parsed ?? current ?? '0', amount, direction));
      const nextDraft = format(next);
      inputChanged.current = nextDraft !== draft;
      setDraft(nextDraft);
      emit(next);
      input.current?.focus();
    };
    const resolvedStatus = statusProp ?? (field?.error ? 'error' : undefined);
    const toAriaNumber = (raw: string | null | undefined) => {
      if (raw == null || raw === '') return undefined;
      const numeric = Number(raw);
      return Number.isFinite(numeric) ? numeric : undefined;
    };
    return (
      <InputNumberFrame
        variant={variant}
        size={size}
        status={resolvedStatus}
        disabled={disabled}
        controls={controls}
        prefix={prefix}
        suffix={suffix}
        className={className}
        style={style}
        inputRef={merged}
        triggerRef={input}
        formName={name}
        form={props.form}
        formValue={current ?? ''}
        increaseDisabled={
          disabled ||
          readOnly ||
          (parsed !== null && max !== undefined && compareDecimal(parsed, max) >= 0)
        }
        decreaseDisabled={
          disabled ||
          readOnly ||
          (parsed !== null && min !== undefined && compareDecimal(parsed, min) <= 0)
        }
        onStep={increment}
        inputProps={{
          ...props,
          id: props.id ?? field?.id,
          inputMode: props.inputMode ?? 'decimal',
          value: draft,
          readOnly,
          disabled,
          required: props.required ?? field?.required,
          'aria-valuemin': toAriaNumber(min),
          'aria-valuemax': toAriaNumber(max),
          'aria-valuenow': toAriaNumber(parsed),
          'aria-valuetext': draft || undefined,
          'aria-invalid': resolvedStatus === 'error' ? true : props['aria-invalid'],
          'aria-describedby':
            [props['aria-describedby'], field?.descriptionId].filter(Boolean).join(' ') ||
            undefined,
          onChange: (event) => {
            if (disabled || readOnly) return;
            const text = event.target.value;
            setDraft(text);
            const raw = parse(text);
            if (!text.trim()) emit(null);
            else if (raw !== null && within(raw)) emit(raw);
          },
          onFocus: (event) => {
            editing.current = true;
            onFocus?.(event);
          },
          onBlur: (event) => {
            editing.current = false;
            commit();
            onBlur?.(event);
          },
          onKeyDown: (event) => {
            onKeyDown?.(event);
            if (event.defaultPrevented || event.nativeEvent.isComposing) return;
            if (event.key === 'Enter') commit();
            if (keyboard && ['ArrowUp', 'ArrowDown'].includes(event.key)) {
              event.preventDefault();
              increment(event.key === 'ArrowUp' ? 1 : -1);
            }
          },
        }}
      />
    );
  },
);
