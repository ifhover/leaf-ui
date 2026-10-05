import { useVirtualizer } from '@tanstack/react-virtual';
import { ChevronRight, File, Folder, FolderOpen, LoaderCircle } from 'lucide-react';
import {
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Checkbox } from '../checkbox';
import { useLeafConfig } from '../config-provider/context';
import { Result } from '../result';
import { classes } from '../shared/classes';
import { TreeDragRow, TreeDragScope } from './drag';
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
  isLeaf?: boolean;
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
export interface TreeDropInfo {
  node: TreeNode;
  target: TreeNode;
  position: 'before' | 'inside' | 'after';
  data: TreeNode[];
}
export interface TreeProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect' | 'onDrop' | 'onLoad' | 'draggable'> {
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
  loadData?: (node: TreeNode, signal: AbortSignal) => Promise<readonly TreeNode[]>;
  cacheKey?: string | number;
  nodeRender?: (node: TreeNode) => ReactNode;
  onLoad?: (node: TreeNode, children: readonly TreeNode[]) => void;
  onLoadError?: (error: unknown, node: TreeNode) => void;
  virtual?: boolean;
  height?: number;
  itemHeight?: number;
  draggable?: boolean | ((node: TreeNode) => boolean);
  allowDrop?: (info: Omit<TreeDropInfo, 'data'>) => boolean;
  onDrop?: (info: TreeDropInfo) => void;
}
export function Tree({
  data: suppliedData,
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
  loadData,
  cacheKey,
  nodeRender,
  onLoad,
  onLoadError,
  virtual = false,
  height = 320,
  itemHeight = 34,
  draggable = false,
  allowDrop,
  onDrop,
  className,
  'aria-label': label,
  ...props
}: TreeProps) {
  const { messages, direction } = useLeafConfig();
  const [loaded, setLoaded] = useState<Map<string, readonly TreeNode[]>>(new Map());
  const [loading, setLoading] = useState<readonly string[]>([]);
  const requests = useRef(new Map<string, AbortController>());
  const latestLoad = useRef({ loadData, onLoad, onLoadError });
  latestLoad.current = { loadData, onLoad, onLoadError };
  // biome-ignore lint/correctness/useExhaustiveDependencies: Invalidate node caches whenever the supplied data, loader or cache version changes.
  useEffect(() => {
    for (const request of requests.current.values()) request.abort();
    requests.current.clear();
    setLoaded(new Map());
    setLoading([]);
  }, [suppliedData, loadData, cacheKey]);
  const data = useMemo(() => {
    const merge = (nodes: readonly TreeNode[]): TreeNode[] =>
      nodes.map((node) => {
        const children = node.children ?? loaded.get(node.key);
        return children
          ? { ...node, children: merge(children), isLeaf: children.length === 0 }
          : node;
      });
    return merge(suppliedData);
  }, [suppliedData, loaded]);
  useEffect(
    () => () => {
      for (const request of requests.current.values()) request.abort();
      requests.current.clear();
    },
    [],
  );
  const load = useCallback(
    (node: TreeNode) => {
      const callback = latestLoad.current.loadData;
      if (
        !callback ||
        node.isLeaf ||
        node.children !== undefined ||
        loaded.has(node.key) ||
        requests.current.has(node.key)
      )
        return;
      const request = new AbortController();
      requests.current.set(node.key, request);
      setLoading((previous) => [...previous, node.key]);
      Promise.resolve()
        .then(() => (request.signal.aborted ? [] : callback(node, request.signal)))
        .then((children) => {
          if (request.signal.aborted) return;
          setLoaded((previous) => new Map(previous).set(node.key, children ?? []));
          latestLoad.current.onLoad?.(node, children ?? []);
        })
        .catch((reason) => {
          if (!request.signal.aborted) latestLoad.current.onLoadError?.(reason, node);
        })
        .finally(() => {
          // A replayed effect may have started a newer request for the same node.
          if (requests.current.get(node.key) !== request) return;
          requests.current.delete(node.key);
          if (!request.signal.aborted)
            setLoading((previous) => previous.filter((key) => key !== node.key));
        });
    },
    [loaded],
  );
  const records = useMemo(() => treeModel(data), [data]);
  const [selection, setSelection] = useState<readonly string[]>(defaultSelectedKeys);
  const [checks, setChecks] = useState<readonly string[]>(defaultCheckedKeys);
  const [expansion, setExpansion] = useState<readonly string[]>(() =>
    defaultExpandAll ? [...records.keys()] : defaultExpandedKeys,
  );
  const selected = selectedKeys ?? selection;
  const expanded = new Set(expandedKeys ?? expansion);
  useEffect(() => {
    if (disabled) return;
    for (const key of expandedKeys ?? expansion) {
      const record = records.get(key);
      if (record) load(record.node);
    }
  }, [records, expandedKeys, expansion, disabled, load]);
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
  const root = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: visible.length,
    getScrollElement: () => root.current,
    estimateSize: () => Math.max(24, itemHeight),
    overscan: 5,
    enabled: virtual,
    initialRect: { height, width: 400 },
    getItemKey: (index) => visible[index]?.key ?? index,
  });
  const focusKey = visible.some((node) => node.key === active)
    ? active
    : (visible.find((node) => selected.includes(node.key))?.key ?? visible[0]?.key);
  const focus = (key?: string) => {
    if (key) {
      setActive(key);
      if (virtual) {
        const index = visible.findIndex((node) => node.key === key);
        if (index >= 0) virtualizer.scrollToIndex(index, { align: 'auto' });
        requestAnimationFrame(() => elements.current.get(key)?.focus());
      }
      elements.current.get(key)?.focus();
    }
  };
  const expand = (node: TreeNode, next: boolean) => {
    if (disabled) return;
    if (next) load(node);
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
    if (event.defaultPrevented || (event.target as HTMLElement).closest('.leaf-tree__drag-handle'))
      return;
    event.stopPropagation();
    const index = visible.indexOf(node);
    const hasChildren = Boolean(
      node.children?.length || (loadData && !node.isLeaf && node.children === undefined),
    );
    if (event.key === 'ArrowDown') focus(visible[Math.min(index + 1, visible.length - 1)]?.key);
    else if (event.key === 'ArrowUp') focus(visible[Math.max(0, index - 1)]?.key);
    else if (event.key === 'Home') focus(visible[0]?.key);
    else if (event.key === 'End') focus(visible.at(-1)?.key);
    else if (event.key === (direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight')) {
      if (hasChildren && !isExpanded(node.key)) expand(node, true);
      else if (hasChildren)
        focus(node.children?.find((child) => !matches || matches.visible.has(child.key))?.key);
    } else if (event.key === (direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft')) {
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
  const renderNode = (
    node: TreeNode,
    level: number,
    index: number,
    setSize: number,
    flat = false,
  ): ReactNode => {
    const hasChildren = Boolean(
      node.children?.length || (loadData && !node.isLeaf && node.children === undefined),
    );
    const opened = hasChildren && isExpanded(node.key);
    const inactive = disabled || node.disabled;
    const Icon = hasChildren ? (opened ? FolderOpen : Folder) : File;
    return (
      <div
        role="treeitem"
        key={node.key}
        aria-level={level}
        aria-label={node.searchLabel ?? (typeof node.title === 'string' ? node.title : undefined)}
        aria-posinset={index + 1}
        aria-setsize={setSize}
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
            (event.target as HTMLElement).closest('.leaf-tree__check, .leaf-tree__drag-handle')
          )
            return;
          focus(node.key);
          select(node, event);
        }}
      >
        <TreeRow
          enabled={Boolean(draggable)}
          node={node}
          draggable={
            !disabled && Boolean(typeof draggable === 'function' ? draggable(node) : draggable)
          }
        >
          {' '}
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
              {loading.includes(node.key) ? (
                <LoaderCircle size={14} className="leaf-tree__spinner" aria-hidden="true" />
              ) : (
                hasChildren && (
                  <ChevronRight
                    size={14}
                    style={{ transform: opened ? 'rotate(90deg)' : undefined }}
                    aria-hidden="true"
                  />
                )
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
              {nodeRender?.(node) ?? node.title}
            </span>
          </div>
        </TreeRow>
        {opened && !flat && (
          <fieldset
            className="leaf-tree__group"
            style={{ '--leaf-tree-line-left': `${(level - 1) * 20 + 14}px` } as CSSProperties}
          >
            {renderNodes(node.children ?? [], level + 1)}
          </fieldset>
        )}
      </div>
    );
  };
  const renderNodes = (nodes: readonly TreeNode[], level: number): ReactNode => {
    const siblings = nodes.filter((node) => !matches || matches.visible.has(node.key));
    return siblings.map((node, index) => renderNode(node, level, index, siblings.length));
  };
  const content = (
    <div
      {...props}
      ref={root}
      style={{ ...(virtual ? { height, overflow: 'auto' } : {}), ...props.style }}
      role="tree"
      aria-label={label ?? messages.tree}
      aria-multiselectable={multiple || checkable || undefined}
      aria-disabled={disabled || undefined}
      className={classes('leaf-tree', showLine && 'leaf-tree--lines', className)}
    >
      {visible.length ? (
        virtual ? (
          <div style={{ position: 'relative', height: virtualizer.getTotalSize() }}>
            {virtualizer.getVirtualItems().map((row) => {
              const node = visible[row.index];
              if (!node) return null;
              const record = records.get(node.key);
              const siblings = (
                record?.parent ? (records.get(record.parent)?.node.children ?? []) : data
              ).filter((item) => !matches || matches.visible.has(item.key));
              return (
                <div
                  key={node.key}
                  ref={virtualizer.measureElement}
                  data-index={row.index}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${row.start}px)`,
                  }}
                >
                  {renderNode(
                    node,
                    record?.level ?? 1,
                    siblings.findIndex((item) => item.key === node.key),
                    siblings.length,
                    true,
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          renderNodes(data, 1)
        )
      ) : (
        (notFoundContent ?? <Result size="sm" title={messages.empty} icon={null} />)
      )}
    </div>
  );
  return draggable ? (
    <TreeDragScope data={data} nodes={records} allowDrop={allowDrop} onDrop={onDrop}>
      {content}
    </TreeDragScope>
  ) : (
    content
  );
}

function TreeRow({
  enabled,
  node,
  draggable,
  children,
}: {
  enabled: boolean;
  node: TreeNode;
  draggable: boolean;
  children: ReactNode;
}) {
  return enabled ? (
    <TreeDragRow node={node} draggable={draggable}>
      {children}
    </TreeDragRow>
  ) : (
    children
  );
}
