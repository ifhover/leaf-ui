import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { type HTMLAttributes, type ReactNode, useId } from 'react';
import { Button } from '../button';
import { classes } from '../shared/classes';
import { useText } from '../shared/use-text';
export interface SortableRenderInfo {
  handle: ReactNode;
  dragging: boolean;
}
export interface SortableChangeInfo {
  fromIndex: number;
  toIndex: number;
  activeKey: string;
  overKey: string;
}
export interface SortableProps<T>
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'> {
  items: readonly T[];
  itemKey: (item: T) => string;
  renderItem: (item: T, info: SortableRenderInfo) => ReactNode;
  onChange: (items: T[], info: SortableChangeInfo) => void;
  disabled?: boolean;
  itemDisabled?: (item: T) => boolean;
  activationDistance?: number;
}
function SortableItem<T>({
  item,
  id,
  disabled,
  renderItem,
}: {
  item: T;
  id: string;
  disabled: boolean;
  renderItem: SortableProps<T>['renderItem'];
}) {
  const t = useText();
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });
  const handle = (
    <Button
      {...attributes}
      {...listeners}
      ref={setActivatorNodeRef}
      variant="ghost"
      size="sm"
      className="leaf-sortable__handle"
      disabled={disabled}
      startIcon={<GripVertical />}
      aria-label={t('拖动排序', 'Drag to reorder')}
    />
  );
  return (
    <div
      ref={setNodeRef}
      className="leaf-sortable__item"
      data-dragging={isDragging || undefined}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      {renderItem(item, { handle, dragging: isDragging })}
    </div>
  );
}
export function Sortable<T>({
  items,
  itemKey,
  renderItem,
  onChange,
  disabled = false,
  itemDisabled,
  activationDistance = 6,
  className,
  ...props
}: SortableProps<T>) {
  const t = useText();
  const id = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: Math.max(0, activationDistance) },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const keys = items.map(itemKey);
  const finish = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id || disabled) return;
    const fromIndex = keys.indexOf(String(active.id));
    const toIndex = keys.indexOf(String(over.id));
    if (fromIndex < 0 || toIndex < 0 || itemDisabled?.(items[toIndex] as T)) return;
    onChange(arrayMove([...items], fromIndex, toIndex), {
      fromIndex,
      toIndex,
      activeKey: String(active.id),
      overKey: String(over.id),
    });
  };
  return (
    <DndContext
      id={id}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={finish}
      accessibility={{
        screenReaderInstructions: {
          draggable: t(
            '按空格开始排序，方向键移动，再按空格确认，Escape 取消。',
            'Press Space to start, arrow keys to move, Space to drop, and Escape to cancel.',
          ),
        },
        announcements: {
          onDragStart: ({ active }) => t(`开始移动 ${active.id}`, `Picked up ${active.id}`),
          onDragOver: ({ over }) =>
            over
              ? t(
                  `移至第 ${keys.indexOf(String(over.id)) + 1} 项`,
                  `Position ${keys.indexOf(String(over.id)) + 1}`,
                )
              : undefined,
          onDragEnd: ({ active }) => t(`已放置 ${active.id}`, `Dropped ${active.id}`),
          onDragCancel: () => t('已取消排序', 'Reordering cancelled'),
        },
      }}
    >
      <SortableContext items={keys} strategy={rectSortingStrategy}>
        <div {...props} className={classes('leaf-sortable', className)}>
          {items.map((item) => (
            <SortableItem
              key={itemKey(item)}
              id={itemKey(item)}
              item={item}
              disabled={disabled || Boolean(itemDisabled?.(item))}
              renderItem={renderItem}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
