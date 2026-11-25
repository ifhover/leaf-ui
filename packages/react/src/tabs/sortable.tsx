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
import { GripVertical } from 'lucide-react';
import { type HTMLAttributes, type ReactNode, useId } from 'react';
import { useMotionEnabled } from '../shared/motion';
import { useDragAnnouncements } from '../shared/use-drag-announcements';
import { useFormattedText } from '../shared/use-formatted-text';
import type { TabItem } from './tabs';

export function TabSortableList({
  items,
  children,
}: {
  items: readonly TabItem[];
  children: ReactNode;
}) {
  return (
    <SortableContext items={items.map((item) => item.key)} strategy={horizontalListSortingStrategy}>
      {children}
    </SortableContext>
  );
}

export function SortableTab({
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

export function TabSortScope({
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
