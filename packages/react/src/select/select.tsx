import { Check, ChevronDown } from 'lucide-react';
import {
  type ButtonHTMLAttributes,
  forwardRef,
  type ReactNode,
  useId,
  useRef,
  useState,
} from 'react';
import { classes } from '../shared/classes';
import { ClearButton } from '../shared/clear-button';
import { FormValue, useFieldValue, useMergedRef } from '../shared/field';
import {
  FloatingPanel,
  useActiveOption,
  useFloatingDismiss,
  usePopupState,
} from '../shared/floating';
import type { ControlSize, ControlStatus } from '../shared/types';

export interface SelectOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'type' | 'value' | 'defaultValue' | 'onChange' | 'children'
  > {
  options: readonly SelectOption[];
  size?: ControlSize;
  status?: ControlStatus;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  name?: string;
  required?: boolean;
  allowClear?: boolean;
  form?: string;
  onChange?: (value: string, option?: SelectOption) => void;
  onOpenChange?: (open: boolean) => void;
}

export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(
  {
    options,
    size = 'md',
    status,
    placeholder = '请选择',
    value,
    defaultValue = '',
    name,
    required,
    allowClear = false,
    form,
    className,
    style,
    disabled,
    id,
    onChange,
    onOpenChange,
    onClick,
    onKeyDown,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    ...props
  },
  forwardedRef,
) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const panelId = `${generatedId}-listbox`;
  const [selectedValue, setSelectedValue] = useFieldValue(value, defaultValue, triggerRef, form);
  const [open, setOpen] = usePopupState(disabled, onOpenChange);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const selectedIndex = options.findIndex((option) => option.value === selectedValue);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  const setTriggerRef = useMergedRef(triggerRef, forwardedRef);

  const close = () => {
    setOpen(false);
  };

  useFloatingDismiss(open, close, triggerRef, panelRef);
  useActiveOption(open, highlightedIndex >= 0 ? `${panelId}-${highlightedIndex}` : undefined);

  const openMenu = () => {
    if (disabled) {
      return;
    }
    setHighlightedIndex(
      selectedIndex >= 0 && !options[selectedIndex]?.disabled
        ? selectedIndex
        : options.findIndex((item) => !item.disabled),
    );
    setOpen(true);
  };

  const selectOption = (option: SelectOption, index: number) => {
    if (option.disabled) {
      return;
    }
    setSelectedValue(option.value);
    setHighlightedIndex(index);
    onChange?.(option.value, option);
    close();
    triggerRef.current?.focus();
  };

  const moveHighlight = (direction: 1 | -1) => {
    if (!options.length) {
      return;
    }
    let next = highlightedIndex < 0 ? (direction > 0 ? -1 : options.length) : highlightedIndex;
    for (let step = 0; step < options.length; step += 1) {
      next = (next + direction + options.length) % options.length;
      if (!options[next]?.disabled) {
        setHighlightedIndex(next);
        break;
      }
    }
  };

  return (
    <div
      className={classes('leaf-select', `leaf-select--${size}`, className)}
      style={style}
      data-status={status}
      data-disabled={disabled ? '' : undefined}
      data-open={open ? '' : undefined}
      data-clearable={allowClear && selectedValue && !disabled ? '' : undefined}
    >
      <button
        {...props}
        ref={setTriggerRef}
        id={id}
        form={form}
        type="button"
        className="leaf-select__trigger"
        disabled={disabled}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={panelId}
        aria-activedescendant={
          open && highlightedIndex >= 0 ? `${panelId}-${highlightedIndex}` : undefined
        }
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-invalid={status === 'error' ? true : ariaInvalid}
        aria-required={required || undefined}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) {
            if (open) {
              close();
            } else {
              openMenu();
            }
          }
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) {
            return;
          }
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (!open) {
              openMenu();
            } else {
              moveHighlight(1);
            }
          } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (!open) {
              openMenu();
            } else {
              moveHighlight(-1);
            }
          } else if ((event.key === 'Home' || event.key === 'End') && open) {
            event.preventDefault();
            const candidates = options
              .map((option, index) => ({ option, index }))
              .filter(({ option }) => !option.disabled);
            setHighlightedIndex(
              (event.key === 'Home' ? candidates[0] : candidates.at(-1))?.index ?? -1,
            );
          } else if ((event.key === 'Enter' || event.key === ' ') && open) {
            event.preventDefault();
            const option = options[highlightedIndex];
            if (option) {
              selectOption(option, highlightedIndex);
            }
          } else if (event.key === 'Escape' && open) {
            event.preventDefault();
            event.stopPropagation();
            close();
          } else if (event.key === 'Tab' && open) {
            close();
          }
        }}
      >
        <span
          className={classes(
            'leaf-select__value',
            !selectedOption && 'leaf-select__value--placeholder',
          )}
        >
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronDown className="leaf-select__arrow" aria-hidden="true" />
      </button>
      {allowClear && selectedValue && !disabled && (
        <ClearButton
          label="清除选择"
          beforeArrow
          onClear={() => {
            setSelectedValue('');
            onChange?.('', undefined);
            close();
            triggerRef.current?.focus();
          }}
        />
      )}
      <FormValue
        name={name}
        form={form}
        value={selectedValue}
        disabled={disabled}
        required={required}
        triggerRef={triggerRef}
      />
      {open && (
        <FloatingPanel
          triggerRef={triggerRef}
          panelRef={panelRef}
          matchWidth
          id={panelId}
          className="leaf-floating leaf-select__panel"
          role="listbox"
          aria-label={ariaLabel || '可选项'}
        >
          {options.length ? (
            options.map((option, index) => (
              <button
                key={option.value}
                id={`${panelId}-${index}`}
                type="button"
                role="option"
                aria-selected={option.value === selectedValue}
                aria-disabled={option.disabled || undefined}
                data-highlighted={highlightedIndex === index || undefined}
                className="leaf-floating__option"
                disabled={option.disabled}
                tabIndex={-1}
                onMouseEnter={() => !option.disabled && setHighlightedIndex(index)}
                onClick={() => selectOption(option, index)}
              >
                <span>{option.label}</span>
                {option.value === selectedValue && <Check size={15} aria-hidden="true" />}
              </button>
            ))
          ) : (
            <div className="leaf-floating__empty">暂无选项</div>
          )}
        </FloatingPanel>
      )}
    </div>
  );
});

Select.displayName = 'Select';
