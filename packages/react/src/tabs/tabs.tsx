import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Ellipsis, GripVertical, Plus, X } from 'lucide-react';
import {
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { Button } from '../button';
import { useLeafConfig } from '../config-provider/context';
import { Dropdown } from '../dropdown';
import { classes } from '../shared/classes';
import type { ControlSize } from '../shared/types';
import { useText } from '../shared/use-text';

export interface TabItem {
  key: string;
  label: ReactNode;
  children: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
  closable?: boolean;
}
export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items: readonly TabItem[];
  activeKey?: string;
  defaultActiveKey?: string;
  onChange?: (key: string) => void;
  type?: 'line' | 'card';
  placement?: 'top' | 'bottom' | 'left' | 'right';
  size?: ControlSize;
  activationMode?: 'automatic' | 'manual';
  destroyInactive?: boolean;
  extra?: ReactNode;
  onClose?: (key: string, event: MouseEvent<HTMLButtonElement>) => void;
  onAdd?: () => void;
  addLabel?: string;
  overflow?: boolean;
  sortable?: boolean;
  onReorder?: (items: TabItem[]) => void;
}
export function Tabs({
  items,
  activeKey,
  defaultActiveKey,
  onChange,
  type = 'line',
  placement = 'top',
  size = 'md',
  activationMode = 'automatic',
  destroyInactive = false,
  extra,
  onClose,
  onAdd,
  addLabel,
  overflow = true,
  sortable = false,
  onReorder,
  className,
  'aria-label': label,
  ...props
}: TabsProps) {
  const { messages, direction } = useLeafConfig();
  const t = useText();
  const enabled = items.filter((item) => !item.disabled);
  const [internal, setInternal] = useState(defaultActiveKey ?? enabled[0]?.key);
  const requested = activeKey ?? internal;
  const selected = enabled.find((item) => item.key === requested)?.key ?? enabled[0]?.key;
  const [focused, setFocused] = useState<string>();
  const focusKey = enabled.some((item) => item.key === focused) ? focused : selected;
  const [visited, setVisited] = useState<readonly string[]>(selected ? [selected] : []);
  if (selected && !visited.includes(selected)) setVisited([...visited, selected]);
  const id = useId();
  const list = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLDivElement>(null);
  const [overflowKeys, setOverflowKeys] = useState<string[]>([]);
  const sorting = sortable && Boolean(onReorder);
  // biome-ignore lint/correctness/useExhaustiveDependencies: Observe the new tab elements after the item list changes.
  useEffect(() => {
    const node = list.current;
    const container = header.current;
    if (!overflow || !node || !container) {
      setOverflowKeys([]);
      return;
    }
    const measure = () => {
      const horizontal = placement === 'top' || placement === 'bottom';
      const entries = Array.from(node.querySelectorAll<HTMLElement>('[data-tab-key]'));
      const more = container.querySelector<HTMLElement>('[data-tabs-more]');
      const fullSize =
        (horizontal ? node.clientWidth : node.clientHeight) +
        (more ? (horizontal ? more.offsetWidth : more.offsetHeight) + 16 : 0);
      const total = horizontal ? node.scrollWidth : node.scrollHeight;
      const rect = node.getBoundingClientRect();
      const keys =
        total <= fullSize + 1
          ? []
          : entries
              .filter((entry) => {
                const item = entry.getBoundingClientRect();
                return horizontal
                  ? item.left < rect.left - 1 || item.right > rect.right + 1
                  : item.top < rect.top - 1 || item.bottom > rect.bottom + 1;
              })
              .map((entry) => entry.dataset.tabKey ?? '');
      setOverflowKeys((previous) =>
        previous.length === keys.length && previous.every((key, index) => key === keys[index])
          ? previous
          : keys,
      );
    };
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(node);
    observer?.observe(container);
    for (const entry of node.children) observer?.observe(entry);
    node.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect();
      node.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [overflow, placement, items]);
  const choose = (key: string) => {
    if (!enabled.some((item) => item.key === key)) return;
    if (activeKey === undefined) setInternal(key);
    if (key !== selected) onChange?.(key);
  };
  return (
    <div
      {...props}
      className={classes(
        'leaf-tabs',
        `leaf-tabs--${type}`,
        `leaf-tabs--${placement}`,
        `leaf-tabs--${size}`,
        className,
      )}
    >
      <TabDragScope enabled={sorting} items={items} onReorder={onReorder}>
        <div className="leaf-tabs__header" ref={header}>
          <div
            ref={list}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setFocused(undefined);
            }}
            role="tablist"
            aria-label={label}
            aria-orientation={
              placement === 'left' || placement === 'right' ? 'vertical' : 'horizontal'
            }
            className="leaf-tabs__list"
          >
            <SortableContext
              items={items.map((item) => item.key)}
              strategy={
                placement === 'top' || placement === 'bottom'
                  ? horizontalListSortingStrategy
                  : verticalListSortingStrategy
              }
            >
              {items.map((item, index) => (
                <TabEntry
                  item={item}
                  sortable={sorting}
                  className="leaf-tabs__entry"
                  key={item.key}
                  data-active={item.key === selected || undefined}
                >
                  <button
                    id={`${id}-tab-${index}`}
                    type="button"
                    role="tab"
                    aria-selected={item.key === selected}
                    aria-controls={`${id}-panel-${index}`}
                    disabled={item.disabled}
                    tabIndex={item.key === focusKey ? 0 : -1}
                    className="leaf-tabs__tab"
                    onFocus={() => setFocused(item.key)}
                    onClick={() => choose(item.key)}
                    onKeyDown={(event) => {
                      let next: string | undefined;
                      const position = enabled.findIndex((entry) => entry.key === item.key);
                      const forward =
                        placement === 'left' || placement === 'right'
                          ? 'ArrowDown'
                          : direction === 'rtl'
                            ? 'ArrowLeft'
                            : 'ArrowRight';
                      const backward =
                        placement === 'left' || placement === 'right'
                          ? 'ArrowUp'
                          : direction === 'rtl'
                            ? 'ArrowRight'
                            : 'ArrowLeft';
                      if (event.key === forward)
                        next = enabled[(position + 1) % enabled.length]?.key;
                      else if (event.key === backward)
                        next = enabled[(position - 1 + enabled.length) % enabled.length]?.key;
                      else if (event.key === 'Home') next = enabled[0]?.key;
                      else if (event.key === 'End') next = enabled.at(-1)?.key;
                      if (next !== undefined) {
                        event.preventDefault();
                        setFocused(next);
                        const nextIndex = items.findIndex((entry) => entry.key === next);
                        list.current
                          ?.querySelector<HTMLButtonElement>(`[id='${id}-tab-${nextIndex}']`)
                          ?.focus();
                        if (activationMode === 'automatic') choose(next);
                      }
                    }}
                  >
                    {item.icon && <span aria-hidden="true">{item.icon}</span>}
                    {item.label}
                  </button>
                  {item.closable && (
                    <button
                      type="button"
                      className="leaf-tabs__close"
                      disabled={item.disabled || !onClose}
                      aria-label={`${messages.closeTab} ${typeof item.label === 'string' ? item.label : item.key}`}
                      onClick={(event) => {
                        onClose?.(item.key, event);
                        if (event.defaultPrevented) return;
                        const position = enabled.findIndex((entry) => entry.key === item.key);
                        const next =
                          item.key === selected
                            ? (enabled[position + 1] ?? enabled[position - 1])
                            : enabled.find((entry) => entry.key === selected);
                        if (next) {
                          if (item.key === selected) choose(next.key);
                          const nextIndex = items.findIndex((entry) => entry.key === next.key);
                          list.current
                            ?.querySelector<HTMLButtonElement>(`[id='${id}-tab-${nextIndex}']`)
                            ?.focus();
                        }
                      }}
                    >
                      <X size={13} aria-hidden="true" />
                    </button>
                  )}
                </TabEntry>
              ))}
            </SortableContext>
          </div>
          {overflowKeys.length > 0 && (
            <Dropdown
              items={items
                .filter((item) => overflowKeys.includes(item.key))
                .map((item) => ({
                  key: item.key,
                  label: item.label,
                  disabled: item.disabled,
                  onClick: () => {
                    choose(item.key);
                    requestAnimationFrame(() => {
                      const target = document.getElementById(`${id}-tab-${items.indexOf(item)}`);
                      target?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
                      target?.focus();
                    });
                  },
                }))}
            >
              <Button
                data-tabs-more=""
                variant="ghost"
                size={size}
                startIcon={<Ellipsis size={16} />}
                aria-label={t('更多标签页', 'More tabs')}
              />
            </Dropdown>
          )}
          {onAdd && (
            <Button
              variant="ghost"
              size={size}
              startIcon={<Plus size={16} />}
              aria-label={addLabel ?? t('添加标签页', 'Add tab')}
              onClick={onAdd}
            />
          )}
          {extra && <div className="leaf-tabs__extra">{extra}</div>}
        </div>
      </TabDragScope>
      <div className="leaf-tabs__panels">
        {items.map((item, index) => (
          <div
            key={item.key}
            id={`${id}-panel-${index}`}
            role="tabpanel"
            aria-labelledby={`${id}-tab-${index}`}
            hidden={item.key !== selected}
            // biome-ignore lint/a11y/noNoninteractiveTabindex: Tabpanels are keyboard focus destinations in the ARIA tabs pattern.
            tabIndex={0}
            className="leaf-tabs__panel"
          >
            {(item.key === selected || (!destroyInactive && visited.includes(item.key))) &&
              item.children}
          </div>
        ))}
      </div>
    </div>
  );
}

function TabEntry({
  item,
  sortable,
  ...props
}: HTMLAttributes<HTMLDivElement> & { item: TabItem; sortable: boolean }) {
  return sortable ? (
    <SortableTab item={item} {...props} />
  ) : (
    <div {...props} data-tab-key={item.key} />
  );
}
function SortableTab({
  item,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { item: TabItem }) {
  const { locale } = useLeafConfig();
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.key, disabled: item.disabled });
  return (
    <div
      {...props}
      ref={setNodeRef}
      data-tab-key={item.key}
      data-dragging={isDragging || undefined}
      style={{ ...props.style, transform: CSS.Transform.toString(transform), transition }}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        ref={setActivatorNodeRef}
        disabled={item.disabled}
        className="leaf-tabs__drag"
        aria-label={`${locale === 'en-US' ? 'Reorder tab' : '移动标签页'} ${typeof item.label === 'string' ? item.label : item.key}`}
      >
        <GripVertical size={13} aria-hidden="true" />
      </button>
      {children}
    </div>
  );
}

function TabDragScope({
  enabled,
  items,
  onReorder,
  children,
}: {
  enabled: boolean;
  items: readonly TabItem[];
  onReorder?: (items: TabItem[]) => void;
  children: ReactNode;
}) {
  return enabled ? (
    <TabSortScope items={items} onReorder={onReorder}>
      {children}
    </TabSortScope>
  ) : (
    children
  );
}
function TabSortScope({
  items,
  onReorder,
  children,
}: {
  items: readonly TabItem[];
  onReorder?: (items: TabItem[]) => void;
  children: ReactNode;
}) {
  const id = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  return (
    <DndContext
      id={id}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={({ active, over }) => {
        if (!over || active.id === over.id) return;
        const from = items.findIndex((item) => item.key === active.id);
        const to = items.findIndex((item) => item.key === over.id);
        if (from >= 0 && to >= 0 && !items[to]?.disabled)
          onReorder?.(arrayMove([...items], from, to));
      }}
    >
      {children}
    </DndContext>
  );
}
