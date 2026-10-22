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
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronLeft, ChevronRight, GripVertical, Plus, X } from 'lucide-react';
import {
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { ButtonControl } from '../button/button';
import { useComponentProps } from '../config-provider/component-defaults';
import { useLeafConfig } from '../config-provider/context';
import { ScrollbarControl } from '../scrollbar/scrollbar';
import { classes } from '../shared/classes';
import { useMotionEnabled } from '../shared/motion';
import type { ControlSize } from '../shared/types';
import { useDragAnnouncements } from '../shared/use-drag-announcements';
import { useFormattedText } from '../shared/use-formatted-text';
import { useText } from '../shared/use-text';
import { useMovingIndicator } from './use-moving-indicator';

export interface TabItem {
  key: string;
  label: ReactNode;
  children?: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
  closable?: boolean;
}
export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items: readonly TabItem[];
  activeKey?: string;
  defaultActiveKey?: string;
  onChange?: (key: string) => void;
  type?: 'line' | 'card' | 'segmented';
  placement?: 'top' | 'bottom';
  size?: ControlSize;
  /** Fill the available width with equally sized tabs. */
  block?: boolean;
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
export function TabsControl({
  items,
  activeKey,
  defaultActiveKey,
  onChange,
  type = 'line',
  placement = 'top',
  size = 'md',
  block = false,
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
  const { direction } = useLeafConfig();
  const t = useText();
  const format = useFormattedText();
  const motion = useMotionEnabled();
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
  const track = useRef<HTMLDivElement>(null);
  const indicator = useRef<HTMLSpanElement>(null);
  useMovingIndicator(
    track,
    indicator,
    '[data-leaf-indicator-item][data-active="true"]',
    `${selected}-${placement}-${type}-${direction}`,
    items.length > 0,
  );
  const [scrollSides, setScrollSides] = useState({ start: false, end: false });
  const sorting = sortable && Boolean(onReorder);
  // biome-ignore lint/correctness/useExhaustiveDependencies: Observe the new tab elements after the item list changes.
  useEffect(() => {
    const node = list.current;
    if (!overflow || !node) {
      setScrollSides({ start: false, end: false });
      return;
    }
    const measure = () => {
      const entries = Array.from(node.querySelectorAll<HTMLElement>('[data-tab-key]'));
      const rect = node.getBoundingClientRect();
      const rtl = getComputedStyle(node).direction === 'rtl';
      let start = false;
      let end = false;
      for (const entry of entries) {
        const item = entry.getBoundingClientRect();
        if (rtl) {
          if (item.right > rect.right + 1) start = true;
          if (item.left < rect.left - 1) end = true;
        } else {
          if (item.left < rect.left - 1) start = true;
          if (item.right > rect.right + 1) end = true;
        }
      }
      setScrollSides((previous) =>
        previous.start === start && previous.end === end ? previous : { start, end },
      );
    };
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(node);
    for (const entry of node.querySelectorAll<HTMLElement>('[data-tab-key]'))
      observer?.observe(entry);
    node.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect();
      node.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [direction, overflow, items]);
  const choose = (key: string) => {
    if (!enabled.some((item) => item.key === key)) return;
    if (activeKey === undefined) setInternal(key);
    if (key !== selected) onChange?.(key);
  };
  const scrollTabs = (side: 'start' | 'end') => {
    const node = list.current;
    if (!node) return;
    const distance = Math.max(120, node.clientWidth * 0.8);
    const left = direction === 'rtl' ? side === 'end' : side === 'start';
    node.scrollBy?.({
      left: left ? -distance : distance,
      behavior: motion ? 'smooth' : 'auto',
    });
  };
  if (items.length === 0) return null;
  return (
    <div
      {...props}
      className={classes(
        'leaf-tabs',
        `leaf-tabs--${type}`,
        `leaf-tabs--${placement}`,
        `leaf-tabs--${size}`,
        block && 'leaf-tabs--block',
        className,
      )}
    >
      <TabDragScope enabled={sorting} items={items} onReorder={onReorder}>
        <div className="leaf-tabs__header">
          <div className="leaf-tabs__viewport">
            <ScrollbarControl
              ref={list}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setFocused(undefined);
              }}
              role="tablist"
              aria-label={label}
              scrollbar="hidden"
              viewportProps={{ 'aria-orientation': 'horizontal' }}
              className="leaf-tabs__scroll"
              viewportClassName="leaf-tabs__list"
              tabIndex={-1}
              scrollbarTabIndex={-1}
            >
              <div ref={track} className="leaf-tabs__track">
                <span ref={indicator} className="leaf-tabs__indicator" aria-hidden="true" />
                <SortableContext
                  items={items.map((item) => item.key)}
                  strategy={horizontalListSortingStrategy}
                >
                  {items.map((item, index) => (
                    <TabEntry
                      item={item}
                      sortable={sorting}
                      className="leaf-tabs__entry"
                      key={item.key}
                      data-active={item.key === selected || undefined}
                      data-leaf-indicator-item=""
                    >
                      <button
                        id={`${id}-tab-${index}`}
                        type="button"
                        role="tab"
                        aria-selected={item.key === selected}
                        aria-controls={item.children != null ? `${id}-panel-${index}` : undefined}
                        disabled={item.disabled}
                        tabIndex={item.key === focusKey ? 0 : -1}
                        className="leaf-tabs__tab"
                        onFocus={() => setFocused(item.key)}
                        onClick={() => choose(item.key)}
                        onKeyDown={(event) => {
                          let next: string | undefined;
                          const position = enabled.findIndex((entry) => entry.key === item.key);
                          const forward = direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
                          const backward = direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
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
                          aria-label={format('tabs.closeLabel', {
                            label: typeof item.label === 'string' ? item.label : item.key,
                          })}
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
            </ScrollbarControl>
            {scrollSides.start && (
              <ButtonControl
                className="leaf-tabs__scroll-action leaf-tabs__scroll-action--start"
                variant="outline"
                size={size}
                startIcon={
                  direction === 'rtl' ? (
                    <ChevronRight size={16} aria-hidden="true" />
                  ) : (
                    <ChevronLeft size={16} aria-hidden="true" />
                  )
                }
                aria-label={t(direction === 'rtl' ? 'tabs.scrollRight' : 'tabs.scrollLeft')}
                onClick={() => scrollTabs('start')}
              />
            )}
            {scrollSides.end && (
              <ButtonControl
                className="leaf-tabs__scroll-action leaf-tabs__scroll-action--end"
                variant="outline"
                size={size}
                startIcon={
                  direction === 'rtl' ? (
                    <ChevronLeft size={16} aria-hidden="true" />
                  ) : (
                    <ChevronRight size={16} aria-hidden="true" />
                  )
                }
                aria-label={t(direction === 'rtl' ? 'tabs.scrollLeft' : 'tabs.scrollRight')}
                onClick={() => scrollTabs('end')}
              />
            )}
          </div>
          {onAdd && (
            <ButtonControl
              className="leaf-tabs__action"
              variant="ghost"
              size={size}
              startIcon={<Plus size={16} />}
              aria-label={addLabel ?? t('tabs.addTab')}
              onClick={onAdd}
            />
          )}
          {extra && <div className="leaf-tabs__extra">{extra}</div>}
        </div>
      </TabDragScope>
      {items.some((item) => item.children != null) && (
        <div className="leaf-tabs__panels">
          {items.map(
            (item, index) =>
              item.children != null && (
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
              ),
          )}
        </div>
      )}
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
  const format = useFormattedText();
  const motion = useMotionEnabled();
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
      style={{
        ...props.style,
        transform: CSS.Transform.toString(transform),
        transition:
          motion && transition
            ? 'transform var(--leaf-motion-slow) var(--leaf-motion-easing)'
            : undefined,
      }}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        ref={setActivatorNodeRef}
        disabled={item.disabled}
        className="leaf-tabs__drag"
        aria-label={format('tabs.reorder', {
          label: typeof item.label === 'string' ? item.label : item.key,
        })}
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
  const accessibility = useDragAnnouncements((key) => {
    const item = items.find((entry) => entry.key === key);
    return typeof item?.label === 'string' ? item.label : String(key);
  });
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  return (
    <DndContext
      id={id}
      sensors={sensors}
      collisionDetection={closestCenter}
      accessibility={accessibility}
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

export function Tabs(rawProps: TabsProps) {
  const props = useComponentProps('Tabs', rawProps);
  return <TabsControl {...props} />;
}
