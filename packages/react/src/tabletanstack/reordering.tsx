import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  type KeyboardCoordinateGetter,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { GripVertical } from 'lucide-react';
import { createContext, forwardRef, type ReactNode, useContext, useRef } from 'react';
import { assignRef } from '../shared/field';
import { useMotionEnabled } from '../shared/motion';
import { useFormattedText } from '../shared/use-formatted-text';
import { useText } from '../shared/use-text';
import type { TableColumnHeaderProps, TableRowProps } from '../table/table';
import { TableControl as Table } from '../table/table';

type ReorderKind = 'row' | 'column';
const key = (kind: ReorderKind, id: string) => `${kind}:${id}`;
const HandleContext = createContext<ReturnType<typeof useSortable> | null>(null);

const keyboardCoordinates: KeyboardCoordinateGetter = (event, { context }) => {
  const { active, over, collisionRect, droppableContainers, droppableRects } = context;
  if (!active || !collisionRect) return undefined;
  const kind = active.data.current?.kind;
  const step =
    kind === 'row'
      ? event.code === 'ArrowDown'
        ? 1
        : event.code === 'ArrowUp'
          ? -1
          : 0
      : event.code === 'ArrowRight'
        ? 1
        : event.code === 'ArrowLeft'
          ? -1
          : 0;
  if (!step) return undefined;
  event.preventDefault();
  const candidates = droppableContainers
    .getEnabled()
    .filter(
      (item) =>
        item.data.current?.kind === kind &&
        item.data.current?.group === active.data.current?.group &&
        droppableRects.has(item.id),
    )
    .sort((first, second) => {
      const firstRect = droppableRects.get(first.id);
      const secondRect = droppableRects.get(second.id);
      return kind === 'row'
        ? (firstRect?.top ?? 0) - (secondRect?.top ?? 0)
        : (firstRect?.left ?? 0) - (secondRect?.left ?? 0);
    });
  const index = candidates.findIndex((item) => item.id === (over?.id ?? active.id));
  const next = candidates[index + step];
  const rect = next && droppableRects.get(next.id);
  return rect
    ? {
        x: rect.left + (rect.width - collisionRect.width) / 2,
        y: rect.top + (rect.height - collisionRect.height) / 2,
      }
    : undefined;
};

interface ReorderScopeProps {
  id: string;
  disabled: boolean;
  onReorder: (kind: ReorderKind, activeId: string, overId: string) => void;
  children: ReactNode;
}

export function ReorderScope({ enabled, ...props }: ReorderScopeProps & { enabled: boolean }) {
  return enabled ? <ActiveReorderScope {...props} /> : props.children;
}

function ActiveReorderScope({ id, disabled, onReorder, children }: ReorderScopeProps) {
  const t = useText();
  const format = useFormattedText();
  const scrollable = useRef<Element | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: keyboardCoordinates, scrollBehavior: 'auto' }),
  );
  const finish = ({ active, over }: DragEndEvent) => {
    if (!disabled && over && active.id !== over.id) {
      const source = active.data.current;
      const target = over.data.current;
      if (source && target && source.kind === target.kind && source.group === target.group)
        onReorder(source.kind, source.itemId, target.itemId);
    }
    scrollable.current = null;
  };
  return (
    <DndContext
      id={id}
      sensors={sensors}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      collisionDetection={(args) => {
        const scoped = {
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (item) =>
              item.data.current?.kind === args.active.data.current?.kind &&
              item.data.current?.group === args.active.data.current?.group,
          ),
        };
        return args.pointerCoordinates ? pointerWithin(scoped) : closestCenter(scoped);
      }}
      onDragEnd={finish}
      onDragStart={({ active, activatorEvent }) => {
        const target = activatorEvent.target;
        const viewport = target instanceof Element ? target.closest('.leaf-table__viewport') : null;
        const overflows =
          viewport &&
          (active.data.current?.kind === 'row'
            ? viewport.scrollHeight > viewport.clientHeight + 1
            : viewport.scrollWidth > viewport.clientWidth + 1);
        scrollable.current = overflows ? viewport : null;
      }}
      onDragCancel={() => {
        scrollable.current = null;
      }}
      autoScroll={{
        canScroll: (element) => element === scrollable.current,
        layoutShiftCompensation: false,
      }}
      accessibility={{
        screenReaderInstructions: {
          draggable: t('drag.instructions'),
        },
        announcements: {
          onDragStart: ({ active }) =>
            format('drag.pickedUp', { label: String(active.data.current?.label ?? active.id) }),
          onDragOver: ({ over }) =>
            over
              ? format('drag.moved', { label: String(over.data.current?.label ?? over.id) })
              : t('drag.outside'),
          onDragEnd: ({ active }) =>
            format('drag.dropped', { label: String(active.data.current?.label ?? active.id) }),
          onDragCancel: () => t('drag.cancelled'),
        },
      }}
    >
      {children}
    </DndContext>
  );
}

export function ReorderItems({
  enabled,
  kind,
  ids,
  children,
}: {
  enabled: boolean;
  kind: ReorderKind;
  ids: string[];
  children: ReactNode;
}) {
  return enabled ? (
    <SortableContext
      items={ids.map((id) => key(kind, id))}
      strategy={kind === 'row' ? verticalListSortingStrategy : horizontalListSortingStrategy}
    >
      {children}
    </SortableContext>
  ) : (
    children
  );
}

function useItem(
  kind: ReorderKind,
  itemId: string,
  label: string,
  group: string,
  disabled: boolean,
) {
  const motion = useMotionEnabled();
  const sortable = useSortable({
    id: key(kind, itemId),
    data: { kind, itemId, label, group },
    disabled,
  });
  const transform = sortable.transform;
  return {
    sortable,
    style: {
      transform: transform
        ? `translate3d(${kind === 'column' ? transform.x : 0}px, ${kind === 'row' ? transform.y : 0}px, 0)`
        : undefined,
      transition: sortable.transition
        ? motion
          ? 'transform var(--leaf-motion-duration) var(--leaf-motion-easing)'
          : 'none'
        : undefined,
    },
  };
}

export const ReorderableRow = forwardRef<
  HTMLTableRowElement,
  TableRowProps & { itemId: string; itemLabel: string; disabled: boolean }
>(function ReorderableRow({ itemId, itemLabel, disabled, style, children, ...props }, ref) {
  const item = useItem('row', itemId, itemLabel, 'rows', disabled);
  return (
    <HandleContext.Provider value={item.sortable}>
      <Table.Row
        {...props}
        ref={(node) => {
          item.sortable.setNodeRef(node);
          assignRef(ref, node);
        }}
        data-dragging={item.sortable.isDragging || undefined}
        style={{ ...style, ...item.style }}
      >
        {children}
      </Table.Row>
    </HandleContext.Provider>
  );
});

export const ReorderRow = forwardRef<
  HTMLTableRowElement,
  TableRowProps & { enabled: boolean; itemId: string; itemLabel: string; disabled: boolean }
>(function ReorderRow({ enabled, itemId, itemLabel, disabled, ...props }, ref) {
  return enabled ? (
    <ReorderableRow
      {...props}
      ref={ref}
      itemId={itemId}
      itemLabel={itemLabel}
      disabled={disabled}
    />
  ) : (
    <Table.Row {...props} ref={ref} />
  );
});

export const ReorderableColumnHeader = forwardRef<
  HTMLTableCellElement,
  TableColumnHeaderProps & { itemId: string; itemLabel: string; group: string; disabled: boolean }
>(function ReorderableColumnHeader(
  { itemId, itemLabel, group, disabled, style, children, ...props },
  ref,
) {
  const item = useItem('column', itemId, itemLabel, group, disabled);
  return (
    <HandleContext.Provider value={item.sortable}>
      <Table.ColumnHeader
        {...props}
        ref={(node) => {
          item.sortable.setNodeRef(node);
          assignRef(ref, node);
        }}
        data-dragging={item.sortable.isDragging || undefined}
        style={{ ...style, ...item.style }}
      >
        {children}
      </Table.ColumnHeader>
    </HandleContext.Provider>
  );
});

export const ReorderColumnHeader = forwardRef<
  HTMLTableCellElement,
  TableColumnHeaderProps & {
    enabled: boolean;
    itemId: string;
    itemLabel: string;
    group: string;
    disabled: boolean;
  }
>(function ReorderColumnHeader({ enabled, itemId, itemLabel, group, disabled, ...props }, ref) {
  return enabled ? (
    <ReorderableColumnHeader
      {...props}
      ref={ref}
      itemId={itemId}
      itemLabel={itemLabel}
      group={group}
      disabled={disabled}
    />
  ) : (
    <Table.ColumnHeader {...props} ref={ref} />
  );
});

export function ReorderHandle({ label }: { label: string }) {
  const sortable = useContext(HandleContext);
  if (!sortable) return null;
  return (
    <button
      type="button"
      {...sortable.attributes}
      {...sortable.listeners}
      ref={sortable.setActivatorNodeRef}
      className="leaf-data-table__drag-handle"
      aria-label={label}
    >
      <GripVertical size={14} aria-hidden="true" />
    </button>
  );
}
