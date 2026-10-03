import { forwardRef, type InputHTMLAttributes, useId, useRef, useState } from 'react';
import { useLeafConfig } from '../config-provider/config-provider';
import { useFormField } from '../form/form';
import { classes } from '../shared/classes';
import { useFieldValue, useMergedRef } from '../shared/field';
import {
  FloatingPanel,
  useActiveOption,
  useFloatingDismiss,
  usePopupState,
} from '../shared/floating';
import type { ControlSize, ControlStatus } from '../shared/types';

export interface AutoCompleteOption {
  value: string;
  label?: string;
  disabled?: boolean;
}

export interface AutoCompleteProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'size' | 'value' | 'defaultValue' | 'onChange' | 'onSelect' | 'type' | 'list' | 'children'
  > {
  options: readonly AutoCompleteOption[];
  value?: string;
  defaultValue?: string;
  size?: ControlSize;
  status?: ControlStatus;
  filterOption?: false | ((query: string, option: AutoCompleteOption) => boolean);
  onChange?: (value: string) => void;
  onSelect?: (value: string, option: AutoCompleteOption) => void;
  onSearch?: (query: string) => void;
}

export const AutoComplete = forwardRef<HTMLInputElement, AutoCompleteProps>(function AutoComplete(
  {
    options,
    value,
    defaultValue = '',
    size = 'md',
    status: statusProp,
    filterOption,
    disabled: disabledProp,
    readOnly,
    className,
    style,
    form,
    onChange,
    onSelect,
    onSearch,
    onKeyDown,
    onFocus,
    autoComplete = 'off',
    'aria-label': ariaLabel,
    'aria-invalid': ariaInvalid,
    ...props
  },
  forwardedRef,
) {
  const field = useFormField();
  const disabled = disabledProp ?? field?.disabled;
  const status = statusProp ?? (field?.error ? 'error' : undefined);
  const { locale, messages } = useLeafConfig();
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const ref = useMergedRef(inputRef, forwardedRef);
  const [text, setText] = useFieldValue(value, defaultValue, inputRef, form);
  const [open, setOpen] = usePopupState(disabled || readOnly);
  const [active, setActive] = useState(-1);
  const listId = `${useId()}-suggestions`;
  const visibleOptions = options.filter((option) => {
    if (filterOption === false) return true;
    if (filterOption) return filterOption(text, option);
    return (option.label ?? option.value).toLocaleLowerCase().includes(text.toLocaleLowerCase());
  });
  const expanded = open && !disabled && !readOnly;
  useFloatingDismiss(expanded, () => setOpen(false), inputRef, panelRef);
  useActiveOption(expanded, visibleOptions[active] ? `${listId}-${active}` : undefined);

  const select = (option: AutoCompleteOption) => {
    if (option.disabled) return;
    setText(option.value);
    onChange?.(option.value);
    onSelect?.(option.value, option);
    setOpen(false);
    setActive(-1);
    inputRef.current?.focus();
  };

  const move = (direction: number) => {
    let index = active < 0 ? (direction > 0 ? -1 : visibleOptions.length) : active;
    for (let step = 0; step < visibleOptions.length; step += 1) {
      index = (index + direction + visibleOptions.length) % visibleOptions.length;
      if (!visibleOptions[index]?.disabled) {
        setActive(index);
        break;
      }
    }
  };

  return (
    <div
      className={classes('leaf-autocomplete', `leaf-autocomplete--${size}`, className)}
      style={style}
      data-status={status}
      data-disabled={disabled ? '' : undefined}
    >
      <input
        {...props}
        id={props.id ?? field?.id}
        required={props.required ?? field?.required}
        aria-describedby={
          [props['aria-describedby'], field?.descriptionId].filter(Boolean).join(' ') || undefined
        }
        ref={ref}
        type="text"
        form={form}
        className="leaf-autocomplete__input"
        disabled={disabled}
        readOnly={readOnly}
        value={text}
        autoComplete={autoComplete}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-haspopup="listbox"
        aria-controls={listId}
        aria-activedescendant={
          expanded && visibleOptions[active] ? `${listId}-${active}` : undefined
        }
        aria-label={ariaLabel}
        aria-invalid={status === 'error' ? true : ariaInvalid}
        onFocus={(event) => {
          onFocus?.(event);
          if (!event.defaultPrevented && !readOnly) setOpen(true);
        }}
        onChange={(event) => {
          const next = event.target.value;
          setText(next);
          setActive(-1);
          setOpen(true);
          onChange?.(next);
          onSearch?.(next);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || event.nativeEvent.isComposing || readOnly) return;
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            setOpen(true);
            move(event.key === 'ArrowDown' ? 1 : -1);
          } else if (event.key === 'Enter' && expanded && visibleOptions[active]) {
            event.preventDefault();
            const option = visibleOptions[active];
            if (option) select(option);
          } else if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            setOpen(false);
          } else if (event.key === 'Tab') setOpen(false);
        }}
      />
      <FloatingPanel
        open={expanded}
        triggerRef={inputRef}
        panelRef={panelRef}
        matchWidth
        id={listId}
        className="leaf-floating"
        role="listbox"
        aria-label={
          ariaLabel
            ? `${ariaLabel} ${locale === 'en-US' ? 'suggestions' : '建议'}`
            : messages.noMatches
        }
      >
        {visibleOptions.length ? (
          visibleOptions.map((option, index) => (
            <button
              key={option.value}
              id={`${listId}-${index}`}
              type="button"
              role="option"
              tabIndex={-1}
              aria-selected={active === index}
              disabled={option.disabled}
              aria-disabled={option.disabled || undefined}
              className="leaf-floating__option"
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => !option.disabled && setActive(index)}
              onClick={() => select(option)}
            >
              {option.label ?? option.value}
            </button>
          ))
        ) : (
          <div className="leaf-floating__empty">{messages.noMatches}</div>
        )}
      </FloatingPanel>
    </div>
  );
});
AutoComplete.displayName = 'AutoComplete';
