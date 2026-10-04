import { ChevronDown, X } from 'lucide-react';
import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLeafConfig } from '../config-provider/config-provider';
import { useFormField } from '../form/form';
import { classes } from '../shared/classes';
import { FormValue, useFieldValue, useMergedRef } from '../shared/field';
import { FloatingPanel, useFloatingDismiss, usePopupState } from '../shared/floating';
import type { ControlSize, ControlStatus } from '../shared/types';
import { Tree, type TreeNode } from '../tree';
import { treeModel } from '../tree/model';

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
export interface TreeSelectProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'value' | 'defaultValue' | 'onChange' | 'size' | 'multiple'
  > {
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
}
const emptyKeys: readonly string[] = [];
export const TreeSelect = forwardRef<HTMLInputElement, TreeSelectProps>(function TreeSelect(
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
    popupWidth,
    popupMaxWidth = 420,
    notFoundContent,
    onOpenChange,
    loadData,
    onLoadError,
    virtual = false,
    listHeight = 256,
    itemHeight = 34,
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
  const { messages } = useLeafConfig();
  const field = useFormField();
  const disabled = disabledProp ?? field?.disabled;
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
  const [query, setQuery] = useState('');
  const [open, setOpen] = usePopupState(disabled, onOpenChange);
  const id = `${useId()}-tree-select`;
  const [loadedOptions, setLoadedOptions] = useState<Map<string, readonly TreeSelectOption[]>>(
    new Map(),
  );
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
  const close = () => {
    setOpen(false);
    setQuery('');
  };
  useFloatingDismiss(open, close, trigger, panel, root);
  useEffect(() => {
    if (!open) setQuery('');
    else if (pendingFocus.current) {
      panel.current?.querySelector<HTMLElement>('[role="treeitem"][tabindex="0"]')?.focus();
      pendingFocus.current = false;
    }
  }, [open]);
  const commit = (keys: readonly string[]) => {
    const next: TreeSelectValue = multi ? [...keys] : (keys[0] ?? null);
    setCurrent(next);
    onChange?.(next);
    setQuery('');
    if (!multi) {
      setOpen(false);
      trigger.current?.focus();
    }
  };
  const canRemove = (key: string) =>
    !records.get(key)?.node.disabled && !records.get(key)?.node.disableCheckbox;
  const clearable = allowClear && selected.some(canRemove) && !disabled;
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
  const showCaption =
    !multi && !query && selected[0] !== undefined && ((showSearch && open) || hasRichCaption);
  const inputValue =
    multi || (showSearch && open)
      ? query
      : selected[0] === undefined
        ? ''
        : a11yCaption(selected[0]);
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
        data-disabled={disabled || undefined}
        data-status={status}
        data-open={open || undefined}
        data-clearable={clearable || undefined}
        onClick={(event) => {
          if (!disabled && !(event.target as HTMLElement).closest('button')) {
            trigger.current?.focus();
            setOpen(true);
          }
        }}
      >
        <div className="leaf-tree-select__content">
          {multi &&
            selected.map((key) => (
              <span className="leaf-tree-select__tag" key={key}>
                <span>{caption(key)}</span>
                {canRemove(key) && !disabled && (
                  <button
                    type="button"
                    aria-label={`${messages.remove} ${a11yCaption(key)}`}
                    onClick={() => commit(selected.filter((item) => item !== key))}
                  >
                    <X size={12} aria-hidden="true" />
                  </button>
                )}
              </span>
            ))}
          <span className="leaf-tree-select__input-wrap">
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
              aria-label={label ?? (field?.labelId ? undefined : messages.select)}
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
              readOnly={!showSearch || props.readOnly}
              disabled={disabled}
              placeholder={selected.length ? undefined : (placeholder ?? messages.select)}
              onChange={(event) => {
                setQuery(event.target.value);
                onSearch?.(event.target.value);
                setOpen(true);
              }}
              onKeyDown={(event) => {
                props.onKeyDown?.(event);
                if (event.defaultPrevented || disabled) return;
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
                } else if (event.key === 'Backspace' && !query && multi) {
                  const last = [...selected].reverse().find(canRemove);
                  if (last) commit(selected.filter((key) => key !== last));
                }
              }}
            />
          </span>
        </div>
        {clearable && (
          <button
            type="button"
            className="leaf-tree-select__clear"
            aria-label={messages.clearSelection}
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
          aria-label={messages.select}
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
          <input type="hidden" key={key} name={name} form={form} value={key} disabled={disabled} />
        ))}
      </div>
      <FloatingPanel
        open={open}
        triggerRef={root}
        panelRef={panel}
        minWidth="trigger"
        width={popupWidth ?? 'max-content'}
        maxWidth={popupMaxWidth}
        maxHeight={320}
        className="leaf-floating leaf-tree-select__panel"
      >
        <Tree
          virtual={virtual}
          height={listHeight}
          itemHeight={itemHeight}
          loadData={
            loadData
              ? async (node, signal) => {
                  const option = optionRecords.get(node.key);
                  if (!option) return [];
                  const children = await loadData(option, signal);
                  if (!signal.aborted)
                    setLoadedOptions((previous) => new Map(previous).set(node.key, children));
                  const convert = (entries: readonly TreeSelectOption[]): TreeNode[] =>
                    entries.map(({ value: key, label: title, children, ...entry }) => ({
                      ...entry,
                      key,
                      title,
                      children: children ? convert(children) : undefined,
                    }));
                  return convert(children);
                }
              : undefined
          }
          onLoadError={(error, node) => {
            const option = optionRecords.get(node.key);
            if (option) onLoadError?.(error, option);
          }}
          id={id}
          data={data}
          aria-label={label ?? messages.select}
          multiple={multi}
          selectable={!treeCheckable}
          checkable={treeCheckable}
          checkStrictly={checkStrictly}
          selectedKeys={treeCheckable ? emptyKeys : selected}
          checkedKeys={selected}
          searchValue={query}
          defaultExpandAll={defaultExpandAll}
          defaultExpandedKeys={treeDefaultExpandedKeys}
          notFoundContent={notFoundContent}
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
                    return !(record.node.children ?? []).some((child) => checked.has(child.key));
                  }),
            );
          }}
        />
      </FloatingPanel>
    </>
  );
});
TreeSelect.displayName = 'TreeSelect';
