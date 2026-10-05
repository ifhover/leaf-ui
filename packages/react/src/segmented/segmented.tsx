import { forwardRef, type HTMLAttributes, type ReactNode, useId, useRef } from 'react';
import { useFormField } from '../form/form';
import { classes } from '../shared/classes';
import { FormValue, useFieldValue } from '../shared/field';
import type { ControlSize } from '../shared/types';
export interface SegmentedOption {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}
export interface SegmentedProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options: readonly (string | SegmentedOption)[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  size?: ControlSize;
  block?: boolean;
  name?: string;
  form?: string;
}
export const Segmented = forwardRef<HTMLDivElement, SegmentedProps>(function Segmented(
  {
    options,
    value,
    defaultValue,
    onChange,
    disabled: disabledProp,
    size = 'md',
    block = false,
    name,
    form,
    className,
    ...props
  },
  ref,
) {
  const field = useFormField();
  const disabled = disabledProp || field?.disabled;
  const entries = options.map((option) =>
    typeof option === 'string' ? { label: option, value: option } : option,
  );
  const first = entries.find((option) => !option.disabled)?.value ?? '';
  const trigger = useRef<HTMLButtonElement>(null);
  const [current, setCurrent] = useFieldValue(value, defaultValue ?? first, trigger, form);
  const id = useId();
  return (
    <div
      {...props}
      ref={ref}
      role="radiogroup"
      aria-disabled={disabled || undefined}
      className={classes(
        'leaf-segmented',
        `leaf-segmented--${size}`,
        block && 'leaf-segmented--block',
        className,
      )}
    >
      {entries.map((option, index) => (
        // biome-ignore lint/a11y/useSemanticElements: Segmented buttons implement roving focus and radio-group selection with a shared form proxy.
        <button
          key={option.value}
          type="button"
          ref={index === 0 ? trigger : undefined}
          role="radio"
          aria-checked={current === option.value}
          disabled={disabled || option.disabled}
          tabIndex={
            current === option.value ||
            (!entries.some((entry) => entry.value === current && !entry.disabled) &&
              option.value === first)
              ? 0
              : -1
          }
          id={`${id}-${index}`}
          onClick={() => {
            setCurrent(option.value);
            onChange?.(option.value);
          }}
          onKeyDown={(event) => {
            const available = entries.filter((entry) => !entry.disabled);
            const position = available.findIndex((entry) => entry.value === option.value);
            const next =
              event.key === 'Home'
                ? available[0]
                : event.key === 'End'
                  ? available.at(-1)
                  : ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'].includes(event.key)
                    ? available[
                        (position +
                          (event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1) +
                          available.length) %
                          available.length
                      ]
                    : undefined;
            if (!next || disabled) return;
            event.preventDefault();
            setCurrent(next.value);
            onChange?.(next.value);
            document
              .getElementById(`${id}-${entries.findIndex((entry) => entry.value === next.value)}`)
              ?.focus();
          }}
        >
          {option.icon && <span aria-hidden="true">{option.icon}</span>}
          {option.label}
        </button>
      ))}
      {name && (
        <FormValue
          value={current}
          name={name}
          form={form}
          disabled={disabled}
          triggerRef={trigger}
        />
      )}
    </div>
  );
});
