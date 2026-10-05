import { ChevronDown, ChevronUp } from 'lucide-react';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { useLeafConfig } from '../config-provider/context';
import { useFormField } from '../form/form';
import { classes } from '../shared/classes';
import { FormValue, useFieldValue, useMergedRef } from '../shared/field';
import { addDecimal, compareDecimal, decimalParts, roundDecimal } from './decimal';
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
      keyboard = true,
      size = 'md',
      status,
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
    const parse = (text: string) => {
      const raw = parser
        ? String(parser(text))
        : grouping
          ? text.split(group).join('').replace(decimal, '.')
          : text;
      return decimalParts(raw) ? roundDecimal(raw) : null;
    };
    const [draft, setDraft] = useState(() => format(current));
    const editing = useRef(false);
    useEffect(() => {
      if (!editing.current) setDraft(format(current));
    }, [current, format]);
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
        draft.trim() && (parsed === null || !within(parsed)) ? config.messages.invalidNumber : '',
      );
    }, [draft, parsed, within, config.messages.invalidNumber]);
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
      setDraft(format(next));
      emit(next);
    };
    const increment = (direction: number) => {
      if (disabled || readOnly) return;
      const amount = decimalParts(step) && compareDecimal(step, 0) > 0 ? step : '1';
      const next = normalize(addDecimal(parsed ?? current ?? '0', amount, direction));
      setDraft(format(next));
      emit(next);
      input.current?.focus();
    };
    return (
      <div
        className={classes('leaf-input-number', `leaf-input-number--${size}`, className)}
        style={style}
        data-status={status ?? (field?.error ? 'error' : undefined)}
        data-disabled={disabled || undefined}
      >
        {prefix && <span className="leaf-input__affix">{prefix}</span>}
        <input
          {...props}
          ref={merged}
          id={props.id ?? field?.id}
          type="text"
          role="spinbutton"
          inputMode="decimal"
          className="leaf-input-number__input"
          value={draft}
          readOnly={readOnly}
          disabled={disabled}
          required={props.required ?? field?.required}
          aria-valuetext={draft}
          aria-describedby={field?.descriptionId}
          onChange={(event) => {
            if (disabled || readOnly) return;
            const text = event.target.value;
            setDraft(text);
            const raw = parse(text);
            if (!text.trim()) emit(null);
            else if (raw !== null && within(raw)) emit(raw);
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
            if (keyboard && ['ArrowUp', 'ArrowDown'].includes(event.key)) {
              event.preventDefault();
              increment(event.key === 'ArrowUp' ? 1 : -1);
            }
          }}
        />
        <FormValue
          name={name}
          form={props.form}
          value={current ?? ''}
          disabled={disabled}
          triggerRef={input}
        />
        {suffix && <span className="leaf-input__affix">{suffix}</span>}
        {controls && (
          <span className="leaf-input-number__controls">
            {[1, -1].map((direction) => (
              <button
                key={direction}
                type="button"
                tabIndex={-1}
                aria-label={direction === 1 ? config.messages.increase : config.messages.decrease}
                disabled={
                  disabled ||
                  readOnly ||
                  (parsed !== null &&
                    (direction === 1
                      ? max !== undefined && compareDecimal(parsed, max) >= 0
                      : min !== undefined && compareDecimal(parsed, min) <= 0))
                }
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => increment(direction)}
              >
                {direction === 1 ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            ))}
          </span>
        )}
      </div>
    );
  },
);
