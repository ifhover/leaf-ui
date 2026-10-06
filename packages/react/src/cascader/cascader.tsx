import { Check, ChevronDown, ChevronRight, LoaderCircle } from 'lucide-react';
import {
  type ButtonHTMLAttributes,
  forwardRef,
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLeafConfig } from '../config-provider/context';
import { FieldScope, useFormField } from '../form/form';
import { Input } from '../input';
import { classes } from '../shared/classes';
import { ClearButton } from '../shared/clear-button';
import { FormValue, useFieldValue, useMergedRef } from '../shared/field';
import {
  FloatingPanel,
  type PopupOptions,
  useFloatingDismiss,
  usePopupState,
} from '../shared/floating';
import type { ControlSize, ControlStatus } from '../shared/types';

export interface CascaderOption {
  value: string;
  label: ReactNode;
  searchLabel?: string;
  isLeaf?: boolean;
  disabled?: boolean;
  children?: readonly CascaderOption[];
}

interface CascaderBaseProps
  extends Omit<
      ButtonHTMLAttributes<HTMLButtonElement>,
      'type' | 'value' | 'defaultValue' | 'onChange' | 'children'
    >,
    PopupOptions {
  options: readonly CascaderOption[];
  size?: ControlSize;
  status?: ControlStatus;
  placeholder?: string;
  name?: string;
  required?: boolean;
  allowClear?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  defaultOpen?: boolean;
  readOnly?: boolean;
  showSearch?: boolean;
  changeOnSelect?: boolean;
  displayRender?: (labels: ReactNode[], selectedOptions: CascaderOption[]) => ReactNode;
  optionRender?: (option: CascaderOption) => ReactNode;
  loadData?: (option: CascaderOption, signal: AbortSignal) => Promise<readonly CascaderOption[]>;
  onLoadError?: (error: unknown, option: CascaderOption) => void;
  cacheKey?: string | number;
}
export type CascaderProps = CascaderBaseProps &
  (
    | {
        multiple?: false;
        value?: readonly string[];
        defaultValue?: readonly string[];
        onChange?: (value: string[], selectedOptions: CascaderOption[]) => void;
      }
    | {
        multiple: true;
        value?: readonly (readonly string[])[];
        defaultValue?: readonly (readonly string[])[];
        onChange?: (value: string[][], selectedOptions: CascaderOption[][]) => void;
      }
  );

const emptyPath: readonly string[] = [];
function resolvePath(options: readonly CascaderOption[], values: readonly string[]) {
  const path: CascaderOption[] = [];
  let level = options;
  for (const value of values) {
    const option = level.find((item) => item.value === value);
    if (!option) break;
    path.push(option);
    level = option.children ?? [];
  }
  return path;
}

export const Cascader = forwardRef<HTMLButtonElement, CascaderProps>(function Cascader(
  {
    options: suppliedOptions,
    value,
    defaultValue = emptyPath,
    size = 'md',
    status: statusProp,
    placeholder,
    name,
    form,
    required: requiredProp,
    allowClear = true,
    disabled: disabledProp,
    className,
    style,
    onChange,
    onOpenChange,
    open: controlledOpen,
    defaultOpen,
    multiple = false,
    readOnly,
    showSearch,
    changeOnSelect,
    displayRender,
    optionRender,
    loadData,
    onLoadError,
    cacheKey,
    popupPlacement,
    popupClassName,
    popupStyle,
    popupRender,
    getPopupContainer,
    onClick,
    onKeyDown,
    'aria-label': ariaLabel,
    id: idProp,
    'aria-describedby': ariaDescribedByProp,
    'aria-invalid': ariaInvalid,
    ...props
  },
  forwardedRef,
) {
  const { locale, messages, direction } = useLeafConfig();
  const [loaded, setLoaded] = useState(new Map<string, readonly CascaderOption[]>());
  const [loading, setLoading] = useState(new Set<string>());
  const requests = useRef(new Map<string, AbortController>());
  // biome-ignore lint/correctness/useExhaustiveDependencies: Invalidate lazy children and abort requests when the source or explicit cache version changes.
  useEffect(() => {
    for (const request of requests.current.values()) request.abort();
    requests.current.clear();
    setLoaded(new Map());
    setLoading(new Set());
    return () => {
      for (const request of requests.current.values()) request.abort();
    };
  }, [suppliedOptions, loadData, cacheKey]);
  const options = useMemo(() => {
    const merge = (entries: readonly CascaderOption[]): CascaderOption[] =>
      entries.map((option) => {
        const children = option.children ?? loaded.get(option.value);
        return children
          ? { ...option, children: merge(children), isLeaf: !children.length }
          : option;
      });
    return merge(suppliedOptions);
  }, [suppliedOptions, loaded]);
  const field = useFormField();
  const disabled = disabledProp || field?.disabled;
  const required = requiredProp ?? field?.required;
  const status = statusProp ?? (field?.error ? 'error' : undefined);
  const id = idProp ?? field?.id;
  const ariaDescribedBy =
    [ariaDescribedByProp, field?.descriptionId].filter(Boolean).join(' ') || undefined;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const ref = useMergedRef(triggerRef, forwardedRef);
  const panelId = `${useId()}-cascader`;
  const [selectedValue, setSelectedValue] = useFieldValue<
    readonly string[] | readonly (readonly string[])[]
  >(value, defaultValue, triggerRef, form);
  const paths = multiple
    ? (selectedValue as readonly (readonly string[])[])
    : selectedValue.length
      ? [selectedValue as readonly string[]]
      : [];
  const [draft, setDraft] = useState<readonly string[]>(paths[0] ?? []);
  const [query, setQuery] = useState('');
  const [open, setOpen] = usePopupState(
    disabled || readOnly,
    onOpenChange,
    controlledOpen,
    defaultOpen,
  );
  const [focusLevel, setFocusLevel] = useState<number | null>(null);
  const selectedPaths = paths.map((path) => resolvePath(options, path));
  const caption = (path: CascaderOption[]) =>
    displayRender?.(
      path.map((option) => option.label),
      path,
    ) ??
    path
      .map(
        (option) =>
          option.searchLabel ?? (typeof option.label === 'string' ? option.label : option.value),
      )
      .join(' / ');
  const searchResults: CascaderOption[][] = [];
  const visit = (entries: readonly CascaderOption[], path: CascaderOption[]) => {
    for (const entry of entries) {
      const next = [...path, entry];
      if (entry.disabled) continue;
      if (changeOnSelect || (!entry.children?.length && (!loadData || entry.isLeaf !== false))) {
        if (
          next
            .map(
              (option) =>
                option.searchLabel ??
                (typeof option.label === 'string' ? option.label : option.value),
            )
            .join(' / ')
            .toLocaleLowerCase()
            .includes(query.toLocaleLowerCase())
        )
          searchResults.push(next);
      }
      if (entry.children) visit(entry.children, next);
    }
  };
  if (query) visit(options, []);
  const draftOptions = resolvePath(options, draft);
  const levels: (readonly CascaderOption[])[] = [options];
  for (const option of draftOptions) if (option.children?.length) levels.push(option.children);
  const close = () => {
    setOpen(false);
  };
  useFloatingDismiss(open, close, triggerRef, panelRef);
  useEffect(() => {
    if (open && focusLevel !== null) {
      const column = panelRef.current?.querySelector<HTMLElement>(`[data-level='${focusLevel}']`);
      const option =
        column?.querySelector<HTMLButtonElement>('button[aria-selected="true"]:not(:disabled)') ??
        column?.querySelector<HTMLButtonElement>('button:not(:disabled)');
      option?.focus();
      option?.scrollIntoView?.({ block: 'nearest' });
      setFocusLevel(null);
    }
  }, [open, focusLevel]);

  const openPanel = () => {
    if (disabled) return;
    setDraft(paths[0] ?? []);
    setFocusLevel(0);
    setOpen(true);
  };
  const choose = (option: CascaderOption, level: number) => {
    if (option.disabled || disabled || readOnly) return;
    const next = [...draft.slice(0, level), option.value];
    setDraft(next);
    if (
      loadData &&
      option.isLeaf === false &&
      option.children === undefined &&
      !requests.current.has(option.value)
    ) {
      const request = new AbortController();
      requests.current.set(option.value, request);
      setLoading((previous) => new Set(previous).add(option.value));
      void loadData(option, request.signal)
        .then((children) => {
          if (!request.signal.aborted)
            setLoaded((previous) => new Map(previous).set(option.value, children));
        })
        .catch((error) => {
          if (!request.signal.aborted) onLoadError?.(error, option);
        })
        .finally(() => {
          if (requests.current.get(option.value) === request) {
            requests.current.delete(option.value);
            setLoading((previous) => {
              const next = new Set(previous);
              next.delete(option.value);
              return next;
            });
          }
        });
      return;
    }
    if (changeOnSelect || (!option.children?.length && option.isLeaf !== false))
      commit(next, !option.children?.length);
  };
  const commit = (path: string[], leaf = true) => {
    if (disabled || readOnly) return;
    const next = multiple
      ? paths.some((current) => JSON.stringify(current) === JSON.stringify(path))
        ? paths
            .filter((current) => JSON.stringify(current) !== JSON.stringify(path))
            .map((current) => [...current])
        : [...paths.map((current) => [...current]), path]
      : path;
    setSelectedValue(next);
    (
      onChange as
        | ((value: string[] | string[][], options: CascaderOption[] | CascaderOption[][]) => void)
        | undefined
    )?.(
      next,
      multiple
        ? (next as string[][]).map((path) => resolvePath(options, path))
        : resolvePath(options, path),
    );
    if (!multiple && leaf) {
      close();
      triggerRef.current?.focus();
    }
  };

  return (
    <div
      className={classes('leaf-cascader', `leaf-cascader--${size}`, className)}
      style={style}
      data-status={status}
      data-disabled={disabled ? '' : undefined}
      data-open={open ? '' : undefined}
      data-clearable={allowClear && selectedValue.length && !disabled && !readOnly ? '' : undefined}
    >
      <button
        {...props}
        ref={ref}
        type="button"
        form={form}
        className="leaf-cascader__trigger"
        disabled={disabled}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={panelId}
        aria-label={ariaLabel}
        id={id}
        aria-describedby={ariaDescribedBy}
        aria-invalid={status === 'error' ? true : ariaInvalid}
        aria-required={required || undefined}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) {
            if (open) close();
            else openPanel();
          }
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (!open) openPanel();
          }
          if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            close();
          }
        }}
      >
        <span
          className={classes(
            'leaf-cascader__value',
            !selectedPaths.length && 'leaf-cascader__placeholder',
          )}
        >
          {selectedPaths.length
            ? selectedPaths.map((path, index) => (
                <span key={paths[index]?.join('/')}>
                  {index > 0 ? '、' : ''}
                  {caption(path)}
                </span>
              ))
            : placeholder || messages.select}
        </span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>
      {allowClear && selectedValue.length > 0 && !disabled && !readOnly && (
        <ClearButton
          label={messages.clearCascader}
          beforeArrow
          onClear={() => {
            setSelectedValue([]);
            setDraft([]);
            (onChange as ((value: [], options: []) => void) | undefined)?.([], []);
            close();
            triggerRef.current?.focus();
          }}
        />
      )}
      <FormValue
        name={name}
        form={form}
        required={required}
        disabled={disabled}
        value={selectedValue.length ? JSON.stringify(selectedValue) : ''}
        triggerRef={triggerRef}
      />
      <FloatingPanel
        placement={popupPlacement}
        container={getPopupContainer}
        render={popupRender}
        style={popupStyle}
        open={open}
        triggerRef={triggerRef}
        panelRef={panelRef}
        id={panelId}
        className={classes('leaf-floating leaf-cascader__panel', popupClassName)}
        role="dialog"
        aria-label={ariaLabel || messages.select}
      >
        {showSearch && (
          <FieldScope>
            <Input
              allowClear
              aria-label={messages.search}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </FieldScope>
        )}
        {query ? (
          <div role="listbox" aria-label={messages.search} className="leaf-cascader__column">
            {searchResults.length ? (
              searchResults.map((path) => (
                <button
                  type="button"
                  role="option"
                  aria-selected={paths.some(
                    (current) =>
                      JSON.stringify(current) ===
                      JSON.stringify(path.map((option) => option.value)),
                  )}
                  className="leaf-floating__option"
                  key={path.map((option) => option.value).join('/')}
                  onClick={() => commit(path.map((option) => option.value))}
                >
                  {caption(path)}
                </button>
              ))
            ) : (
              <div className="leaf-floating__empty">{messages.empty}</div>
            )}
          </div>
        ) : (
          <div className="leaf-cascader__columns">
            {levels.map((level, depth) => (
              <div
                key={depth === 0 ? 'root' : draft[depth - 1]}
                className="leaf-cascader__column"
                data-level={depth}
                role="listbox"
                aria-label={locale === 'en-US' ? `Level ${depth + 1}` : `第 ${depth + 1} 级`}
              >
                {level.length ? (
                  level.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      className="leaf-floating__option"
                      aria-selected={draft[depth] === option.value}
                      disabled={option.disabled}
                      tabIndex={
                        option.value ===
                        (draft[depth] ?? level.find((item) => !item.disabled)?.value)
                          ? 0
                          : -1
                      }
                      onClick={() => {
                        choose(option, depth);
                        if (option.children?.length) setFocusLevel(depth + 1);
                      }}
                      onKeyDown={(event) => {
                        if (
                          event.key === (direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight') &&
                          (option.children?.length || option.isLeaf === false)
                        ) {
                          event.preventDefault();
                          choose(option, depth);
                          setFocusLevel(depth + 1);
                        } else if (
                          event.key === (direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft') &&
                          depth > 0
                        ) {
                          event.preventDefault();
                          setFocusLevel(depth - 1);
                        } else if (['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
                          event.preventDefault();
                          const items = Array.from(
                            event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
                              'button:not(:disabled)',
                            ) ?? [],
                          );
                          const index = items.indexOf(event.currentTarget);
                          const next =
                            event.key === 'Home'
                              ? 0
                              : event.key === 'End'
                                ? items.length - 1
                                : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) %
                                  items.length;
                          items[next]?.focus();
                          items[next]?.scrollIntoView?.({ block: 'nearest' });
                        }
                      }}
                    >
                      <span>{optionRender?.(option) ?? option.label}</span>
                      {loading.has(option.value) ? (
                        <LoaderCircle size={14} className="leaf-select__spinner" />
                      ) : option.children?.length || option.isLeaf === false ? (
                        <ChevronRight size={14} aria-hidden="true" />
                      ) : (
                        (multiple
                          ? paths.some(
                              (path) =>
                                JSON.stringify(path) ===
                                JSON.stringify([...draft.slice(0, depth), option.value]),
                            )
                          : draft[depth] === option.value) && (
                          <Check size={14} className="leaf-cascader__check" aria-hidden="true" />
                        )
                      )}
                    </button>
                  ))
                ) : (
                  <div className="leaf-floating__empty">{messages.empty}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </FloatingPanel>
    </div>
  );
});
Cascader.displayName = 'Cascader';
