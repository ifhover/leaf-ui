import { useVirtualizer } from '@tanstack/react-virtual';
import { Check, ChevronDown, LoaderCircle, Plus } from 'lucide-react';
import {
  type CSSProperties,
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useComponentProps } from '../config-provider/component-defaults';
import { useLeafConfig } from '../config-provider/context';
import { estimateControlHeight } from '../density';
import { useFormField } from '../form/form';
import { classes } from '../shared/classes';
import { ClearButton } from '../shared/clear-button';
import { FormValue, useFieldValue, useMergedRef } from '../shared/field';
import {
  FloatingPanel,
  type PopupOptions,
  useActiveOption,
  useFloatingDismiss,
  usePopupState,
} from '../shared/floating';
import { FloatingFeedback } from '../shared/floating-feedback';
import { SelectionContent } from '../shared/selection-content';
import type { ControlSize, ControlStatus } from '../shared/types';
import { useFormattedText } from '../shared/use-formatted-text';

export interface SelectOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
  searchLabel?: string;
}
export interface SelectOptionGroup {
  label: ReactNode;
  options: readonly SelectOption[];
}
interface SelectBaseProps
  extends Omit<
      InputHTMLAttributes<HTMLInputElement>,
      'type' | 'size' | 'value' | 'defaultValue' | 'onChange' | 'children' | 'multiple'
    >,
    PopupOptions {
  options: readonly (SelectOption | SelectOptionGroup)[];
  size?: ControlSize;
  status?: ControlStatus;
  allowClear?: boolean;
  showSearch?: boolean;
  filterOption?: boolean | ((query: string, option: SelectOption) => boolean);
  onSearch?: (query: string) => void;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  defaultOpen?: boolean;
  inputReadOnly?: boolean;
  labelRender?: (option: SelectOption) => ReactNode;
  tagRender?: (option: SelectOption, remove: () => void) => ReactNode;
  popupRender?: (content: ReactNode) => ReactNode;
  onPopupScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
  popupWidth?: number | string;
  popupMaxWidth?: number | string;
  popupClassName?: string;
  popupStyle?: CSSProperties;
  loading?: boolean;
  notFoundContent?: ReactNode;
  optionRender?: (option: SelectOption) => ReactNode;
  maxCount?: number;
  maxTagCount?: number | 'responsive';
  tagWrap?: boolean;
  allowCreate?: boolean;
  onCreate?: (option: SelectOption) => void;
  virtual?: boolean;
  listHeight?: number;
  optionHeight?: number;
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
/** Internal rendering primitive; public Select defaults are resolved at its boundary. */
export const SelectControl = forwardRef<HTMLInputElement, SelectProps>(function SelectControl(
  props: SelectProps,
  forwardedRef,
) {
  const {
    options: suppliedOptions,
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
    open: controlledOpen,
    defaultOpen,
    inputReadOnly,
    labelRender,
    tagRender,
    popupRender,
    onPopupScroll,
    onClick,
    onKeyDown,
    onBeforeInput,
    onCompositionStart,
    onPaste,
    onBlur,
    multiple = false,
    showSearch: searchProp = false,
    filterOption = true,
    onSearch,
    popupWidth = 'trigger',
    popupMaxWidth,
    popupClassName,
    popupStyle,
    popupPlacement,
    getPopupContainer,
    loading = false,
    notFoundContent,
    optionRender,
    maxCount,
    maxTagCount,
    tagWrap = true,
    allowCreate = false,
    onCreate,
    virtual: virtualProp,
    listHeight = 248,
    optionHeight: optionHeightProp,
    onChange: _onChange,
    ...inputProps
  } = props;
  const format = useFormattedText();
  const showSearch = searchProp || allowCreate;
  const [created, setCreated] = useState<SelectOption[]>([]);
  const baseOptions = useMemo(
    () => suppliedOptions.flatMap((entry) => ('options' in entry ? [...entry.options] : [entry])),
    [suppliedOptions],
  );
  const options = useMemo(
    () => [
      ...baseOptions,
      ...created.filter((entry) => !baseOptions.some((option) => option.value === entry.value)),
    ],
    [baseOptions, created],
  );
  const optionGroups = useMemo(
    () =>
      new Map(
        suppliedOptions.flatMap((entry) =>
          'options' in entry
            ? entry.options.map((option) => [option.value, entry.label] as const)
            : [],
        ),
      ),
    [suppliedOptions],
  );
  const virtual = virtualProp ?? options.length > 100;
  const { messages, theme, density, direction: configuredDirection } = useLeafConfig();
  const optionHeight = optionHeightProp ?? Math.max(24, estimateControlHeight(theme, density));
  const field = useFormField();
  const disabled = disabledProp || field?.disabled;
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
  const atLimit =
    multiple && maxCount !== undefined && values.length >= Math.max(0, Math.floor(maxCount));
  const unavailable = (option: SelectOption) =>
    option.disabled || (atLimit && !values.includes(option.value));
  const selectedCache = useRef(new Map<string, SelectOption>());
  const nextCache = new Map<string, SelectOption>();
  for (const key of values) {
    const record = options.find((option) => option.value === key) ?? selectedCache.current.get(key);
    if (record) nextCache.set(key, record);
  }
  selectedCache.current = nextCache;
  const selectedOptions = values.map((key) => nextCache.get(key) ?? { value: key, label: key });
  // null keeps the selected label in the native input until a search is edited.
  const [query, setQuery] = useState<string | null>(null);
  const searchQuery = query ?? '';
  const [open, setOpen] = usePopupState(
    disabled || inputProps.readOnly,
    onOpenChange,
    controlledOpen,
    defaultOpen,
  );
  const [highlighted, setHighlighted] = useState(-1);
  const matched =
    !searchQuery || !showSearch || filterOption === false
      ? options
      : options.filter((option) =>
          typeof filterOption === 'function'
            ? filterOption(searchQuery, option)
            : searchText(option).toLocaleLowerCase().includes(searchQuery.toLocaleLowerCase()),
        );
  const newValue = searchQuery.trim();
  const createOption =
    allowCreate &&
    newValue &&
    !options.some((option) => option.value === newValue || searchText(option) === newValue)
      ? { value: newValue, label: newValue }
      : null;
  const filtered = createOption ? [...matched, createOption] : matched;
  const rows = useMemo(() => {
    const entries: { key: string; option?: SelectOption; group?: ReactNode; index: number }[] = [];
    let previousGroup: ReactNode;
    filtered.forEach((option, index) => {
      const group = optionGroups.get(option.value);
      if (group !== undefined && group !== previousGroup)
        entries.push({ key: `group-${option.value}`, group, index: -1 });
      entries.push({ key: option.value, option, index });
      previousGroup = group;
    });
    return entries;
  }, [filtered, optionGroups]);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => panel.current,
    estimateSize: () => Math.max(24, optionHeight),
    overscan: 5,
    getItemKey: (index) => rows[index]?.key ?? index,
    enabled: open && virtual,
    initialRect: { height: listHeight, width: 240 },
  });
  useEffect(() => {
    if (open && virtual && highlighted >= 0) {
      const index = rows.findIndex((row) => row.index === highlighted);
      if (index >= 0) virtualizer.scrollToIndex(index, { align: 'auto' });
    }
  }, [open, virtual, highlighted, rows, virtualizer]);
  const updateQuery = (next: string) => {
    setQuery(next);
    onSearch?.(next);
  };
  const close = () => {
    setOpen(false);
    setQuery(null);
    if (searchQuery) onSearch?.('');
  };
  useFloatingDismiss(open, close, input, panel, root);
  useActiveOption(open, highlighted >= 0 ? `${panelId}-${highlighted}` : undefined, panel);
  useEffect(() => {
    if (!open) setQuery(null);
  }, [open]);
  const change = (next: readonly string[]) => {
    if (disabled || inputProps.readOnly) return;
    setSelected(multiple ? next : (next[0] ?? ''));
    if (props.multiple)
      props.onChange?.(
        [...next],
        [
          ...selectedOptions,
          ...options.filter((option) => !values.includes(option.value)),
          ...(createOption ? [createOption] : []),
        ].filter((option) => next.includes(option.value)),
      );
    else
      props.onChange?.(
        next[0] ?? '',
        [...options, ...(createOption ? [createOption] : [])].find(
          (option) => option.value === next[0],
        ),
      );
  };
  const selectionIndex = () =>
    filtered.findIndex((option) => values.includes(option.value) && !unavailable(option));
  const openMenu = () => {
    if (disabled || inputProps.readOnly) return;
    const active = filtered.findIndex(
      (option) => values.includes(option.value) && !unavailable(option),
    );
    setHighlighted(active >= 0 ? active : filtered.findIndex((option) => !unavailable(option)));
    setOpen(true);
  };
  const restoreSelectionHighlight = () =>
    setHighlighted((previous) => (previous === selectionIndex() ? previous : selectionIndex()));
  const beginSearch = () => {
    if (!showSearch || disabled || inputProps.readOnly || inputReadOnly) return;
    if (!multiple && query === null) input.current?.select();
    if (!open) openMenu();
  };
  const selectOption = (option: SelectOption) => {
    if (unavailable(option) || inputProps.readOnly) return;
    if (createOption && option.value === createOption.value) {
      setCreated((previous) => [...previous, option]);
      onCreate?.(option);
    }
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
      const candidate = filtered[next];
      if (candidate && !unavailable(candidate)) {
        setHighlighted(next);
        break;
      }
    }
  };
  const renderOption = (option: SelectOption, index: number) => (
    <button
      key={option.value}
      id={`${panelId}-${index}`}
      aria-posinset={index + 1}
      aria-setsize={filtered.length}
      type="button"
      role="option"
      aria-selected={values.includes(option.value)}
      aria-disabled={option.disabled || (atLimit && !values.includes(option.value)) || undefined}
      data-highlighted={highlighted === index || undefined}
      className="leaf-floating__option"
      disabled={option.disabled || (atLimit && !values.includes(option.value))}
      tabIndex={-1}
      onMouseEnter={() => {
        if (!unavailable(option)) setHighlighted(index);
      }}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => selectOption(option)}
    >
      <span className="leaf-floating__option-label">
        {createOption?.value === option.value ? (
          <>
            <Plus size={14} aria-hidden="true" />{' '}
            {format('select.create', {
              label: typeof option.label === 'string' ? option.label : option.value,
            })}
          </>
        ) : optionRender ? (
          optionRender(option)
        ) : (
          option.label
        )}
      </span>
      <Check size={15} aria-hidden="true" className="leaf-select__check" />
    </button>
  );
  const displayLabel = selectedOptions[0]
    ? (labelRender?.(selectedOptions[0]) ?? selectedOptions[0].label)
    : undefined;
  const textLabel =
    typeof displayLabel === 'string' || typeof displayLabel === 'number'
      ? String(displayLabel)
      : '';
  const inputValue = multiple ? searchQuery : showSearch && open ? (query ?? textLabel) : textLabel;
  const clearable = allowClear && values.length > 0 && !disabled && !inputProps.readOnly;
  const controlOptionHeight =
    optionHeightProp === undefined
      ? 'var(--leaf-current-control-height, 34px)'
      : `${Math.max(24, optionHeightProp)}px`;
  const listboxProps = {
    id: panelId,
    role: 'listbox' as const,
    'aria-busy': loading || undefined,
    'aria-label': inputProps['aria-label'] ?? messages.select.placeholder,
    'aria-multiselectable': multiple || undefined,
  };
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Pointer events on padding forward to the keyboard-accessible combobox input.
    // biome-ignore lint/a11y/useKeyWithClickEvents: The combobox input owns all keyboard interaction; this wrapper only extends its hit area.
    <div
      ref={root}
      className={classes(
        'leaf-select',
        `leaf-select--${size}`,
        multiple && 'leaf-select--multiple',
        className,
      )}
      style={style}
      dir={props.dir ?? configuredDirection}
      data-status={status}
      data-disabled={disabled ? '' : undefined}
      data-open={open ? '' : undefined}
      data-clearable={clearable ? '' : undefined}
      data-searchable={showSearch ? '' : undefined}
      onMouseDown={(event) => {
        if (
          !disabled &&
          event.target instanceof Element &&
          !event.target.closest('input, button, a')
        )
          event.preventDefault();
      }}
      onClick={(event) => {
        if (
          !disabled &&
          event.target instanceof Element &&
          root.current?.contains(event.target) &&
          !event.target.closest('input, button, a')
        ) {
          input.current?.focus();
          input.current?.click();
        }
      }}
    >
      <SelectionContent
        className="leaf-select__content"
        tagClassName="leaf-select__tag"
        tagWrap={tagWrap}
        maxTagCount={maxTagCount}
        searchable={showSearch && !inputProps.readOnly && !inputReadOnly}
        query={searchQuery}
        removeLabel={messages.common.remove}
        items={
          multiple
            ? selectedOptions.map((option) => {
                const remove = () => {
                  if (disabled || inputProps.readOnly || option.disabled) return;
                  change(values.filter((item) => item !== option.value));
                  input.current?.focus();
                };
                return {
                  key: option.value,
                  label: option.label,
                  text: searchText(option),
                  remove:
                    !disabled && !inputProps.readOnly && !option.disabled ? remove : undefined,
                  render: tagRender?.(option, remove),
                };
              })
            : undefined
        }
      >
        <span className="leaf-select__input-wrap">
          {!multiple &&
            !textLabel &&
            displayLabel != null &&
            (!showSearch || !open || query === null) && (
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
            readOnly={!showSearch || inputProps.readOnly || inputReadOnly}
            value={inputValue}
            placeholder={values.length ? '' : (placeholder ?? messages.select.placeholder)}
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
            onBeforeInput={(event) => {
              onBeforeInput?.(event);
              if (!event.defaultPrevented) beginSearch();
            }}
            onCompositionStart={(event) => {
              onCompositionStart?.(event);
              if (!event.defaultPrevented) beginSearch();
            }}
            onPaste={(event) => {
              onPaste?.(event);
              if (!event.defaultPrevented) beginSearch();
            }}
            onKeyDown={(event) => {
              onKeyDown?.(event);
              if (event.defaultPrevented || event.nativeEvent.isComposing) return;
              if (
                !event.ctrlKey &&
                !event.metaKey &&
                !event.altKey &&
                (event.key.length === 1 || event.key === 'Backspace' || event.key === 'Delete')
              )
                beginSearch();
              if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                if (!open) openMenu();
                else move(event.key === 'ArrowDown' ? 1 : -1);
              } else if ((event.key === 'Home' || event.key === 'End') && open && !showSearch) {
                event.preventDefault();
                const candidates = filtered
                  .map((option, index) => ({ option, index }))
                  .filter(({ option }) => !unavailable(option));
                setHighlighted(
                  (event.key === 'Home' ? candidates[0] : candidates.at(-1))?.index ?? -1,
                );
              } else if (event.key === 'Enter' || (event.key === ' ' && !showSearch)) {
                event.preventDefault();
                if (!open) openMenu();
                else {
                  const option =
                    filtered[highlighted] ?? filtered.find((option) => !unavailable(option));
                  if (option) selectOption(option);
                }
              } else if (event.key === 'Escape' && open) {
                event.preventDefault();
                event.stopPropagation();
                close();
              } else if (event.key === 'Tab' && open) close();
              else if (
                event.key === 'Backspace' &&
                multiple &&
                !searchQuery &&
                !inputProps.readOnly
              ) {
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
        </span>
      </SelectionContent>
      <button
        type="button"
        className="leaf-select__arrow"
        tabIndex={-1}
        disabled={disabled}
        aria-label={messages.select.placeholder}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          if (open) close();
          else openMenu();
          input.current?.focus();
        }}
      >
        {loading ? (
          <LoaderCircle className="leaf-select__spinner" size={16} aria-hidden="true" />
        ) : (
          <ChevronDown size={16} aria-hidden="true" />
        )}
      </button>
      {clearable && (
        <ClearButton
          label={messages.select.clear}
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
        resetSurfaceGeometry
        open={open}
        placement={popupPlacement}
        container={getPopupContainer}
        triggerRef={root}
        panelRef={panel}
        matchWidth={popupWidth === 'trigger'}
        width={
          popupWidth === 'trigger' ? undefined : popupWidth === 'auto' ? 'max-content' : popupWidth
        }
        maxWidth={popupMaxWidth}
        {...(filtered.length ? listboxProps : {})}
        className={classes('leaf-floating', 'leaf-select__panel', popupClassName)}
        data-hover-motion=""
        onMouseLeave={restoreSelectionHighlight}
        style={
          {
            maxHeight: listHeight,
            '--leaf-select-option-height': controlOptionHeight,
            ...popupStyle,
          } as CSSProperties
        }
        onScroll={onPopupScroll}
      >
        {/* Feedback is announced beside an empty listbox, never as a selectable option. */}
        {!filtered.length && <div {...listboxProps} />}
        {(popupRender ?? ((content: ReactNode) => content))(
          loading && !filtered.length ? (
            <FloatingFeedback loading>{messages.common.loading}</FloatingFeedback>
          ) : filtered.length ? (
            virtual ? (
              <div
                style={{
                  height: virtualizer.getTotalSize(),
                  position: 'relative',
                  minWidth: '100%',
                }}
              >
                {virtualizer.getVirtualItems().map((item) => {
                  const row = rows[item.index];
                  if (!row) return null;
                  return (
                    <div
                      key={row.key}
                      ref={virtualizer.measureElement}
                      data-index={item.index}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        transform: `translateY(${item.start}px)`,
                      }}
                    >
                      {row.option ? (
                        renderOption(row.option, row.index)
                      ) : (
                        <div className="leaf-select__group">{row.group}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              rows.map((row) =>
                row.option ? (
                  renderOption(row.option, row.index)
                ) : (
                  <div key={row.key} className="leaf-select__group">
                    {row.group}
                  </div>
                ),
              )
            )
          ) : (
            <FloatingFeedback>{notFoundContent ?? messages.select.empty}</FloatingFeedback>
          ),
        )}
      </FloatingPanel>
    </div>
  );
});
SelectControl.displayName = 'SelectControl';

export const Select = forwardRef<HTMLInputElement, SelectProps>(function Select(rawProps, ref) {
  const props = useComponentProps('Select', rawProps);
  return <SelectControl {...props} ref={ref} />;
});
Select.displayName = 'Select';
