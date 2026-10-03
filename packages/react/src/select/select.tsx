import { Check, ChevronDown, X } from 'lucide-react';
import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { useLeafConfig } from '../config-provider/config-provider';
import { useFormField } from '../form/form';
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
  searchLabel?: string;
}
interface SelectBaseProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'type' | 'size' | 'value' | 'defaultValue' | 'onChange' | 'children' | 'multiple'
  > {
  options: readonly SelectOption[];
  size?: ControlSize;
  status?: ControlStatus;
  allowClear?: boolean;
  showSearch?: boolean;
  filterOption?: boolean | ((query: string, option: SelectOption) => boolean);
  onSearch?: (query: string) => void;
  onOpenChange?: (open: boolean) => void;
}
export type SelectProps = SelectBaseProps &
  (
    | {
        multiple?: false;
        value?: string;
        defaultValue?: string;
        onChange?: (value: string, option?: SelectOption) => void;
      }
    | {
        multiple: true;
        value?: readonly string[];
        defaultValue?: readonly string[];
        onChange?: (value: string[], options: SelectOption[]) => void;
      }
  );
const empty: readonly string[] = [];
const searchText = (option: SelectOption) =>
  option.searchLabel ??
  (typeof option.label === 'string' || typeof option.label === 'number'
    ? String(option.label)
    : option.value);
export const Select = forwardRef<HTMLInputElement, SelectProps>(
  function Select(props, forwardedRef) {
    const {
      options,
      size = 'md',
      status: statusProp,
      placeholder,
      value,
      defaultValue,
      name,
      required: requiredProp,
      allowClear = false,
      form,
      className,
      style,
      disabled: disabledProp,
      id: idProp,
      onOpenChange,
      onClick,
      onKeyDown,
      onBlur,
      multiple = false,
      showSearch = false,
      filterOption = true,
      onSearch,
      onChange: _onChange,
      ...inputProps
    } = props;
    const { messages } = useLeafConfig();
    const field = useFormField();
    const disabled = disabledProp ?? field?.disabled;
    const required = requiredProp ?? field?.required;
    const status = statusProp ?? (field?.error ? 'error' : undefined);
    const root = useRef<HTMLDivElement>(null);
    const input = useRef<HTMLInputElement>(null);
    const panel = useRef<HTMLDivElement>(null);
    const merged = useMergedRef(input, forwardedRef);
    const panelId = `${useId()}-listbox`;
    const [selected, setSelected] = useFieldValue<string | readonly string[]>(
      value,
      defaultValue ?? (multiple ? empty : ''),
      input,
      form,
    );
    const values = typeof selected === 'string' ? (selected ? [selected] : []) : selected;
    const selectedOptions = options.filter((option) => values.includes(option.value));
    const [query, setQuery] = useState('');
    const [open, setOpen] = usePopupState(disabled, onOpenChange);
    const [highlighted, setHighlighted] = useState(-1);
    const filtered =
      !query || !showSearch || filterOption === false
        ? options
        : options.filter((option) =>
            typeof filterOption === 'function'
              ? filterOption(query, option)
              : searchText(option).toLocaleLowerCase().includes(query.toLocaleLowerCase()),
          );
    const updateQuery = (next: string) => {
      setQuery(next);
      onSearch?.(next);
    };
    const close = () => {
      setOpen(false);
      if (query) updateQuery('');
    };
    useFloatingDismiss(open, close, input, panel, root);
    useActiveOption(open, highlighted >= 0 ? `${panelId}-${highlighted}` : undefined);
    useEffect(() => {
      if (!open) setQuery('');
    }, [open]);
    const change = (next: readonly string[]) => {
      setSelected(multiple ? next : (next[0] ?? ''));
      if (props.multiple)
        props.onChange?.(
          [...next],
          options.filter((option) => next.includes(option.value)),
        );
      else
        props.onChange?.(
          next[0] ?? '',
          options.find((option) => option.value === next[0]),
        );
    };
    const openMenu = () => {
      if (disabled) return;
      const active = filtered.findIndex(
        (option) => values.includes(option.value) && !option.disabled,
      );
      setHighlighted(active >= 0 ? active : filtered.findIndex((option) => !option.disabled));
      setOpen(true);
    };
    const selectOption = (option: SelectOption) => {
      if (option.disabled) return;
      change(
        multiple
          ? values.includes(option.value)
            ? values.filter((value) => value !== option.value)
            : [...values, option.value]
          : [option.value],
      );
      if (multiple) updateQuery('');
      else close();
      input.current?.focus();
    };
    const move = (direction: number) => {
      if (!filtered.length) return;
      let next = highlighted < 0 ? (direction > 0 ? -1 : filtered.length) : highlighted;
      for (let i = 0; i < filtered.length; i++) {
        next = (next + direction + filtered.length) % filtered.length;
        if (!filtered[next]?.disabled) {
          setHighlighted(next);
          break;
        }
      }
    };
    const displayLabel = selectedOptions[0]?.label;
    const textLabel =
      typeof displayLabel === 'string' || typeof displayLabel === 'number'
        ? String(displayLabel)
        : '';
    const inputValue = multiple || (showSearch && open) ? query : textLabel;
    const clearable = allowClear && values.length > 0 && !disabled;
    return (
      <div
        ref={root}
        className={classes(
          'leaf-select',
          `leaf-select--${size}`,
          multiple && 'leaf-select--multiple',
          className,
        )}
        style={style}
        data-status={status}
        data-disabled={disabled ? '' : undefined}
        data-open={open ? '' : undefined}
        data-clearable={clearable ? '' : undefined}
      >
        <div className="leaf-select__content">
          {multiple &&
            values.map((value) => {
              const option = options.find((option) => option.value === value);
              return (
                <span key={value} className="leaf-select__tag">
                  <span>{option?.label ?? value}</span>
                  {!disabled && !option?.disabled && (
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-label={`${messages.remove} ${option ? searchText(option) : value}`}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        change(values.filter((item) => item !== value));
                        input.current?.focus();
                      }}
                    >
                      <X size={12} aria-hidden="true" />
                    </button>
                  )}
                </span>
              );
            })}
          <div className="leaf-select__input-wrap">
            {!multiple &&
              !query &&
              displayLabel != null &&
              (!textLabel || (showSearch && open)) && (
                <span className="leaf-select__value">{displayLabel}</span>
              )}
            <input
              {...inputProps}
              ref={merged}
              id={idProp ?? field?.id}
              form={form}
              type="text"
              className="leaf-select__input"
              disabled={disabled}
              readOnly={!showSearch || inputProps.readOnly}
              value={inputValue}
              placeholder={values.length ? '' : (placeholder ?? messages.select)}
              autoComplete="off"
              role="combobox"
              aria-expanded={open}
              aria-haspopup="listbox"
              aria-controls={panelId}
              aria-autocomplete={showSearch ? 'list' : undefined}
              aria-activedescendant={
                open && filtered[highlighted] ? `${panelId}-${highlighted}` : undefined
              }
              aria-required={required || undefined}
              aria-invalid={status === 'error' ? true : inputProps['aria-invalid']}
              aria-describedby={
                [inputProps['aria-describedby'], field?.descriptionId].filter(Boolean).join(' ') ||
                undefined
              }
              onClick={(event) => {
                onClick?.(event);
                if (!event.defaultPrevented) {
                  if (open && !showSearch) close();
                  else if (!open) openMenu();
                }
              }}
              onBlur={(event) => {
                onBlur?.(event);
                if (
                  !event.defaultPrevented &&
                  !root.current?.contains(event.relatedTarget) &&
                  !panel.current?.contains(event.relatedTarget)
                )
                  close();
              }}
              onChange={(event) => {
                if (!open) openMenu();
                updateQuery(event.target.value);
                setHighlighted(-1);
              }}
              onKeyDown={(event) => {
                onKeyDown?.(event);
                if (event.defaultPrevented || event.nativeEvent.isComposing) return;
                if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                  event.preventDefault();
                  if (!open) openMenu();
                  else move(event.key === 'ArrowDown' ? 1 : -1);
                } else if ((event.key === 'Home' || event.key === 'End') && open && !showSearch) {
                  event.preventDefault();
                  const candidates = filtered
                    .map((option, index) => ({ option, index }))
                    .filter(({ option }) => !option.disabled);
                  setHighlighted(
                    (event.key === 'Home' ? candidates[0] : candidates.at(-1))?.index ?? -1,
                  );
                } else if (event.key === 'Enter' || (event.key === ' ' && !showSearch)) {
                  event.preventDefault();
                  if (!open) openMenu();
                  else {
                    const option =
                      filtered[highlighted] ?? filtered.find((option) => !option.disabled);
                    if (option) selectOption(option);
                  }
                } else if (event.key === 'Escape' && open) {
                  event.preventDefault();
                  event.stopPropagation();
                  close();
                } else if (event.key === 'Tab' && open) close();
                else if (event.key === 'Backspace' && multiple && !query && !inputProps.readOnly) {
                  const last = [...values]
                    .reverse()
                    .find((value) => !options.find((option) => option.value === value)?.disabled);
                  if (last) {
                    event.preventDefault();
                    change(values.filter((value) => value !== last));
                  }
                }
              }}
            />
          </div>
        </div>
        <button
          type="button"
          className="leaf-select__arrow"
          tabIndex={-1}
          disabled={disabled}
          aria-label={messages.select}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            if (open) close();
            else openMenu();
            input.current?.focus();
          }}
        >
          <ChevronDown size={16} aria-hidden="true" />
        </button>
        {clearable && (
          <ClearButton
            label={messages.clearSelection}
            beforeArrow
            onClear={() => {
              change(empty);
              close();
              input.current?.focus();
            }}
          />
        )}
        <FormValue
          name={multiple ? undefined : name}
          form={form}
          value={multiple ? values.join(',') : (values[0] ?? '')}
          disabled={disabled}
          required={required}
          triggerRef={input}
        />
        {multiple &&
          values.map((value) => (
            <input
              key={value}
              type="hidden"
              name={name}
              form={form}
              value={value}
              disabled={disabled}
            />
          ))}
        <FloatingPanel
          open={open}
          triggerRef={root}
          panelRef={panel}
          matchWidth
          id={panelId}
          className="leaf-floating leaf-select__panel"
          role="listbox"
          aria-label={inputProps['aria-label'] ?? messages.select}
          aria-multiselectable={multiple || undefined}
        >
          {filtered.length ? (
            filtered.map((option, index) => (
              <button
                key={option.value}
                id={`${panelId}-${index}`}
                type="button"
                role="option"
                aria-selected={values.includes(option.value)}
                aria-disabled={option.disabled || undefined}
                data-highlighted={highlighted === index || undefined}
                className="leaf-floating__option"
                disabled={option.disabled}
                tabIndex={-1}
                onMouseEnter={() => {
                  if (!option.disabled) setHighlighted(index);
                }}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectOption(option)}
              >
                <span>{option.label}</span>
                <Check
                  size={15}
                  aria-hidden="true"
                  style={{ opacity: values.includes(option.value) ? 1 : 0 }}
                />
              </button>
            ))
          ) : (
            <div className="leaf-floating__empty">{messages.empty}</div>
          )}
        </FloatingPanel>
      </div>
    );
  },
);
Select.displayName = 'Select';
