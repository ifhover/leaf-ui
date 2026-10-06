import { useVirtualizer } from '@tanstack/react-virtual';
import { Check, ChevronDown, LoaderCircle, Plus, X } from 'lucide-react';
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
import { useLeafConfig } from '../config-provider/context';
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
import { useListMotion } from '../shared/motion';
import type { ControlSize, ControlStatus } from '../shared/types';
import { useText } from '../shared/use-text';

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
export const Select = forwardRef<HTMLInputElement, SelectProps>(
  function Select(props, forwardedRef) {
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
      onBlur,
      multiple = false,
      showSearch: searchProp = false,
      filterOption = true,
      onSearch,
      popupWidth = 'auto',
      popupMaxWidth = 420,
      popupClassName,
      popupStyle,
      popupPlacement,
      getPopupContainer,
      loading = false,
      notFoundContent,
      optionRender,
      maxCount,
      maxTagCount,
      allowCreate = false,
      onCreate,
      virtual: virtualProp,
      listHeight = 248,
      optionHeight = 36,
      onChange: _onChange,
      ...inputProps
    } = props;
    const t = useText();
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
    const { messages } = useLeafConfig();
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
    const [responsiveCount, setResponsiveCount] = useState(3);
    // biome-ignore lint/correctness/useExhaustiveDependencies: Remeasure tag widths when the selected values change.
    useEffect(() => {
      if (maxTagCount !== 'responsive' || !root.current) return;
      const measure = () => {
        const width = root.current?.clientWidth ?? 0;
        let used = 90;
        let count = 0;
        for (const tag of root.current?.querySelectorAll<HTMLElement>('[data-leaf-tag-measure]') ??
          []) {
          used += tag.getBoundingClientRect().width + 4;
          if (used > width) break;
          count++;
        }
        setResponsiveCount(count);
      };
      const observer =
        typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure);
      observer?.observe(root.current);
      window.addEventListener('resize', measure);
      measure();
      return () => {
        observer?.disconnect();
        window.removeEventListener('resize', measure);
      };
    }, [maxTagCount, values]);
    const visibleTagCount =
      maxTagCount === 'responsive'
        ? responsiveCount
        : maxTagCount === undefined
          ? values.length
          : Math.max(0, Math.floor(maxTagCount));
    useListMotion(
      root,
      JSON.stringify(values.slice(0, visibleTagCount)),
      '.leaf-select__tag[data-motion-key]',
    );
    useListMotion(root, values[0], multiple ? '' : '.leaf-select__input-wrap[data-motion-key]');
    const atLimit =
      multiple && maxCount !== undefined && values.length >= Math.max(0, Math.floor(maxCount));
    const unavailable = (option: SelectOption) =>
      option.disabled || (atLimit && !values.includes(option.value));
    const selectedCache = useRef(new Map<string, SelectOption>());
    const nextCache = new Map<string, SelectOption>();
    for (const key of values) {
      const record =
        options.find((option) => option.value === key) ?? selectedCache.current.get(key);
      if (record) nextCache.set(key, record);
    }
    selectedCache.current = nextCache;
    const selectedOptions = values.map((key) => nextCache.get(key) ?? { value: key, label: key });
    const [query, setQuery] = useState('');
    const [open, setOpen] = usePopupState(
      disabled || inputProps.readOnly,
      onOpenChange,
      controlledOpen,
      defaultOpen,
    );
    const [highlighted, setHighlighted] = useState(-1);
    const matched =
      !query || !showSearch || filterOption === false
        ? options
        : options.filter((option) =>
            typeof filterOption === 'function'
              ? filterOption(query, option)
              : searchText(option).toLocaleLowerCase().includes(query.toLocaleLowerCase()),
          );
    const newValue = query.trim();
    const createOption =
      allowCreate &&
      newValue &&
      !options.some((option) => option.value === newValue || searchText(option) === newValue)
        ? { value: newValue, label: newValue }
        : null;
    const filtered = createOption ? [...matched, createOption] : matched;
    const rows = useMemo(() => {
      const entries: { key: string; option?: SelectOption; group?: ReactNode; index: number }[] =
        [];
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
      if (query) updateQuery('');
    };
    useFloatingDismiss(open, close, input, panel, root);
    useActiveOption(open, highlighted >= 0 ? `${panelId}-${highlighted}` : undefined, panel);
    useEffect(() => {
      if (!open) setQuery('');
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
    const openMenu = () => {
      if (disabled || inputProps.readOnly) return;
      const active = filtered.findIndex(
        (option) => values.includes(option.value) && !unavailable(option),
      );
      setHighlighted(active >= 0 ? active : filtered.findIndex((option) => !unavailable(option)));
      setOpen(true);
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
        <span className="leaf-select__option-label">
          {createOption?.value === option.value ? (
            <>
              <Plus size={14} aria-hidden="true" /> {t('创建', 'Create')} “{option.label}”
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
    const inputValue = multiple || (showSearch && open) ? query : textLabel;
    const clearable = allowClear && values.length > 0 && !disabled && !inputProps.readOnly;
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
        <div className="leaf-select__content">
          {multiple &&
            values.slice(0, visibleTagCount).map((value) => {
              const option = nextCache.get(value) ?? { value, label: value };
              const remove = () => change(values.filter((item) => item !== value));
              if (tagRender)
                return (
                  <span key={value} className="leaf-select__tag" data-motion-key={value}>
                    {tagRender(option, remove)}
                  </span>
                );
              return (
                <span key={value} className="leaf-select__tag" data-motion-key={value}>
                  <span>{option?.label ?? value}</span>
                  {!disabled && !inputProps.readOnly && !option?.disabled && (
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
          {multiple && values.length > visibleTagCount && (
            <span className="leaf-select__tag">+{values.length - visibleTagCount}</span>
          )}
          {multiple && maxTagCount === 'responsive' && (
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                visibility: 'hidden',
                pointerEvents: 'none',
                display: 'flex',
              }}
            >
              {selectedOptions.map((option) => (
                <span key={option.value} data-leaf-tag-measure className="leaf-select__tag">
                  {option.label}
                  <X size={12} />
                </span>
              ))}
            </span>
          )}
          <div className="leaf-select__input-wrap" data-motion-key={values[0] ?? ''}>
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
              readOnly={!showSearch || inputProps.readOnly || inputReadOnly}
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
          {loading ? (
            <LoaderCircle className="leaf-select__spinner" size={16} aria-hidden="true" />
          ) : (
            <ChevronDown size={16} aria-hidden="true" />
          )}
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
          placement={popupPlacement}
          container={getPopupContainer}
          triggerRef={root}
          panelRef={panel}
          matchWidth={popupWidth === 'trigger'}
          width={
            popupWidth === 'trigger'
              ? undefined
              : popupWidth === 'auto'
                ? 'max-content'
                : popupWidth
          }
          minWidth={popupWidth === 'auto' ? 'trigger' : undefined}
          maxWidth={popupMaxWidth}
          id={panelId}
          className={classes('leaf-floating', 'leaf-select__panel', popupClassName)}
          style={{ maxHeight: listHeight, ...popupStyle }}
          onScroll={onPopupScroll}
          role="listbox"
          aria-busy={loading || undefined}
          aria-label={inputProps['aria-label'] ?? messages.select}
          aria-multiselectable={multiple || undefined}
        >
          {(popupRender ?? ((content: ReactNode) => content))(
            loading && !filtered.length ? (
              <div className="leaf-floating__empty">{messages.loading}</div>
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
              <div className="leaf-floating__empty">{notFoundContent ?? messages.empty}</div>
            ),
          )}
        </FloatingPanel>
      </div>
    );
  },
);
Select.displayName = 'Select';
