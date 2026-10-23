import { ChevronDown, X } from 'lucide-react';
import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useComponentProps } from '../config-provider/component-defaults';
import { useLeafConfig } from '../config-provider/context';
import { estimateControlHeight } from '../density';
import { FieldScope, useFormField } from '../form/form';
import { classes } from '../shared/classes';
import { FormValue, useFieldValue, useMergedRef } from '../shared/field';
import {
  FloatingPanel,
  type PopupOptions,
  useFloatingDismiss,
  usePopupState,
} from '../shared/floating';
import { useListMotion } from '../shared/motion';
import { SelectionContent } from '../shared/selection-content';
import type { ControlSize, ControlStatus } from '../shared/types';
import type { TreeNode } from '../tree';
import { treeModel } from '../tree/model';
import { TreeControl as Tree } from '../tree/tree';

export interface TreeSelectOption {
  value: string;
  label: ReactNode;
  children?: readonly TreeSelectOption[];
  disabled?: boolean;
  selectable?: boolean;
  disableCheckbox?: boolean;
  icon?: ReactNode;
  searchLabel?: string;
  isLeaf?: boolean;
}
export type TreeSelectValue = string | readonly string[] | null;
interface InternalTreeSelectProps
  extends Omit<
      InputHTMLAttributes<HTMLInputElement>,
      'value' | 'defaultValue' | 'onChange' | 'size' | 'multiple'
    >,
    PopupOptions {
  options: readonly TreeSelectOption[];
  value?: TreeSelectValue;
  defaultValue?: TreeSelectValue;
  onChange?: (value: TreeSelectValue) => void;
  multiple?: boolean;
  treeCheckable?: boolean;
  checkStrictly?: boolean;
  showCheckedStrategy?: 'child' | 'parent' | 'all';
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  allowClear?: boolean;
  defaultExpandAll?: boolean;
  treeDefaultExpandedKeys?: readonly string[];
  size?: ControlSize;
  status?: ControlStatus;
  popupWidth?: number | string;
  popupMaxWidth?: number | string;
  notFoundContent?: ReactNode;
  onOpenChange?: (open: boolean) => void;
  loadData?: (
    option: TreeSelectOption,
    signal: AbortSignal,
  ) => Promise<readonly TreeSelectOption[]>;
  onLoadError?: (error: unknown, option: TreeSelectOption) => void;
  virtual?: boolean;
  listHeight?: number;
  itemHeight?: number;
  inputReadOnly?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  maxTagCount?: number | 'responsive';
  tagWrap?: boolean;
  maxCount?: number;
  treeExpandedKeys?: readonly string[];
  onExpand?: (keys: string[]) => void;
  filterTreeNode?: (option: TreeSelectOption, query: string) => boolean;
  nodeRender?: (option: TreeSelectOption) => ReactNode;
  cacheKey?: string | number;
}
const emptyKeys: readonly string[] = [];
const InternalTreeSelect = forwardRef<HTMLInputElement, InternalTreeSelectProps>(
  function TreeSelect(
    {
      options,
      value,
      defaultValue = null,
      onChange,
      multiple = false,
      treeCheckable = false,
      checkStrictly = false,
      showCheckedStrategy = 'child',
      showSearch = true,
      onSearch,
      allowClear = true,
      defaultExpandAll = false,
      treeDefaultExpandedKeys = emptyKeys,
      size = 'md',
      status: statusProp,
      disabled: disabledProp,
      required: requiredProp,
      popupWidth = 'trigger',
      popupMaxWidth,
      notFoundContent,
      onOpenChange,
      loadData,
      onLoadError,
      virtual = false,
      listHeight = 256,
      itemHeight: itemHeightProp,
      inputReadOnly,
      open: controlledOpen,
      defaultOpen,
      maxTagCount,
      tagWrap = true,
      maxCount = Infinity,
      treeExpandedKeys,
      onExpand,
      filterTreeNode,
      nodeRender,
      cacheKey,
      popupPlacement,
      popupClassName,
      popupStyle,
      popupRender,
      getPopupContainer,
      name,
      form,
      className,
      style,
      placeholder,
      'aria-label': label,
      ...props
    },
    forwardedRef,
  ) {
    const { messages, theme, density, direction: configuredDirection } = useLeafConfig();
    const itemHeight = itemHeightProp ?? estimateControlHeight(theme, density);
    const field = useFormField();
    const disabled = disabledProp || field?.disabled;
    const required = requiredProp ?? field?.required;
    const status = statusProp ?? (field?.error ? 'error' : undefined);
    const multi = multiple || treeCheckable;
    const trigger = useRef<HTMLInputElement>(null);
    const ref = useMergedRef(trigger, forwardedRef);
    const root = useRef<HTMLDivElement>(null);
    const panel = useRef<HTMLDivElement>(null);
    const pendingFocus = useRef(false);
    const [current, setCurrent] = useFieldValue(value, defaultValue, trigger, form);
    const selected = typeof current === 'string' ? [current] : (current ?? emptyKeys);
    useListMotion(root, selected[0], multi ? '' : '.leaf-tree-select__input-wrap[data-motion-key]');
    const [query, setQuery] = useState<string | null>(null);
    const searchQuery = query ?? '';
    const [open, setOpen] = usePopupState(
      disabled || props.readOnly,
      onOpenChange,
      controlledOpen,
      defaultOpen,
    );
    const id = `${useId()}-tree-select`;
    const [loadedOptions, setLoadedOptions] = useState<Map<string, readonly TreeSelectOption[]>>(
      new Map(),
    );
    const generation = useRef(0);
    // biome-ignore lint/correctness/useExhaustiveDependencies: Invalidate lazy options on source and cache-version changes.
    useEffect(() => {
      generation.current++;
      setLoadedOptions(new Map());
    }, [options, loadData, cacheKey]);
    const allOptions = useMemo(() => {
      const merge = (entries: readonly TreeSelectOption[]): TreeSelectOption[] =>
        entries.map((option) => {
          const children = option.children ?? loadedOptions.get(option.value);
          return children ? { ...option, children: merge(children) } : option;
        });
      return merge(options);
    }, [options, loadedOptions]);
    const optionRecords = useMemo(() => {
      const map = new Map<string, TreeSelectOption>();
      const visit = (entries: readonly TreeSelectOption[]) => {
        for (const option of entries) {
          map.set(option.value, option);
          if (option.children) visit(option.children);
        }
      };
      visit(allOptions);
      return map;
    }, [allOptions]);
    const latestLoader = useRef({ loadData, optionRecords });
    latestLoader.current = { loadData, optionRecords };
    const lazyLoad = useCallback(async (node: TreeNode, signal: AbortSignal) => {
      const snapshot = generation.current;
      const option = latestLoader.current.optionRecords.get(node.key);
      if (!option || !latestLoader.current.loadData) return [];
      const children = await latestLoader.current.loadData(option, signal);
      if (!signal.aborted && snapshot === generation.current)
        setLoadedOptions((previous) => new Map(previous).set(node.key, children));
      const convert = (entries: readonly TreeSelectOption[]): TreeNode[] =>
        entries.map(({ value: key, label: title, children, ...entry }) => ({
          ...entry,
          key,
          title,
          children: children ? convert(children) : undefined,
        }));
      return convert(children);
    }, []);
    const data = useMemo(() => {
      const convert = (nodes: readonly TreeSelectOption[]): TreeNode[] =>
        nodes.map(({ value: key, label: title, children, ...node }) => ({
          ...node,
          key,
          title,
          children: children ? convert(children) : undefined,
        }));
      return convert(allOptions);
    }, [allOptions]);
    const records = useMemo(() => treeModel(data), [data]);
    const [expandedKeys, setExpandedKeys] = useState<readonly string[]>(() =>
      defaultExpandAll ? [...records.keys()] : treeDefaultExpandedKeys,
    );
    const close = () => {
      setOpen(false);
      setQuery(null);
    };
    useFloatingDismiss(open, close, trigger, panel, root);
    useEffect(() => {
      if (!open) setQuery(null);
      else if (pendingFocus.current) {
        panel.current?.querySelector<HTMLElement>('[role="treeitem"][tabindex="0"]')?.focus();
        pendingFocus.current = false;
      }
    }, [open]);
    const commit = (keys: readonly string[]) => {
      if (disabled || props.readOnly || keys.length > maxCount) return;
      const next: TreeSelectValue = multi ? [...keys] : (keys[0] ?? null);
      setCurrent(next);
      onChange?.(next);
      setQuery(null);
      if (!multi) {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    const canRemove = (key: string) =>
      !records.get(key)?.node.disabled && !records.get(key)?.node.disableCheckbox;
    const clearable = allowClear && selected.some(canRemove) && !disabled && !props.readOnly;
    const caption = (key: string) => records.get(key)?.node.title ?? key;
    const a11yCaption = (key: string) =>
      records.get(key)?.node.searchLabel ??
      (typeof caption(key) === 'string' || typeof caption(key) === 'number'
        ? String(caption(key))
        : key);
    const selectedCaption = selected[0] === undefined ? undefined : caption(selected[0]);
    const hasRichCaption =
      selectedCaption !== undefined &&
      typeof selectedCaption !== 'string' &&
      typeof selectedCaption !== 'number';
    const showCaption = !multi && hasRichCaption && (!showSearch || !open || query === null);
    const inputValue = multi
      ? searchQuery
      : showSearch && open
        ? (query ?? (selected[0] === undefined ? '' : a11yCaption(selected[0])))
        : selected[0] === undefined
          ? ''
          : a11yCaption(selected[0]);
    const beginSearch = () => {
      if (!showSearch || disabled || props.readOnly || inputReadOnly) return;
      if (!multi && query === null) trigger.current?.select();
      setOpen(true);
    };
    return (
      <>
        {/* biome-ignore lint/a11y/noStaticElementInteractions: The wrapper extends the input's clickable area, as in Select. */}
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: The enclosed combobox owns keyboard interaction. */}
        <div
          ref={root}
          className={classes(
            'leaf-tree-select',
            `leaf-tree-select--${size}`,
            multi && 'leaf-tree-select--multiple',
            className,
          )}
          style={style}
          dir={props.dir ?? configuredDirection}
          data-disabled={disabled || undefined}
          data-status={status}
          data-open={open || undefined}
          data-clearable={clearable || undefined}
          data-searchable={showSearch || undefined}
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
              !event.target.closest('input, button, a')
            ) {
              trigger.current?.focus();
              trigger.current?.click();
            }
          }}
        >
          <SelectionContent
            className="leaf-tree-select__content"
            tagClassName="leaf-tree-select__tag"
            tagWrap={tagWrap}
            maxTagCount={maxTagCount}
            searchable={showSearch && !props.readOnly && !inputReadOnly}
            query={searchQuery}
            removeLabel={messages.common.remove}
            items={
              multi
                ? selected.map((key) => ({
                    key,
                    label: caption(key),
                    text: a11yCaption(key),
                    remove:
                      canRemove(key) && !disabled && !props.readOnly
                        ? () => {
                            commit(selected.filter((item) => item !== key));
                            trigger.current?.focus();
                          }
                        : undefined,
                  }))
                : undefined
            }
          >
            <span className="leaf-tree-select__input-wrap" data-motion-key={selected[0] ?? ''}>
              {showCaption && (
                <span className="leaf-tree-select__value" aria-hidden="true">
                  {selectedCaption}
                </span>
              )}
              <input
                {...props}
                ref={ref}
                id={props.id ?? field?.id}
                role="combobox"
                aria-haspopup="tree"
                aria-expanded={open}
                aria-controls={open ? id : undefined}
                aria-autocomplete={showSearch ? 'list' : undefined}
                aria-label={label ?? (field?.labelId ? undefined : messages.treeSelect.placeholder)}
                aria-labelledby={props['aria-labelledby'] ?? field?.labelId}
                aria-describedby={
                  [props['aria-describedby'], field?.descriptionId].filter(Boolean).join(' ') ||
                  undefined
                }
                aria-required={required || undefined}
                aria-invalid={status === 'error' || props['aria-invalid']}
                autoComplete="off"
                className={classes(
                  'leaf-tree-select__input',
                  showCaption && 'leaf-tree-select__input--caption',
                )}
                value={inputValue}
                readOnly={!showSearch || props.readOnly || inputReadOnly}
                disabled={disabled}
                placeholder={
                  selected.length ? undefined : (placeholder ?? messages.treeSelect.placeholder)
                }
                onClick={(event) => {
                  props.onClick?.(event);
                  if (event.defaultPrevented) return;
                  if (open && !showSearch) close();
                  else setOpen(true);
                }}
                onBeforeInput={(event) => {
                  props.onBeforeInput?.(event);
                  if (!event.defaultPrevented) beginSearch();
                }}
                onPaste={(event) => {
                  props.onPaste?.(event);
                  if (!event.defaultPrevented) beginSearch();
                }}
                onCompositionStart={(event) => {
                  props.onCompositionStart?.(event);
                  if (!event.defaultPrevented) beginSearch();
                }}
                onChange={(event) => {
                  setQuery(event.target.value);
                  onSearch?.(event.target.value);
                  setOpen(true);
                }}
                onKeyDown={(event) => {
                  props.onKeyDown?.(event);
                  if (event.defaultPrevented || disabled || event.nativeEvent.isComposing) return;
                  if (
                    !event.ctrlKey &&
                    !event.metaKey &&
                    !event.altKey &&
                    (event.key.length === 1 || event.key === 'Backspace' || event.key === 'Delete')
                  )
                    beginSearch();
                  if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    if (!open) {
                      pendingFocus.current = true;
                      setOpen(true);
                    } else
                      panel.current
                        ?.querySelector<HTMLElement>('[role="treeitem"][tabindex="0"]')
                        ?.focus();
                  } else if (event.key === 'Enter' && !open) {
                    event.preventDefault();
                    setOpen(true);
                  } else if (event.key === 'Backspace' && !searchQuery && multi) {
                    const last = [...selected].reverse().find(canRemove);
                    if (last) {
                      event.preventDefault();
                      commit(selected.filter((key) => key !== last));
                    }
                  }
                }}
              />
            </span>
          </SelectionContent>
          {clearable && (
            <button
              type="button"
              className="leaf-tree-select__clear"
              aria-label={messages.treeSelect.clear}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                commit(selected.filter((key) => !canRemove(key)));
                trigger.current?.focus();
              }}
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            className="leaf-tree-select__arrow"
            tabIndex={-1}
            disabled={disabled}
            aria-label={messages.treeSelect.placeholder}
            onClick={() => {
              trigger.current?.focus();
              if (open) close();
              else setOpen(true);
            }}
          >
            <ChevronDown size={16} aria-hidden="true" />
          </button>
          <FormValue
            value={selected[0] ?? ''}
            name={name}
            form={form}
            required={required}
            disabled={disabled}
            triggerRef={trigger}
          />
          {selected.slice(1).map((key) => (
            <input
              type="hidden"
              key={key}
              name={name}
              form={form}
              value={key}
              disabled={disabled}
            />
          ))}
        </div>
        <FloatingPanel
          resetSurfaceGeometry
          placement={popupPlacement}
          container={getPopupContainer}
          render={popupRender}
          style={popupStyle}
          open={open}
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
          maxWidth={popupMaxWidth}
          maxHeight={320}
          className={classes('leaf-floating leaf-tree-select__panel', popupClassName)}
        >
          <FieldScope>
            <Tree
              virtual={virtual}
              height={listHeight}
              itemHeight={itemHeight}
              loadData={loadData ? lazyLoad : undefined}
              cacheKey={cacheKey}
              disabled={disabled || props.readOnly}
              expandedKeys={treeExpandedKeys ?? expandedKeys}
              onExpand={(keys) => {
                if (treeExpandedKeys === undefined) setExpandedKeys(keys);
                onExpand?.(keys);
              }}
              checkOnClick={treeCheckable}
              expandOnClick
              filterTreeNode={
                filterTreeNode
                  ? (node, query) => {
                      const option = optionRecords.get(node.key);
                      return !!option && filterTreeNode(option, query);
                    }
                  : undefined
              }
              nodeRender={
                nodeRender
                  ? (node) => {
                      const option = optionRecords.get(node.key);
                      return option ? nodeRender(option) : node.title;
                    }
                  : undefined
              }
              onLoadError={(error, node) => {
                const option = optionRecords.get(node.key);
                if (option) onLoadError?.(error, option);
              }}
              id={id}
              data={data}
              aria-label={label ?? messages.treeSelect.placeholder}
              multiple={multi}
              selectable={!treeCheckable}
              checkable={treeCheckable}
              checkStrictly={checkStrictly}
              selectedKeys={treeCheckable ? emptyKeys : selected}
              checkedKeys={selected}
              searchValue={searchQuery}
              notFoundContent={notFoundContent ?? messages.treeSelect.empty}
              highlightFirst={open && !searchQuery}
              onSelect={(keys) => commit(keys)}
              onCheck={(keys) => {
                const checked = new Set(keys);
                commit(
                  checkStrictly || showCheckedStrategy === 'all'
                    ? keys
                    : keys.filter((key) => {
                        const record = records.get(key);
                        if (!record) return false;
                        if (showCheckedStrategy === 'parent')
                          return !record.parent || !checked.has(record.parent);
                        return !(record.node.children ?? []).some((child) =>
                          checked.has(child.key),
                        );
                      }),
                );
              }}
            />
          </FieldScope>
        </FloatingPanel>
      </>
    );
  },
);
InternalTreeSelect.displayName = 'TreeSelect';
export type TreeSelectProps = Omit<
  InternalTreeSelectProps,
  'value' | 'defaultValue' | 'onChange' | 'multiple' | 'treeCheckable'
> &
  (
    | {
        multiple?: false;
        treeCheckable?: false;
        value?: string | null;
        defaultValue?: string | null;
        onChange?: (value: string | null) => void;
      }
    | {
        multiple: true;
        treeCheckable?: boolean;
        value?: readonly string[];
        defaultValue?: readonly string[];
        onChange?: (value: readonly string[]) => void;
      }
    | {
        treeCheckable: true;
        multiple?: boolean;
        value?: readonly string[];
        defaultValue?: readonly string[];
        onChange?: (value: readonly string[]) => void;
      }
  );
export const TreeSelectControl = InternalTreeSelect as React.ForwardRefExoticComponent<
  TreeSelectProps & React.RefAttributes<HTMLInputElement>
>;
export const TreeSelect = forwardRef<HTMLInputElement, TreeSelectProps>(
  function TreeSelect(rawProps, ref) {
    const props = useComponentProps('TreeSelect', rawProps);
    return <TreeSelectControl {...props} ref={ref} />;
  },
);
TreeSelect.displayName = 'TreeSelect';
