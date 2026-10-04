import { type HTMLAttributes, type ReactNode, useEffect, useId, useRef, useState } from 'react';
import { classes } from '../shared/classes';
export interface FormListField<T> {
  key: string;
  index: number;
  name: string;
  value: T;
}
export interface FormListOperations<T> {
  add: (value: T, index?: number) => void;
  remove: (index: number | readonly number[]) => void;
  move: (from: number, to: number) => void;
  update: (index: number, value: T) => void;
}
export interface FormListProps<T>
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange' | 'defaultValue'> {
  name: string;
  value?: readonly T[];
  defaultValue?: readonly T[];
  onChange?: (values: T[]) => void;
  itemKey?: (value: T) => string;
  children: (fields: readonly FormListField<T>[], operations: FormListOperations<T>) => ReactNode;
}
export function FormList<T>({
  name,
  value,
  defaultValue = [],
  onChange,
  itemKey,
  children,
  className,
  ...props
}: FormListProps<T>) {
  const id = useId();
  const sequence = useRef(0);
  const [internal, setInternal] = useState<readonly T[]>(defaultValue);
  const current = value ?? internal;
  const root = useRef<HTMLDivElement>(null);
  const records = useRef<{ key: string; value: T }[]>([]);
  if (
    records.current.length !== current.length ||
    records.current.some((record, index) => !Object.is(record.value, current[index]))
  ) {
    const used = new Set<string>();
    records.current = current.map((item) => {
      const match = records.current.find(
        (record) => !used.has(record.key) && Object.is(record.value, item),
      );
      const key = itemKey?.(item) ?? match?.key ?? `${id}-${++sequence.current}`;
      used.add(key);
      return { value: item, key };
    });
  }
  const update = (next: { key: string; value: T }[]) => {
    records.current = next;
    const values = next.map((row) => row.value);
    if (value === undefined) setInternal(values);
    onChange?.(values);
  };
  const operations: FormListOperations<T> = {
    add: (item, position = current.length) => {
      const next = [...records.current];
      next.splice(Math.max(0, Math.min(next.length, position)), 0, {
        key: itemKey?.(item) ?? `${id}-${++sequence.current}`,
        value: item,
      });
      update(next);
    },
    remove: (index) => {
      const positions = typeof index === 'number' ? [index] : index;
      update(records.current.filter((_, position) => !positions.includes(position)));
    },
    move: (from, to) => {
      if (from < 0 || from >= current.length || to < 0 || to >= current.length || from === to)
        return;
      const next = [...records.current];
      const [row] = next.splice(from, 1);
      if (row) next.splice(to, 0, row);
      update(next);
    },
    update: (index, item) => {
      if (index < 0 || index >= current.length) return;
      update(
        records.current.map((row, position) =>
          position === index ? { ...row, value: item } : row,
        ),
      );
    },
  };
  useEffect(() => {
    const form = root.current?.closest('form');
    const reset = (event: Event) =>
      queueMicrotask(() => {
        if (!event.defaultPrevented && value === undefined) setInternal(defaultValue);
      });
    form?.addEventListener('reset', reset);
    return () => form?.removeEventListener('reset', reset);
  }, [value, defaultValue]);
  return (
    <div {...props} ref={root} className={classes('leaf-form-list', className)}>
      {children(
        records.current.map((row, index) => ({
          key: row.key,
          index,
          name: `${name}.${index}`,
          value: row.value,
        })),
        operations,
      )}
    </div>
  );
}
