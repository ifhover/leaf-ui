import { useVirtualizer } from '@tanstack/react-virtual';
import {
  type CSSProperties,
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { useComponentProps } from '../config-provider/component-defaults';
import { useLeafConfig } from '../config-provider/context';
import { estimateControlHeight } from '../density';
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
import { FloatingFeedback } from '../shared/floating-feedback';
import { FloatingHighlight, useFloatingHighlight } from '../shared/floating-highlight';
import type { ControlSize, ControlStatus } from '../shared/types';
import { useFormattedText } from '../shared/use-formatted-text';

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
  popupWidth?: number | string;
  popupMaxWidth?: number | string;
  popupPlacement?: PopupOptions['popupPlacement'];
  popupClassName?: string;
  popupStyle?: PopupOptions['popupStyle'];
  popupRender?: PopupOptions['popupRender'];
  getPopupContainer?: PopupOptions['getPopupContainer'];
}

export const AutoComplete = forwardRef<HTMLInputElement, AutoCompleteProps>(function AutoComplete(
  rawProps: AutoCompleteProps,
  forwardedRef,
) {
  const {
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
    optionHeight: optionHeightProp,
    popupWidth = 'trigger',
    popupMaxWidth,
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
  } = useComponentProps('AutoComplete', rawProps);
  const field = useFormField();
  const disabled = disabledProp || field?.disabled;
  const status = statusProp ?? (field?.error ? 'error' : undefined);
  const { messages, theme, density } = useLeafConfig();
  const format = useFormattedText();
  const optionHeight = optionHeightProp ?? Math.max(24, estimateControlHeight(theme, density));
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
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
  const hasSuggestions = visibleOptions.length > 0 && !errorContent;
  const listboxProps = {
    id: listId,
    role: 'listbox' as const,
    'aria-busy': loading || undefined,
    'aria-label': ariaLabel
      ? format('autoComplete.suggestions', { label: ariaLabel })
      : messages.autoComplete.empty,
  };
  useFloatingDismiss(expanded, () => setOpen(false), inputRef, panelRef);
  useActiveOption(expanded, visibleOptions[active] ? `${listId}-${active}` : undefined, panelRef);
  const highlight = useFloatingHighlight(
    expanded,
    panelRef,
    visibleOptions[active] ? `${listId}-${active}` : undefined,
    `${text}:${visibleOptions[active]?.value}:${visibleOptions.length}:${virtualizer.range?.startIndex}:${virtualizer.range?.endIndex}`,
  );

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
      ref={rootRef}
      className={classes('leaf-autocomplete', `leaf-autocomplete--${size}`, className)}
      style={style}
      data-status={status}
      data-disabled={disabled ? '' : undefined}
      data-open={open ? '' : undefined}
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
          label={messages.input.clear}
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
        triggerRef={rootRef}
        panelRef={panelRef}
        matchWidth={popupWidth === 'trigger'}
        width={
          popupWidth === 'trigger' ? undefined : popupWidth === 'auto' ? 'max-content' : popupWidth
        }
        maxWidth={popupMaxWidth}
        {...(hasSuggestions ? listboxProps : {})}
        className={classes('leaf-floating', 'leaf-autocomplete__panel', popupClassName)}
        data-hover-motion=""
        data-selection="candidate"
        placement={popupPlacement}
        style={
          {
            maxHeight: listHeight,
            '--leaf-autocomplete-option-height': `${optionHeight}px`,
            ...popupStyle,
          } as CSSProperties
        }
        container={getPopupContainer}
        render={popupRender}
      >
        {!hasSuggestions && <div {...listboxProps} />}
        <FloatingHighlight style={highlight} />
        {loading && !visibleOptions.length ? (
          <FloatingFeedback loading>{messages.common.loading}</FloatingFeedback>
        ) : errorContent ? (
          <div className="leaf-floating__empty" role="alert">
            {errorContent}
          </div>
        ) : visibleOptions.length ? (
          <div
            className={virtual ? undefined : 'leaf-floating__options'}
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
                      <span className="leaf-floating__option-label">
                        {optionRender?.(option) ?? option.label ?? option.value}
                      </span>
                    </button>
                  </div>
                ),
            )}
          </div>
        ) : (
          <FloatingFeedback>{notFoundContent ?? messages.autoComplete.empty}</FloatingFeedback>
        )}
      </FloatingPanel>
    </div>
  );
});
AutoComplete.displayName = 'AutoComplete';
