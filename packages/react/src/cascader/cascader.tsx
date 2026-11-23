import { Check, ChevronDown, ChevronRight, LoaderCircle } from 'lucide-react';
import {
  type ButtonHTMLAttributes,
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type Ref,
  type RefObject,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useComponentProps } from '../config-provider/component-defaults';
import { useLeafConfig } from '../config-provider/context';
import { FieldScope, useFormField } from '../form/form';
import { InputControl } from '../input/input';
import { ScrollbarControl as Scrollbar } from '../scrollbar/scrollbar';
import { classes } from '../shared/classes';
import { ClearButton } from '../shared/clear-button';
import { FormValue, useFieldValue, useMergedRef } from '../shared/field';
import {
  FloatingPanel,
  type PopupOptions,
  useFloatingDismiss,
  usePopupState,
} from '../shared/floating';
import { SelectionContent } from '../shared/selection-content';
import type { ControlSize, ControlStatus } from '../shared/types';
import { useFormattedText } from '../shared/use-formatted-text';

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
  tagWrap?: boolean;
  maxTagCount?: number | 'responsive';
  popupWidth?: number | string;
  popupMaxWidth?: number | string;
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

function samePath(left: readonly string[], right: readonly string[]) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function moveOptionFocus(
  container: HTMLElement | null,
  current: HTMLButtonElement | null,
  key: string,
  onTopEdge?: () => void,
) {
  const items = Array.from(
    container?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? [],
  );
  if (!items.length) return;
  const index = current ? items.indexOf(current) : -1;
  if (key === 'ArrowUp' && index === 0 && onTopEdge) {
    onTopEdge();
    return;
  }
  const next =
    key === 'Home'
      ? 0
      : key === 'End'
        ? items.length - 1
        : key === 'ArrowDown'
          ? index < 0
            ? 0
            : (index + 1) % items.length
          : index <= 0
            ? items.length - 1
            : index - 1;
  items[next]?.focus();
  items[next]?.scrollIntoView?.({ block: 'nearest' });
}

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
  rawProps: CascaderProps,
  forwardedRef,
) {
  const {
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
    tagWrap = true,
    maxTagCount,
    popupWidth = 'auto',
    popupMaxWidth,
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
  } = useComponentProps('Cascader', rawProps);
  const { messages, direction } = useLeafConfig();
  const format = useFormattedText();
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
  const triggerRef = useRef<HTMLButtonElement | HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const ref = useMergedRef(
    triggerRef as RefObject<HTMLElement | null>,
    forwardedRef as Ref<HTMLElement | null>,
  );
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
  const initialDraftRef = useRef<readonly string[]>(emptyPath);
  initialDraftRef.current = paths[0] ?? emptyPath;
  const wasOpenRef = useRef(open);
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
  const normalizedQuery = query.trim();
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
            .includes(normalizedQuery.toLocaleLowerCase())
        )
          searchResults.push(next);
      }
      if (entry.children) visit(entry.children, next);
    }
  };
  if (normalizedQuery) visit(options, []);
  const draftOptions = resolvePath(options, draft);
  const levels: (readonly CascaderOption[])[] = [options];
  for (const option of draftOptions) if (option.children?.length) levels.push(option.children);
  const prevLevelsRef = useRef(open ? levels.length : 0);
  const close = () => {
    setQuery('');
    setFocusLevel(null);
    setOpen(false);
  };
  useFloatingDismiss(open, close, triggerRef, panelRef);
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setDraft(initialDraftRef.current);
      if (showSearch) searchInputRef.current?.focus();
      else setFocusLevel(0);
    } else if (!open && wasOpenRef.current) {
      setQuery('');
      setFocusLevel(null);
    }
    wasOpenRef.current = open;
  }, [open, showSearch]);
  useEffect(() => {
    if (!open || focusLevel === null) return;
    if (focusLevel >= levels.length) {
      if (!loading.size) setFocusLevel(null);
      return;
    }
    const column = panelRef.current?.querySelector<HTMLElement>(`[data-level='${focusLevel}']`);
    const option =
      column?.querySelector<HTMLButtonElement>('button[aria-selected="true"]:not(:disabled)') ??
      column?.querySelector<HTMLButtonElement>('button:not(:disabled)');
    option?.focus();
    option?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    setFocusLevel(null);
  }, [open, focusLevel, levels.length, loading.size]);
  useEffect(() => {
    if (!open || normalizedQuery) {
      prevLevelsRef.current = open ? levels.length : 0;
      return;
    }
    if (levels.length > prevLevelsRef.current && prevLevelsRef.current > 0) {
      const column = panelRef.current?.querySelector<HTMLElement>(
        `[data-level='${levels.length - 1}']`,
      );
      column?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    }
    prevLevelsRef.current = levels.length;
  }, [open, normalizedQuery, levels.length]);

  const openPanel = () => {
    if (disabled) return;
    setDraft(paths[0] ?? []);
    if (!showSearch) setFocusLevel(0);
    setOpen(true);
  };
  const choose = (option: CascaderOption, level: number) => {
    if (option.disabled || disabled || readOnly) return;
    const committedPath =
      level === 0 && !changeOnSelect
        ? paths.find(
            (path) => path[0] === option.value && resolvePath(options, path).length === path.length,
          )
        : undefined;
    let next = [...draft.slice(0, level), option.value];
    if (level === 0 && !changeOnSelect) {
      if (draft[0] === option.value) next = [...draft];
      else if (committedPath) next = [...committedPath];
    }
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
      ? paths.some((current) => samePath(current, path))
        ? paths.filter((current) => !samePath(current, path)).map((current) => [...current])
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
  const removePath = (targetPath: readonly string[]) => {
    if (disabled || readOnly || !multiple) return;
    const next = paths
      .filter((current) => !samePath(current, targetPath))
      .map((current) => [...current]);
    setSelectedValue(next);
    (onChange as ((value: string[][], options: CascaderOption[][]) => void) | undefined)?.(
      next,
      next.map((path) => resolvePath(options, path)),
    );
    triggerRef.current?.focus();
  };
  const triggerContent = (
    <>
      {multiple && selectedPaths.length ? (
        <SelectionContent
          className="leaf-cascader__value"
          tagClassName="leaf-cascader__tag"
          tagWrap={tagWrap}
          maxTagCount={maxTagCount}
          removeLabel={messages.common.remove}
          items={selectedPaths.map((path, index) => ({
            key: JSON.stringify(paths[index]),
            label: caption(path),
            text: path
              .map(
                (option) =>
                  option.searchLabel ??
                  (typeof option.label === 'string' ? option.label : option.value),
              )
              .join(' / '),
            remove:
              !disabled && !readOnly ? () => removePath(paths[index] ?? emptyPath) : undefined,
          }))}
        />
      ) : (
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
            : placeholder || messages.cascader.placeholder}
        </span>
      )}
      <ChevronDown size={16} aria-hidden="true" />
    </>
  );
  const triggerClick = (event: MouseEvent<HTMLElement>) => {
    if (disabled) return;
    onClick?.(event as MouseEvent<HTMLButtonElement>);
    if (!event.defaultPrevented) {
      if (open) close();
      else openPanel();
    }
  };
  const triggerKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (disabled) return;
    onKeyDown?.(event as KeyboardEvent<HTMLButtonElement>);
    if (event.defaultPrevented) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!open) openPanel();
    } else if (multiple && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      if (open) close();
      else openPanel();
    } else if (multiple && event.key === 'Backspace' && paths.length && !readOnly) {
      event.preventDefault();
      removePath(paths[paths.length - 1] ?? emptyPath);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      close();
    }
  };
  const popupWidthMode =
    popupWidth === 'auto' ? 'auto' : popupWidth === 'trigger' ? 'trigger' : 'fixed';
  const popupMinWidth =
    popupStyle?.minWidth ??
    (popupWidth === 'auto' &&
    popupStyle?.width === undefined &&
    (showSearch || Boolean(normalizedQuery))
      ? 'trigger'
      : undefined);
  const searchResultValues = searchResults.map((path) => path.map((option) => option.value));
  const hasSelectedSearchResult = searchResultValues.some((valuePath) =>
    paths.some((current) => samePath(current, valuePath)),
  );

  return (
    <div
      ref={rootRef}
      className={classes(
        'leaf-cascader',
        `leaf-cascader--${size}`,
        multiple && 'leaf-cascader--multiple',
        className,
      )}
      style={style}
      dir={props.dir ?? direction}
      data-status={status}
      data-disabled={disabled ? '' : undefined}
      data-open={open ? '' : undefined}
      data-clearable={allowClear && selectedValue.length && !disabled && !readOnly ? '' : undefined}
    >
      {multiple ? (
        // 多选触发器内部包含可点击移除的标签按钮，使用 div 承担 combobox 以避免嵌套原生 button
        <div
          {...(props as HTMLAttributes<HTMLDivElement>)}
          dir={props.dir ?? direction}
          ref={ref as Ref<HTMLDivElement>}
          tabIndex={disabled ? -1 : (props.tabIndex ?? 0)}
          className="leaf-cascader__trigger"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-controls={panelId}
          aria-label={ariaLabel}
          id={id}
          aria-describedby={ariaDescribedBy}
          aria-disabled={disabled || undefined}
          aria-invalid={status === 'error' ? true : ariaInvalid}
          aria-required={required || undefined}
          onClick={triggerClick}
          onKeyDown={triggerKeyDown}
        >
          {triggerContent}
        </div>
      ) : (
        <button
          {...props}
          dir={props.dir ?? direction}
          ref={ref as Ref<HTMLButtonElement>}
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
          onClick={triggerClick}
          onKeyDown={triggerKeyDown}
        >
          {triggerContent}
        </button>
      )}
      {allowClear && selectedValue.length > 0 && !disabled && !readOnly && (
        <ClearButton
          label={messages.cascader.clear}
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
        resetSurfaceGeometry
        placement={popupPlacement}
        container={getPopupContainer}
        render={popupRender}
        style={popupStyle}
        open={open}
        triggerRef={rootRef}
        panelRef={panelRef}
        matchWidth={popupWidth === 'trigger'}
        width={
          popupWidth === 'trigger' ? undefined : popupWidth === 'auto' ? 'max-content' : popupWidth
        }
        minWidth={popupMinWidth}
        maxWidth={popupMaxWidth}
        id={panelId}
        className={classes('leaf-floating leaf-cascader__panel', popupClassName)}
        data-popup-width={popupWidthMode}
        data-searchable={showSearch ? '' : undefined}
        role="dialog"
        aria-label={ariaLabel || messages.cascader.placeholder}
      >
        {showSearch && (
          <FieldScope>
            <div className="leaf-cascader__search">
              <InputControl
                ref={searchInputRef}
                allowClear
                placeholder={messages.common.search}
                aria-label={messages.common.search}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== 'ArrowDown') return;
                  event.preventDefault();
                  const targetContainer = normalizedQuery
                    ? panelRef.current?.querySelector<HTMLElement>('.leaf-cascader__search-list')
                    : panelRef.current?.querySelector<HTMLElement>("[data-level='0']");
                  const first =
                    targetContainer?.querySelector<HTMLButtonElement>(
                      'button[aria-selected="true"]:not(:disabled)',
                    ) ?? targetContainer?.querySelector<HTMLButtonElement>('button:not(:disabled)');
                  first?.focus();
                  first?.scrollIntoView?.({ block: 'nearest' });
                }}
              />
            </div>
          </FieldScope>
        )}
        {normalizedQuery ? (
          <Scrollbar
            role="listbox"
            aria-label={messages.common.search}
            aria-multiselectable={multiple || undefined}
            className="leaf-cascader__search-list"
            orientation="vertical"
            size="sm"
            tabIndex={-1}
            maxHeight={256}
          >
            {searchResults.length ? (
              searchResults.map((path, index) => {
                const valuePath = searchResultValues[index] ?? [];
                const selected = paths.some((current) => samePath(current, valuePath));
                return (
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className="leaf-floating__option"
                    key={valuePath.join('/')}
                    tabIndex={selected || (!hasSelectedSearchResult && index === 0) ? 0 : -1}
                    onClick={() => commit(valuePath)}
                    onKeyDown={(event) => {
                      if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
                      event.preventDefault();
                      moveOptionFocus(
                        event.currentTarget.parentElement,
                        event.currentTarget,
                        event.key,
                        showSearch ? () => searchInputRef.current?.focus() : undefined,
                      );
                    }}
                  >
                    <span className="leaf-floating__option-label">{caption(path)}</span>
                    {selected && (
                      <Check size={14} className="leaf-cascader__check" aria-hidden="true" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="leaf-floating__empty">{messages.cascader.empty}</div>
            )}
          </Scrollbar>
        ) : (
          <Scrollbar
            className="leaf-cascader__columns-scroll"
            orientation="horizontal"
            size="sm"
            role="presentation"
            tabIndex={-1}
          >
            <div className="leaf-cascader__columns">
              {levels.map((level, depth) => {
                // Include depth so values containing '/' cannot collide across levels.
                const stableKey = `${depth}:${draft.slice(0, depth).join('/')}`;
                return (
                  <Scrollbar
                    key={stableKey}
                    className="leaf-cascader__column"
                    orientation="vertical"
                    size="sm"
                    tabIndex={-1}
                    maxHeight={256}
                    data-level={depth}
                    role="listbox"
                    aria-label={format('cascader.level', { level: depth + 1 })}
                  >
                    {level.length ? (
                      level.map((option) => {
                        const hasChildren = Boolean(
                          option.children?.length || option.isLeaf === false,
                        );
                        const currentPath = [...draft.slice(0, depth), option.value];
                        const isBranchExpanded = hasChildren && draft[depth] === option.value;
                        const isSaved = multiple
                          ? paths.some((path) => samePath(path, currentPath))
                          : hasChildren
                            ? Boolean(
                                changeOnSelect && paths.some((path) => samePath(path, currentPath)),
                              )
                            : draft[depth] === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            role="option"
                            className="leaf-floating__option"
                            aria-selected={draft[depth] === option.value}
                            data-highlighted={isBranchExpanded ? 'true' : undefined}
                            disabled={option.disabled}
                            tabIndex={
                              option.value ===
                              (draft[depth] ?? level.find((item) => !item.disabled)?.value)
                                ? 0
                                : -1
                            }
                            onClick={() => {
                              choose(option, depth);
                            }}
                            onKeyDown={(event) => {
                              if (
                                event.key === (direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight') &&
                                hasChildren
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
                              } else if (
                                ['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)
                              ) {
                                event.preventDefault();
                                moveOptionFocus(
                                  event.currentTarget.parentElement,
                                  event.currentTarget,
                                  event.key,
                                  depth === 0 && showSearch
                                    ? () => searchInputRef.current?.focus()
                                    : undefined,
                                );
                              }
                            }}
                          >
                            <span className="leaf-floating__option-label">
                              {optionRender?.(option) ?? option.label}
                            </span>
                            {loading.has(option.value) ? (
                              <LoaderCircle
                                size={14}
                                className="leaf-cascader__spinner"
                                aria-hidden="true"
                              />
                            ) : hasChildren ? (
                              <>
                                {isSaved && (
                                  <Check
                                    size={14}
                                    className="leaf-cascader__check"
                                    aria-hidden="true"
                                  />
                                )}
                                <ChevronRight
                                  size={14}
                                  className="leaf-cascader__expand"
                                  aria-hidden="true"
                                />
                              </>
                            ) : (
                              isSaved && (
                                <Check
                                  size={14}
                                  className="leaf-cascader__check"
                                  aria-hidden="true"
                                />
                              )
                            )}
                          </button>
                        );
                      })
                    ) : (
                      <div className="leaf-floating__empty">{messages.cascader.empty}</div>
                    )}
                  </Scrollbar>
                );
              })}
            </div>
          </Scrollbar>
        )}
      </FloatingPanel>
    </div>
  );
});
Cascader.displayName = 'Cascader';
