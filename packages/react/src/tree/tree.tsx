import { Check, ChevronRight, File, Folder, FolderOpen, LoaderCircle } from 'lucide-react';
import {
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CheckboxControl as Checkbox } from '../checkbox/checkbox';
import { useComponentProps } from '../config-provider/component-defaults';
import { useLeafConfig } from '../config-provider/context';
import { estimateControlHeight } from '../density';
import { ResultControl as Result } from '../result/result';
import { ScrollbarControl } from '../scrollbar/scrollbar';
import { classes } from '../shared/classes';
import { inertProps } from '../shared/inert';
import { createLazyModule } from '../shared/lazy-module';
import { useFormattedText } from '../shared/use-formatted-text';
import { treeChecks, treeMatches, treeModel } from './model';

const useTreeVirtualModule = createLazyModule(() => import('./virtual-nodes'));
const useTreeDragModule = createLazyModule(() => import('./drag'));

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
export function TreeControl({
  data: suppliedData,
  selectedKeys,
  defaultSelectedKeys = [],
  onSelect,
  multiple = false,
  selectable = true,
  checkable = false,
  checkOnClick = false,
  expandOnClick = false,
  highlightFirst = false,
  hideSelectionMark = false,
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
  itemHeight: itemHeightProp,
  draggable = false,
  allowDrop,
  onDrop,
  className,
  'aria-label': label,
  ...props
}: TreeProps & {
  checkOnClick?: boolean;
  expandOnClick?: boolean;
  highlightFirst?: boolean;
  hideSelectionMark?: boolean;
}) {
  const { messages, direction, theme, density } = useLeafConfig();
  const format = useFormattedText();
  const itemHeight = itemHeightProp ?? estimateControlHeight(theme, density);
  const treeId = useId();
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
  const rawExpanded = expandedKeys ?? expansion;
  const expanded = useMemo(() => new Set(rawExpanded), [rawExpanded]);
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const loadingSet = useMemo(() => new Set(loading), [loading]);
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
  const checked = useMemo(() => new Set(state.checked), [state.checked]);
  const half = useMemo(() => new Set(state.half), [state.half]);
  const matches = useMemo(
    () => treeMatches(records, searchValue, filterTreeNode),
    [records, searchValue, filterTreeNode],
  );
  const [active, setActive] = useState<string>();
  const [hovered, setHovered] = useState<string>();
  const [focusWithin, setFocusWithin] = useState(false);
  const elements = useRef(new Map<string, HTMLDivElement>());
  const anchor = useRef<string | undefined>(undefined);
  const typeAhead = useRef({ text: '', time: 0 });
  const isExpanded = (key: string) => (matches ? matches.visible.has(key) : expanded.has(key));
  const { visible, visibleKeys, siblingMeta } = useMemo(() => {
    const nextVisible: TreeNode[] = [];
    const nextKeys = new Set<string>();
    const nextSiblingMeta = new Map<string, { index: number; size: number }>();
    const collect = (nodes: readonly TreeNode[]) => {
      const siblings = matches ? nodes.filter((node) => matches.visible.has(node.key)) : nodes;
      siblings.forEach((node, index) => {
        nextVisible.push(node);
        nextKeys.add(node.key);
        nextSiblingMeta.set(node.key, { index, size: siblings.length });
        const nodeExpanded = matches ? matches.visible.has(node.key) : expanded.has(node.key);
        if (nodeExpanded && node.children) collect(node.children);
      });
    };
    collect(data);
    return { visible: nextVisible, visibleKeys: nextKeys, siblingMeta: nextSiblingMeta };
  }, [data, matches, expanded]);
  const root = useRef<HTMLDivElement>(null);
  const virtualScrollRef = useRef<((index: number) => void) | null>(null);
  const dragEnabled = Boolean(draggable);
  const virtualModule = useTreeVirtualModule(virtual);
  const dragModule = useTreeDragModule(dragEnabled);
  const DragRowComponent = dragModule?.TreeDragRow;
  const DragScopeComponent = dragModule?.TreeDragScope;
  const focusKey =
    active && visibleKeys.has(active)
      ? active
      : (visible.find((node) => selectedSet.has(node.key))?.key ?? visible[0]?.key);
  const itemIds = useMemo(
    () => new Map([...records.keys()].map((key, index) => [key, `${treeId}-${index}`])),
    [records, treeId],
  );
  const hoveredKey = hovered && visibleKeys.has(hovered) ? hovered : undefined;
  const focusedKey = focusWithin && focusKey && visibleKeys.has(focusKey) ? focusKey : undefined;
  const highlightKey = hoveredKey ?? focusedKey ?? (highlightFirst ? focusKey : undefined);
  const focus = (key?: string) => {
    if (key) {
      setActive(key);
      if (virtual) {
        const index = visible.findIndex((node) => node.key === key);
        if (index >= 0) virtualScrollRef.current?.(index);
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
    let next = selectedSet.has(node.key) ? [] : [node.key];
    if (multiple) {
      if (modifiers?.shiftKey && anchor.current) {
        const first = visible.findIndex((item) => item.key === anchor.current);
        const last = visible.indexOf(node);
        next = visible
          .slice(Math.max(0, Math.min(first, last)), Math.max(first, last) + 1)
          .filter((item) => !item.disabled && item.selectable !== false)
          .map((item) => item.key);
      } else
        next = selectedSet.has(node.key)
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
    if (
      event.target !== event.currentTarget &&
      (event.target as HTMLElement).closest(
        'input,textarea,select,button,a[href],[contenteditable="true"]',
      )
    )
      return;
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
      if (checkable && (event.key === ' ' || checkOnClick)) check(node);
      else if (expandOnClick && hasChildren && (!selectable || node.selectable === false))
        expand(node, !isExpanded(node.key));
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
          selectable && node.selectable !== false ? selectedSet.has(node.key) : undefined
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
            (event.target as HTMLElement).closest(
              '.leaf-tree__check, .leaf-tree__drag-handle, input, textarea, select, button, a[href], [contenteditable="true"]',
            )
          )
            return;
          focus(node.key);
          if (checkable && checkOnClick) check(node);
          else if (expandOnClick && hasChildren && (!selectable || node.selectable === false))
            expand(node, !opened);
          else select(node, event);
        }}
      >
        <TreeRow
          enabled={dragEnabled}
          DragRowComponent={DragRowComponent}
          node={node}
          draggable={
            !disabled && Boolean(typeof draggable === 'function' ? draggable(node) : draggable)
          }
        >
          {' '}
          <div
            className="leaf-tree__row"
            id={itemIds.get(node.key)}
            data-selected={selectedSet.has(node.key) || undefined}
            data-disabled={inactive || undefined}
            data-highlighted={highlightKey === node.key || undefined}
            style={{ paddingInlineStart: `${(level - 1) * 20 + 4}px` }}
            onPointerEnter={() => {
              if (!inactive) setHovered(node.key);
            }}
            onPointerLeave={() => {
              setHovered((current) => (current === node.key ? undefined : current));
            }}
          >
            {showLine &&
              flat &&
              level > 1 &&
              Array.from({ length: level - 1 }, (_, depth) => (
                <span
                  // biome-ignore lint/suspicious/noArrayIndexKey: 虚线引导线按层级深度固定定位。
                  key={depth}
                  aria-hidden="true"
                  className="leaf-tree__indent-line"
                  style={{ '--leaf-tree-line-left': `${depth * 20 + 14}px` } as CSSProperties}
                />
              ))}
            <button
              type="button"
              className="leaf-tree__toggle"
              tabIndex={-1}
              aria-label={format(opened ? 'tree.collapseNode' : 'tree.expandNode', {
                label: node.searchLabel ?? (typeof node.title === 'string' ? node.title : node.key),
              })}
              disabled={disabled}
              data-hidden={!hasChildren || undefined}
              data-open={opened || undefined}
              aria-hidden={!hasChildren || undefined}
              onClick={(event) => {
                event.stopPropagation();
                focus(node.key);
                expand(node, !opened);
              }}
            >
              {loadingSet.has(node.key) ? (
                <LoaderCircle size={14} className="leaf-tree__spinner" aria-hidden="true" />
              ) : (
                hasChildren && <ChevronRight size={14} aria-hidden="true" />
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
            {selectable && !checkable && !hideSelectionMark && node.selectable !== false && (
              <Check size={15} aria-hidden="true" className="leaf-tree__selection-mark" />
            )}
          </div>
        </TreeRow>
        {hasChildren && !flat && (
          <TreeGroup
            open={opened}
            style={{ '--leaf-tree-line-left': `${(level - 1) * 20 + 14}px` } as CSSProperties}
          >
            {() => renderNodes(node.children ?? [], level + 1)}
          </TreeGroup>
        )}
      </div>
    );
  };

  const renderNodes = (nodes: readonly TreeNode[], level: number): ReactNode => {
    const siblings = nodes.filter((node) => !matches || matches.visible.has(node.key));
    return siblings.map((node, index) => renderNode(node, level, index, siblings.length));
  };
  const content = (
    <ScrollbarControl
      ref={root}
      viewportProps={{
        ...props,
        'aria-multiselectable': multiple || checkable || undefined,
        'aria-disabled': disabled || undefined,
        onFocus: (event) => {
          props.onFocus?.(event);
          if (!event.defaultPrevented) setFocusWithin(true);
        },
        onBlur: (event) => {
          props.onBlur?.(event);
          if (
            !event.defaultPrevented &&
            !event.currentTarget.contains(event.relatedTarget as Node | null)
          )
            setFocusWithin(false);
        },
        onPointerLeave: (event) => {
          props.onPointerLeave?.(event);
          if (!event.defaultPrevented) setHovered(undefined);
        },
      }}
      style={{ ...(virtual ? { height } : {}), ...props.style }}
      viewportStyle={{ position: 'relative' }}
      role="tree"
      aria-label={label ?? messages.tree.label}
      tabIndex={-1}
      scrollbarTabIndex={-1}
      className={classes('leaf-tree', showLine && 'leaf-tree--lines', className)}
    >
      {visible.length ? (
        virtual ? (
          virtualModule ? (
            <virtualModule.TreeVirtualNodes
              visible={visible}
              records={records}
              siblingMeta={siblingMeta}
              scrollElement={root}
              height={height}
              itemHeight={itemHeight}
              scrollRef={virtualScrollRef}
              renderNode={renderNode}
            />
          ) : (
            <div
              style={{ position: 'relative', height: visible.length * Math.max(24, itemHeight) }}
            >
              {visible.slice(0, 24).map((node) => {
                const record = records.get(node.key);
                const meta = siblingMeta.get(node.key);
                return (
                  <div key={node.key}>
                    {renderNode(node, record?.level ?? 1, meta?.index ?? 0, meta?.size ?? 1, true)}
                  </div>
                );
              })}
            </div>
          )
        ) : (
          renderNodes(data, 1)
        )
      ) : (
        (notFoundContent ?? <Result title={messages.select.empty} icon={null} />)
      )}
    </ScrollbarControl>
  );
  return dragEnabled && DragScopeComponent ? (
    <DragScopeComponent data={data} nodes={records} allowDrop={allowDrop} onDrop={onDrop}>
      {content}
    </DragScopeComponent>
  ) : (
    content
  );
}

function TreeGroup({
  open,
  style,
  children,
}: {
  open: boolean;
  style: CSSProperties;
  children: () => ReactNode;
}) {
  const [visited, setVisited] = useState(open);
  if (open && !visited) setVisited(true);
  return (
    <fieldset
      className="leaf-tree__group"
      style={style}
      aria-hidden={!open || undefined}
      {...inertProps(!open)}
      data-open={open || undefined}
    >
      <div className="leaf-tree__group-inner">
        <div className="leaf-tree__group-content">{visited && children()}</div>
      </div>
    </fieldset>
  );
}

function TreeRow({
  enabled,
  DragRowComponent,
  node,
  draggable,
  children,
}: {
  enabled: boolean;
  DragRowComponent?: (props: {
    node: TreeNode;
    draggable: boolean;
    children: ReactNode;
  }) => ReactNode;
  node: TreeNode;
  draggable: boolean;
  children: ReactNode;
}) {
  return enabled && DragRowComponent ? (
    <DragRowComponent node={node} draggable={draggable}>
      {children}
    </DragRowComponent>
  ) : (
    children
  );
}

export function Tree(rawProps: TreeProps) {
  const props = useComponentProps('Tree', rawProps);
  return <TreeControl {...props} />;
}
