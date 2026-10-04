import {
  type CollisionDetection,
  closestCenter,
  DndContext,
  type DragMoveEvent,
  type DragOverEvent,
  DragOverlay,
  type KeyboardCoordinateGetter,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { GripVertical } from 'lucide-react';
import { createContext, type ReactNode, useContext, useId, useRef, useState } from 'react';
import { Button } from '../button';
import { useText } from '../shared/use-text';
import { moveTreeNode } from './move';
import type { TreeDropInfo, TreeNode } from './tree';

interface DragState {
  active?: string;
  over?: string;
  position?: TreeDropInfo['position'];
}
const Context = createContext<DragState>({});
export function TreeDragScope({
  data,
  nodes,
  allowDrop,
  onDrop,
  children,
}: {
  data: readonly TreeNode[];
  nodes: Map<string, { node: TreeNode }>;
  allowDrop?: (info: Omit<TreeDropInfo, 'data'>) => boolean;
  onDrop?: (info: TreeDropInfo) => void;
  children: ReactNode;
}) {
  const id = useId();
  const t = useText();
  const [state, setState] = useState<DragState>({});
  const blocked = useRef(new Set<string>());
  const keyboardTarget = useRef<{ key: string; position: TreeDropInfo['position'] } | undefined>(
    undefined,
  );
  const pointerY = useRef<number | undefined>(undefined);
  const collisionDetection: CollisionDetection = (args) => {
    if (args.pointerCoordinates) {
      pointerY.current = args.pointerCoordinates.y;
      const hits = pointerWithin(args);
      return hits.length ? hits : closestCenter(args);
    }
    if (keyboardTarget.current) return [{ id: keyboardTarget.current.key }];
    return closestCenter(args);
  };
  const keyboardCoordinates: KeyboardCoordinateGetter = (
    event,
    { active, currentCoordinates, context },
  ) => {
    const rect = context.collisionRect;
    if (!rect || !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) return;
    const candidates = context.droppableContainers
      .getEnabled()
      .filter((container) => !blocked.current.has(String(container.id)))
      .flatMap((container) => {
        const target = context.droppableRects.get(container.id);
        return target ? [{ id: container.id, rect: target }] : [];
      })
      .sort((a, b) => a.rect.top - b.rect.top);
    const current = context.droppableRects.get(keyboardTarget.current?.key ?? active) ?? rect;
    const centerY = current.top + current.height / 2;
    const target =
      event.code === 'ArrowDown'
        ? candidates.find(
            (candidate) => candidate.rect.top + candidate.rect.height / 2 > centerY + 1,
          )
        : event.code === 'ArrowUp'
          ? candidates
              .reverse()
              .find((candidate) => candidate.rect.top + candidate.rect.height / 2 < centerY - 1)
          : candidates.find((candidate) => candidate.id === keyboardTarget.current?.key);
    if (!target) return;
    const fraction = event.code === 'ArrowLeft' ? 0.15 : event.code === 'ArrowRight' ? 0.85 : 0.5;
    keyboardTarget.current = {
      key: String(target.id),
      position:
        event.code === 'ArrowLeft' ? 'before' : event.code === 'ArrowRight' ? 'after' : 'inside',
    };
    return {
      x:
        currentCoordinates.x +
        target.rect.left +
        target.rect.width / 2 -
        (rect.left + rect.width / 2),
      y:
        currentCoordinates.y +
        target.rect.top +
        target.rect.height * fraction -
        (rect.top + rect.height / 2),
    };
  };
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: keyboardCoordinates }),
  );
  const updateTarget = ({ active, over }: DragMoveEvent | DragOverEvent) => {
    const activeRect = active.rect.current.translated;
    const targetRect = over?.rect;
    const y = pointerY.current ?? (activeRect ? activeRect.top + activeRect.height / 2 : 0);
    const position =
      keyboardTarget.current?.position ??
      (!targetRect ||
      (y >= targetRect.top + targetRect.height * 0.3 &&
        y <= targetRect.top + targetRect.height * 0.7)
        ? 'inside'
        : y < targetRect.top + targetRect.height / 2
          ? 'before'
          : 'after');
    const node = nodes.get(String(active.id))?.node;
    const target = over ? nodes.get(String(over.id))?.node : undefined;
    const permitted =
      node &&
      target &&
      !target.disabled &&
      !blocked.current.has(target.key) &&
      (!allowDrop || allowDrop({ node, target, position }));
    const next = {
      active: String(active.id),
      over: permitted && over ? String(over.id) : undefined,
      position,
    };
    setState((previous) =>
      previous.active === next.active &&
      previous.over === next.over &&
      previous.position === next.position
        ? previous
        : next,
    );
  };
  return (
    <DndContext
      id={id}
      sensors={sensors}
      collisionDetection={collisionDetection}
      accessibility={{
        screenReaderInstructions: {
          draggable: t(
            '按空格开始拖动，上下选择目标，左放在目标前方，右放在目标后方，空格放置，Escape 取消。',
            'Press Space to pick up, Up/Down to choose a target, Left/Right to place before/after it, Space to drop, and Escape to cancel.',
          ),
        },
      }}
      onDragStart={({ active }) => {
        const key = String(active.id);
        keyboardTarget.current = undefined;
        pointerY.current = undefined;
        blocked.current = new Set([key]);
        const collect = (node?: TreeNode) => {
          for (const child of node?.children ?? []) {
            blocked.current.add(child.key);
            collect(child);
          }
        };
        collect(nodes.get(key)?.node);
        setState({ active: key });
      }}
      onDragMove={updateTarget}
      onDragOver={updateTarget}
      onDragCancel={() => setState({})}
      onDragEnd={({ active, over }) => {
        const node = nodes.get(String(active.id))?.node;
        const target = over ? nodes.get(String(over.id))?.node : undefined;
        const position = state.position ?? 'inside';
        setState({});
        if (!node || !target || target.disabled || target.key === node.key) return;
        const info = { node, target, position };
        if (allowDrop && !allowDrop(info)) return;
        const next = moveTreeNode(data, node.key, target.key, position);
        if (next) onDrop?.({ ...info, data: next });
      }}
    >
      <Context.Provider value={state}>{children}</Context.Provider>
      <DragOverlay>
        {state.active && (
          <div className="leaf-tree__drag-preview">{nodes.get(state.active)?.node.title}</div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
export function TreeDragRow({
  node,
  draggable,
  children,
}: {
  node: TreeNode;
  draggable: boolean;
  children: ReactNode;
}) {
  const t = useText();
  const state = useContext(Context);
  const {
    attributes,
    listeners,
    setNodeRef: setDrag,
    setActivatorNodeRef,
    isDragging,
  } = useDraggable({ id: node.key, disabled: !draggable || node.disabled });
  const { setNodeRef: setDrop } = useDroppable({ id: node.key, disabled: node.disabled });
  return (
    <div
      ref={(element) => {
        setDrag(element);
        setDrop(element);
      }}
      className="leaf-tree__drag-row"
      data-dragging={isDragging || undefined}
      data-drop={state.over === node.key && state.active !== node.key ? state.position : undefined}
    >
      {draggable && (
        <Button
          {...attributes}
          {...listeners}
          ref={setActivatorNodeRef}
          variant="ghost"
          size="sm"
          disabled={node.disabled}
          className="leaf-tree__drag-handle"
          startIcon={<GripVertical size={14} />}
          aria-label={`${t('移动节点', 'Move node')} ${node.searchLabel ?? (typeof node.title === 'string' ? node.title : node.key)}`}
        />
      )}
      {children}
    </div>
  );
}
