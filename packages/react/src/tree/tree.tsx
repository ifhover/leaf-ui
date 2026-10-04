import { ChevronRight, File, Folder, FolderOpen } from 'lucide-react';
import {
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Checkbox } from '../checkbox';
import { useLeafConfig } from '../config-provider/config-provider';
import { Result } from '../result';
import { classes } from '../shared/classes';
import { treeChecks, treeMatches, treeModel } from './model';

export interface TreeNode {
  key: string;
  title: ReactNode;
  children?: readonly TreeNode[];
  icon?: ReactNode;
  disabled?: boolean;
  selectable?: boolean;
  checkable?: boolean;
  disableCheckbox?: boolean;
  searchLabel?: string;
}
export interface TreeSelectInfo {
  node: TreeNode;
  selected: boolean;
  selectedNodes: readonly TreeNode[];
}
export interface TreeCheckInfo {
  node: TreeNode;
  checked: boolean;
  checkedNodes: readonly TreeNode[];
  halfCheckedKeys: readonly string[];
}
export interface TreeExpandInfo {
  node: TreeNode;
  expanded: boolean;
}
export interface TreeProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  data: readonly TreeNode[];
  selectedKeys?: readonly string[];
  defaultSelectedKeys?: readonly string[];
  onSelect?: (keys: string[], info: TreeSelectInfo) => void;
  multiple?: boolean;
  selectable?: boolean;
  checkable?: boolean;
  checkStrictly?: boolean;
  checkedKeys?: readonly string[];
  defaultCheckedKeys?: readonly string[];
  onCheck?: (keys: string[], info: TreeCheckInfo) => void;
  expandedKeys?: readonly string[];
  defaultExpandedKeys?: readonly string[];
  defaultExpandAll?: boolean;
  onExpand?: (keys: string[], info: TreeExpandInfo) => void;
  disabled?: boolean;
  showLine?: boolean;
  showIcon?: boolean;
  searchValue?: string;
  filterTreeNode?: (node: TreeNode, query: string) => boolean;
  notFoundContent?: ReactNode;
}
export function Tree({
  data,
  selectedKeys,
  defaultSelectedKeys = [],
  onSelect,
  multiple = false,
  selectable = true,
  checkable = false,
  checkStrictly = false,
  checkedKeys,
  defaultCheckedKeys = [],
  onCheck,
  expandedKeys,
  defaultExpandedKeys = [],
  defaultExpandAll = false,
  onExpand,
  disabled = false,
  showLine = false,
  showIcon = false,
  searchValue = '',
  filterTreeNode,
  notFoundContent,
  className,
  'aria-label': label,
  ...props
}: TreeProps) {
  const { messages } = useLeafConfig();
  const records = useMemo(() => treeModel(data), [data]);
  const [selection, setSelection] = useState<readonly string[]>(defaultSelectedKeys);
  const [checks, setChecks] = useState<readonly string[]>(defaultCheckedKeys);
  const [expansion, setExpansion] = useState<readonly string[]>(() =>
    defaultExpandAll ? [...records.keys()] : defaultExpandedKeys,
  );
  const selected = selectedKeys ?? selection;
  const expanded = new Set(expandedKeys ?? expansion);
  const state = useMemo(
    () => treeChecks(records, checkedKeys ?? checks, checkStrictly),
    [records, checkedKeys, checks, checkStrictly],
  );
  const checked = new Set(state.checked);
  const half = new Set(state.half);
  const matches = useMemo(
    () => treeMatches(records, searchValue, filterTreeNode),
    [records, searchValue, filterTreeNode],
  );
  const [active, setActive] = useState<string>();
  const elements = useRef(new Map<string, HTMLDivElement>());
  const anchor = useRef<string | undefined>(undefined);
  const typeAhead = useRef({ text: '', time: 0 });
  const visible: TreeNode[] = [];
  const isExpanded = (key: string) => (matches ? matches.visible.has(key) : expanded.has(key));
  const collect = (nodes: readonly TreeNode[]) => {
    for (const node of nodes) {
      if (matches && !matches.visible.has(node.key)) continue;
      visible.push(node);
      if (isExpanded(node.key) && node.children) collect(node.children);
    }
  };
  collect(data);
  const focusKey = visible.some((node) => node.key === active)
    ? active
    : (visible.find((node) => selected.includes(node.key))?.key ?? visible[0]?.key);
  const focus = (key?: string) => {
    if (key) {
      setActive(key);
      elements.current.get(key)?.focus();
    }
  };
  const expand = (node: TreeNode, next: boolean) => {
    if (disabled) return;
    const keys = next
      ? [...new Set([...expanded, node.key])]
      : [...expanded].filter((key) => key !== node.key);
    if (expandedKeys === undefined) setExpansion(keys);
    onExpand?.(keys, { node, expanded: next });
  };
  const select = (
    node: TreeNode,
    modifiers?: { shiftKey: boolean; ctrlKey: boolean; metaKey: boolean },
  ) => {
    if (disabled || node.disabled || !selectable || node.selectable === false) return;
    let next = selected.includes(node.key) ? [] : [node.key];
    if (multiple) {
      if (modifiers?.shiftKey && anchor.current) {
        const first = visible.findIndex((item) => item.key === anchor.current);
        const last = visible.indexOf(node);
        next = visible
          .slice(Math.max(0, Math.min(first, last)), Math.max(first, last) + 1)
          .filter((item) => !item.disabled && item.selectable !== false)
          .map((item) => item.key);
      } else
        next = selected.includes(node.key)
          ? selected.filter((key) => key !== node.key)
          : [...selected, node.key];
    }
    if (!modifiers?.shiftKey) anchor.current = node.key;
    if (selectedKeys === undefined) setSelection(next);
    onSelect?.(next, {
      node,
      selected: next.includes(node.key),
      selectedNodes: next.flatMap((key) => records.get(key)?.node ?? []),
    });
  };
  const check = (node: TreeNode) => {
    if (disabled || node.disabled || node.disableCheckbox || node.checkable === false) return;
    const next = treeChecks(records, state.checked, checkStrictly, {
      key: node.key,
      checked: !checked.has(node.key),
    });
    if (checkedKeys === undefined) setChecks(next.checked);
    onCheck?.(next.checked, {
      node,
      checked: !checked.has(node.key),
      checkedNodes: next.checked.flatMap((key) => records.get(key)?.node ?? []),
      halfCheckedKeys: next.half,
    });
  };
  const keyDown = (event: KeyboardEvent<HTMLDivElement>, node: TreeNode) => {
    if (event.defaultPrevented) return;
    event.stopPropagation();
    const index = visible.indexOf(node);
    const hasChildren = Boolean(node.children?.length);
    if (event.key === 'ArrowDown') focus(visible[Math.min(index + 1, visible.length - 1)]?.key);
    else if (event.key === 'ArrowUp') focus(visible[Math.max(0, index - 1)]?.key);
    else if (event.key === 'Home') focus(visible[0]?.key);
    else if (event.key === 'End') focus(visible.at(-1)?.key);
    else if (event.key === 'ArrowRight') {
      if (hasChildren && !isExpanded(node.key)) expand(node, true);
      else if (hasChildren)
        focus(node.children?.find((child) => !matches || matches.visible.has(child.key))?.key);
    } else if (event.key === 'ArrowLeft') {
      if (hasChildren && isExpanded(node.key)) expand(node, false);
      else focus(records.get(node.key)?.parent);
    } else if (event.key === ' ' || event.key === 'Enter') {
      if (checkable && event.key === ' ') check(node);
      else select(node, event);
    } else if (event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
      const now = Date.now();
      typeAhead.current = {
        text:
          (now - typeAhead.current.time < 600 ? typeAhead.current.text : '') +
          event.key.toLocaleLowerCase(),
        time: now,
      };
      const ordered = [...visible.slice(index + 1), ...visible.slice(0, index + 1)];
      focus(
        ordered.find((item) =>
          (item.searchLabel ?? (typeof item.title === 'string' ? item.title : item.key))
            .toLocaleLowerCase()
            .startsWith(typeAhead.current.text),
        )?.key,
      );
    } else return;
    event.preventDefault();
  };
  const renderNodes = (nodes: readonly TreeNode[], level: number) =>
    nodes
      .filter((node) => !matches || matches.visible.has(node.key))
      .map((node, index, siblings) => {
        const hasChildren = Boolean(node.children?.length);
        const opened = hasChildren && isExpanded(node.key);
        const inactive = disabled || node.disabled;
        const Icon = hasChildren ? (opened ? FolderOpen : Folder) : File;
        return (
          <div
            role="treeitem"
            key={node.key}
            aria-level={level}
            aria-label={
              node.searchLabel ?? (typeof node.title === 'string' ? node.title : undefined)
            }
            aria-posinset={index + 1}
            aria-setsize={siblings.length}
            aria-expanded={hasChildren ? opened : undefined}
            aria-selected={
              selectable && node.selectable !== false ? selected.includes(node.key) : undefined
            }
            aria-checked={
              checkable && node.checkable !== false
                ? half.has(node.key)
                  ? 'mixed'
                  : checked.has(node.key)
                : undefined
            }
            aria-disabled={inactive || undefined}
            tabIndex={focusKey === node.key ? 0 : -1}
            className="leaf-tree__item"
            data-node-key={node.key}
            ref={(element) => {
              if (element) elements.current.set(node.key, element);
              else elements.current.delete(node.key);
            }}
            onFocus={(event) => {
              if (event.target === event.currentTarget) setActive(node.key);
            }}
            onKeyDown={(event) => keyDown(event, node)}
            onClick={(event) => {
              event.stopPropagation();
              if (
                !event.currentTarget.firstElementChild?.contains(event.target as Node) ||
                (event.target as HTMLElement).closest('.leaf-tree__check')
              )
                return;
              focus(node.key);
              select(node, event);
            }}
          >
            <div
              className="leaf-tree__row"
              data-selected={selected.includes(node.key) || undefined}
              data-disabled={inactive || undefined}
              style={{ paddingInlineStart: `${(level - 1) * 20 + 4}px` }}
            >
              <button
                type="button"
                className="leaf-tree__toggle"
                tabIndex={-1}
                aria-label={`${opened ? messages.collapseNode : messages.expand} ${node.searchLabel ?? (typeof node.title === 'string' ? node.title : node.key)}`}
                disabled={disabled}
                data-hidden={!hasChildren || undefined}
                aria-hidden={!hasChildren || undefined}
                onClick={(event) => {
                  event.stopPropagation();
                  focus(node.key);
                  expand(node, !opened);
                }}
              >
                {hasChildren && (
                  <ChevronRight
                    size={14}
                    style={{ transform: opened ? 'rotate(90deg)' : undefined }}
                    aria-hidden="true"
                  />
                )}
              </button>
              {checkable && node.checkable !== false && (
                <span className="leaf-tree__check">
                  <Checkbox
                    checked={checked.has(node.key)}
                    indeterminate={half.has(node.key)}
                    disabled={inactive || node.disableCheckbox}
                    tabIndex={-1}
                    aria-label={
                      node.searchLabel ?? (typeof node.title === 'string' ? node.title : node.key)
                    }
                    onChange={() => {
                      focus(node.key);
                      check(node);
                    }}
                  />
                </span>
              )}
              {(showIcon || node.icon) && (
                <span className="leaf-tree__icon" aria-hidden="true">
                  {node.icon ?? <Icon size={16} />}
                </span>
              )}
              <span
                className="leaf-tree__title"
                data-match={matches?.matched.has(node.key) || undefined}
              >
                {node.title}
              </span>
            </div>
            {opened && (
              <fieldset
                className="leaf-tree__group"
                style={{ '--leaf-tree-line-left': `${(level - 1) * 20 + 14}px` } as CSSProperties}
              >
                {renderNodes(node.children ?? [], level + 1)}
              </fieldset>
            )}
          </div>
        );
      });
  return (
    <div
      {...props}
      role="tree"
      aria-label={label ?? messages.tree}
      aria-multiselectable={multiple || checkable || undefined}
      aria-disabled={disabled || undefined}
      className={classes('leaf-tree', showLine && 'leaf-tree--lines', className)}
    >
      {visible.length
        ? renderNodes(data, 1)
        : (notFoundContent ?? <Result size="sm" title={messages.empty} icon={null} />)}
    </div>
  );
}
