import { Star } from 'lucide-react';
import { type HTMLAttributes, useRef, useState } from 'react';
import { useLeafConfig } from '../config-provider/context';
import { useFormField } from '../form/form';
import { classes } from '../shared/classes';
import { FormValue, useFieldValue } from '../shared/field';
import type { ControlSize } from '../shared/types';

export interface RateProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  count?: number;
  allowHalf?: boolean;
  allowClear?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  size?: ControlSize;
  color?: string;
  colorByValue?: boolean;
  colors?: readonly [string, string, string];
  name?: string;
  form?: string;
  required?: boolean;
}
export function Rate({
  value,
  defaultValue = 0,
  onChange,
  count = 5,
  allowHalf = false,
  allowClear = true,
  disabled: disabledProp,
  readOnly = false,
  size = 'md',
  color,
  colorByValue = false,
  colors = ['#ef5350', '#f49b23', '#ffc53d'],
  name,
  form,
  required: requiredProp,
  className,
  style,
  'aria-label': label,
  ...props
}: RateProps) {
  const { messages } = useLeafConfig();
  const field = useFormField();
  const disabled = disabledProp || field?.disabled;
  const required = requiredProp ?? field?.required;
  const maximum = Math.max(1, Math.min(20, Number.isFinite(count) ? Math.floor(count) : 5));
  const step = allowHalf ? 0.5 : 1;
  const normalize = (number: number) =>
    Math.min(maximum, Math.max(0, Number.isFinite(number) ? Math.round(number / step) * step : 0));
  const trigger = useRef<HTMLButtonElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useFieldValue(value, defaultValue, trigger, form);
  const selected = normalize(current);
  const [hovered, setHovered] = useState<number>();
  const [focused, setFocused] = useState<number>();
  const displayed = disabled || readOnly ? selected : (hovered ?? selected);
  const activeColor =
    color ??
    (colorByValue
      ? colors[displayed / maximum <= 0.4 ? 0 : displayed / maximum <= 0.7 ? 1 : 2]
      : undefined);
  const values = Array.from({ length: maximum / step }, (_, index) => (index + 1) * step);
  const focusValue = values.includes(focused ?? 0) ? focused : selected || step;
  const choose = (next: number) => {
    if (disabled || readOnly) return;
    const normalized = normalize(next);
    setCurrent(normalized);
    if (normalized !== selected) onChange?.(normalized);
  };
  return (
    <div
      {...props}
      id={props.id ?? field?.id}
      ref={root}
      role="radiogroup"
      aria-label={label ?? (field?.labelId ? undefined : messages.rating)}
      aria-labelledby={props['aria-labelledby'] ?? field?.labelId}
      aria-disabled={disabled || undefined}
      aria-readonly={readOnly || undefined}
      aria-required={required || undefined}
      aria-describedby={
        [props['aria-describedby'], field?.descriptionId].filter(Boolean).join(' ') || undefined
      }
      className={classes('leaf-rate', `leaf-rate--${size}`, className)}
      style={{ ...(activeColor ? { '--leaf-rate-color': activeColor } : {}), ...style }}
      onPointerLeave={() => setHovered(undefined)}
      onBlur={(event) => {
        props.onBlur?.(event);
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(undefined);
      }}
    >
      {Array.from({ length: maximum }, (_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: Each star has a fixed numeric position in the rating scale.
        <span className="leaf-rate__star" key={`star-${index}`}>
          <Star className="leaf-rate__empty" aria-hidden="true" />
          <span
            className="leaf-rate__fill"
            aria-hidden="true"
            style={{ width: `${Math.max(0, Math.min(1, displayed - index)) * 100}%` }}
          >
            <Star />
          </span>
          {(allowHalf ? [index + 0.5, index + 1] : [index + 1]).map((number) => (
            // biome-ignore lint/a11y/useSemanticElements: Custom rating radios support half values, clearing and read-only state with one roving tab stop.
            <button
              type="button"
              key={number}
              ref={number === step ? trigger : undefined}
              role="radio"
              aria-checked={number === selected}
              aria-label={`${number} / ${maximum}`}
              disabled={disabled}
              aria-disabled={readOnly || undefined}
              className="leaf-rate__option"
              tabIndex={number === focusValue ? 0 : -1}
              onFocus={() => setFocused(number)}
              onPointerEnter={() => {
                if (!disabled && !readOnly) setHovered(number);
              }}
              onClick={() => choose(allowClear && number === selected ? 0 : number)}
              onKeyDown={(event) => {
                if (disabled || readOnly) return;
                let next: number | undefined;
                if (event.key === 'Home') next = step;
                else if (event.key === 'End') next = maximum;
                else if (['ArrowRight', 'ArrowUp', 'ArrowLeft', 'ArrowDown'].includes(event.key))
                  next = Math.max(
                    step,
                    Math.min(
                      maximum,
                      number + (['ArrowRight', 'ArrowUp'].includes(event.key) ? step : -step),
                    ),
                  );
                else if ((event.key === 'Delete' || event.key === 'Backspace') && allowClear)
                  next = 0;
                if (next !== undefined) {
                  event.preventDefault();
                  choose(next);
                  setHovered(undefined);
                  const target = root.current?.querySelector<HTMLButtonElement>(
                    `[aria-label='${next || step} / ${maximum}']`,
                  );
                  target?.focus();
                }
              }}
            />
          ))}
        </span>
      ))}
      <FormValue
        name={name}
        form={form}
        value={selected ? String(selected) : ''}
        disabled={disabled}
        required={required}
        triggerRef={trigger}
      />
    </div>
  );
}
