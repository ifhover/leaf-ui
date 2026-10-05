import { useVirtualizer } from '@tanstack/react-virtual';
import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { useLeafConfig } from '../config-provider/context';
import { useFormField } from '../form/form';
import { classes } from '../shared/classes';
import { ClearButton } from '../shared/clear-button';
import { useFieldValue, useMergedRef } from '../shared/field';
import type { PopupOptions } from '../shared/floating';
import {
  FloatingPanel,
  useActiveOption,
  useFloatingDismiss,
  usePopupState,
} from '../shared/floating';
import type { ControlSize, ControlStatus } from '../shared/types';

export interface AutoCompleteOption {
  value: string;
  label?: ReactNode;
  searchLabel?: string;
  disabled?: boolean;
}
export interface AutoCompleteOptionGroup {
  label: ReactNode;
  options: readonly AutoCompleteOption[];
}

export interface AutoCompleteProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'size' | 'value' | 'defaultValue' | 'onChange' | 'onSelect' | 'type' | 'list' | 'children'
  > {
  options: readonly (AutoCompleteOption | AutoCompleteOptionGroup)[];
  value?: string;
  defaultValue?: string;
  size?: ControlSize;
  status?: ControlStatus;
  filterOption?: false | ((query: string, option: AutoCompleteOption) => boolean);
  onChange?: (value: string) => void;
  onSelect?: (value: string, option: AutoCompleteOption) => void;
  onSearch?: (query: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  loading?: boolean;
  notFoundContent?: ReactNode;
  errorContent?: ReactNode;
  optionRender?: (option: AutoCompleteOption) => ReactNode;
  allowClear?: boolean;
  virtual?: boolean;
  listHeight?: number;
  optionHeight?: number;
  popupPlacement?: PopupOptions['popupPlacement'];
  popupClassName?: string;
  popupStyle?: PopupOptions['popupStyle'];
  popupRender?: PopupOptions['popupRender'];
  getPopupContainer?: PopupOptions['getPopupContainer'];
}

export const AutoComplete = forwardRef<HTMLInputElement, AutoCompleteProps>(function AutoComplete(
  {
    options: entries,
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
    open: controlledOpen,
    defaultOpen,
    onOpenChange,
    loading,
    notFoundContent,
    errorContent,
    optionRender,
    allowClear,
    virtual: virtualProp,
    listHeight = 248,
    optionHeight = 36,
    popupPlacement,
    popupClassName,
    popupStyle,
    popupRender,
    getPopupContainer,
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
  const disabled = disabledProp || field?.disabled;
  const status = statusProp ?? (field?.error ? 'error' : undefined);
  const { locale, messages } = useLeafConfig();
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const ref = useMergedRef(inputRef, forwardedRef);
  const [text, setText] = useFieldValue(value, defaultValue, inputRef, form);
  const [open, setOpen] = usePopupState(
    disabled || readOnly,
    onOpenChange,
    controlledOpen,
    defaultOpen,
  );
  const [active, setActive] = useState(-1);
  const listId = `${useId()}-suggestions`;
  const options = entries.flatMap((entry) => ('options' in entry ? [...entry.options] : [entry]));
  const groups = new Map(
    entries.flatMap((entry) =>
      'options' in entry ? entry.options.map((option) => [option.value, entry.label] as const) : [],
    ),
  );
  const visibleOptions = options.filter((option) => {
    if (filterOption === false) return true;
    if (filterOption) return filterOption(text, option);
    return (option.searchLabel ?? (typeof option.label === 'string' ? option.label : option.value))
      .toLocaleLowerCase()
      .includes(text.toLocaleLowerCase());
  });
  const virtual = virtualProp ?? visibleOptions.length > 100;
  const virtualizer = useVirtualizer({
    count: visibleOptions.length,
    getScrollElement: () => panelRef.current,
    estimateSize: () => optionHeight,
    enabled: open && virtual,
    initialRect: { height: listHeight, width: 240 },
    overscan: 5,
  });
  useEffect(() => {
    if (open && virtual && active >= 0) virtualizer.scrollToIndex(active, { align: 'auto' });
  }, [open, virtual, active, virtualizer]);
  const expanded = open && !disabled && !readOnly;
  useFloatingDismiss(expanded, () => setOpen(false), inputRef, panelRef);
  useActiveOption(expanded, visibleOptions[active] ? `${listId}-${active}` : undefined, panelRef);

  const select = (option: AutoCompleteOption) => {
    if (option.disabled || readOnly || disabled) return;
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
      data-clearable={allowClear && text && !disabled && !readOnly ? '' : undefined}
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
      {allowClear && text && !disabled && !readOnly && (
        <ClearButton
          label={messages.clearInput}
          onClear={() => {
            setText('');
            onChange?.('');
            onSearch?.('');
            inputRef.current?.focus();
          }}
        />
      )}
      <FloatingPanel
        open={expanded}
        triggerRef={inputRef}
        panelRef={panelRef}
        matchWidth
        id={listId}
        className={classes('leaf-floating', popupClassName)}
        placement={popupPlacement}
        style={{ maxHeight: listHeight, ...popupStyle }}
        container={getPopupContainer}
        render={popupRender}
        role="listbox"
        aria-busy={loading || undefined}
        aria-label={
          ariaLabel
            ? `${ariaLabel} ${locale === 'en-US' ? 'suggestions' : '建议'}`
            : messages.noMatches
        }
      >
        {loading && !visibleOptions.length ? (
          <div className="leaf-floating__empty">{messages.loading}</div>
        ) : errorContent ? (
          <div className="leaf-floating__empty" role="alert">
            {errorContent}
          </div>
        ) : visibleOptions.length ? (
          <div
            style={
              virtual ? { height: virtualizer.getTotalSize(), position: 'relative' } : undefined
            }
          >
            {(virtual
              ? virtualizer.getVirtualItems().map((item) => ({
                  option: visibleOptions[item.index],
                  index: item.index,
                  start: item.start,
                }))
              : visibleOptions.map((option, index) => ({ option, index, start: 0 }))
            ).map(
              ({ option, index, start }) =>
                option && (
                  <div
                    key={option.value}
                    ref={virtual ? virtualizer.measureElement : undefined}
                    data-index={virtual ? index : undefined}
                    style={
                      virtual
                        ? {
                            position: 'absolute',
                            top: 0,
                            insetInlineStart: 0,
                            width: '100%',
                            transform: `translateY(${start}px)`,
                          }
                        : undefined
                    }
                  >
                    {groups.has(option.value) &&
                      (index === 0 ||
                        groups.get(visibleOptions[index - 1]?.value ?? '') !==
                          groups.get(option.value)) && (
                        <div className="leaf-select__group">{groups.get(option.value)}</div>
                      )}
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
                      {optionRender?.(option) ?? option.label ?? option.value}
                    </button>
                  </div>
                ),
            )}
          </div>
        ) : (
          <div className="leaf-floating__empty">{notFoundContent ?? messages.noMatches}</div>
        )}
      </FloatingPanel>
    </div>
  );
});
AutoComplete.displayName = 'AutoComplete';
