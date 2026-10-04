import { ArrowLeft, ArrowRight, Search } from 'lucide-react';
import { type HTMLAttributes, type ReactNode, useId, useRef, useState } from 'react';
import { Button } from '../button';
import { Checkbox } from '../checkbox';
import { Input } from '../input';
import { Result } from '../result';
import { classes } from '../shared/classes';
import { FormValue, useFieldValue } from '../shared/field';
import { useText } from '../shared/use-text';
import { VirtualList } from '../virtuallist/virtuallist';
export interface TransferItem {
  key: string;
  label: ReactNode;
  description?: string;
  disabled?: boolean;
  searchLabel?: string;
}
export interface TransferChangeInfo {
  direction: 'left' | 'right';
  movedKeys: string[];
}
export interface TransferProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items: readonly TransferItem[];
  value?: readonly string[];
  defaultValue?: readonly string[];
  onChange?: (keys: string[], info: TransferChangeInfo) => void;
  selectedKeys?: readonly string[];
  onSelectionChange?: (keys: string[]) => void;
  titles?: readonly [ReactNode, ReactNode];
  searchable?: boolean;
  filterOption?: (query: string, item: TransferItem) => boolean;
  renderItem?: (item: TransferItem) => ReactNode;
  disabled?: boolean;
  height?: number;
  virtual?: boolean;
  name?: string;
  form?: string;
  required?: boolean;
  oneWay?: boolean;
}
export function Transfer({
  items,
  value,
  defaultValue = [],
  onChange,
  selectedKeys,
  onSelectionChange,
  titles,
  searchable = true,
  filterOption,
  renderItem,
  disabled,
  height = 260,
  virtual = false,
  name,
  form,
  required,
  oneWay = false,
  className,
  ...props
}: TransferProps) {
  const t = useText();
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const [current, setCurrent] = useFieldValue(value, defaultValue, trigger, form);
  const [internal, setInternal] = useState<readonly string[]>([]);
  const selected = selectedKeys ?? internal;
  const [queries, setQueries] = useState(['', '']);
  const select = (keys: string[]) => {
    if (selectedKeys === undefined) setInternal(keys);
    onSelectionChange?.(keys);
  };
  const move = (direction: 'left' | 'right') => {
    const moved = items
      .filter(
        (item) =>
          !item.disabled &&
          selected.includes(item.key) &&
          current.includes(item.key) === (direction === 'left'),
      )
      .map((item) => item.key);
    if (!moved.length || disabled) return;
    const next =
      direction === 'right'
        ? [...current, ...moved]
        : current.filter((key) => !moved.includes(key));
    setCurrent(next);
    select(selected.filter((key) => !moved.includes(key)));
    onChange?.([...next], { direction, movedKeys: moved });
  };
  const panel = (side: 0 | 1) => {
    const query = queries[side] ?? '';
    const list = items.filter(
      (item) =>
        current.includes(item.key) === (side === 1) &&
        (filterOption
          ? filterOption(query, item)
          : `${item.searchLabel ?? (typeof item.label === 'string' ? item.label : item.key)} ${item.description ?? ''}`
              .toLocaleLowerCase()
              .includes(query.toLocaleLowerCase())),
    );
    const enabled = list.filter((item) => !item.disabled);
    const checked = enabled.filter((item) => selected.includes(item.key));
    const row = (item: TransferItem) => (
      <div className="leaf-transfer__item">
        <Checkbox
          disabled={disabled || item.disabled}
          checked={selected.includes(item.key)}
          onChange={(event) =>
            select(
              event.target.checked
                ? [...new Set([...selected, item.key])]
                : selected.filter((key) => key !== item.key),
            )
          }
        >
          <span>
            {renderItem?.(item) ?? item.label}
            {item.description && <small>{item.description}</small>}
          </span>
        </Checkbox>
      </div>
    );
    return (
      <section className="leaf-transfer__panel" aria-labelledby={`${id}-${side}`}>
        <header className="leaf-transfer__header">
          <Checkbox
            aria-label={t('选择本页全部', 'Select all visible items')}
            disabled={disabled || !enabled.length}
            checked={enabled.length > 0 && checked.length === enabled.length}
            indeterminate={checked.length > 0 && checked.length < enabled.length}
            onChange={(event) =>
              select(
                event.target.checked
                  ? [...new Set([...selected, ...enabled.map((item) => item.key)])]
                  : selected.filter((key) => !enabled.some((item) => item.key === key)),
              )
            }
          />
          <span id={`${id}-${side}`}>
            {titles?.[side] ??
              (side === 0 ? t('可选项目', 'Available') : t('已选项目', 'Selected'))}
          </span>
          <small>
            {checked.length ? `${checked.length} / ` : ''}
            {list.length}
          </small>
        </header>
        {searchable && (
          <div className="leaf-transfer__search">
            <Input
              size="sm"
              allowClear
              prefix={<Search size={14} />}
              aria-label={
                side === 0
                  ? t('搜索可选项目', 'Search available items')
                  : t('搜索已选项目', 'Search selected items')
              }
              value={query}
              onChange={(event) =>
                setQueries((previous) =>
                  previous.map((text, index) => (index === side ? event.target.value : text)),
                )
              }
            />
          </div>
        )}
        {virtual ? (
          <VirtualList
            items={list}
            itemKey={(item) => item.key}
            renderItem={row}
            height={height}
            estimateSize={42}
            emptyContent={<Result status="empty" />}
          />
        ) : (
          <div className="leaf-transfer__list" style={{ height }}>
            {list.length ? (
              list.map((item) => <div key={item.key}>{row(item)}</div>)
            ) : (
              <Result status="empty" />
            )}
          </div>
        )}
      </section>
    );
  };
  return (
    <div
      {...props}
      className={classes('leaf-transfer', className)}
      data-disabled={disabled ? '' : undefined}
    >
      {panel(0)}
      <div className="leaf-transfer__actions">
        <Button
          ref={trigger}
          size="sm"
          startIcon={<ArrowRight size={16} />}
          aria-label={t('移至已选', 'Move to selected')}
          disabled={
            disabled ||
            !items.some(
              (item) =>
                !item.disabled && selected.includes(item.key) && !current.includes(item.key),
            )
          }
          onClick={() => move('right')}
        />
        {!oneWay && (
          <Button
            size="sm"
            variant="outline"
            startIcon={<ArrowLeft size={16} />}
            aria-label={t('移回可选', 'Move to available')}
            disabled={
              disabled ||
              !items.some(
                (item) =>
                  !item.disabled && selected.includes(item.key) && current.includes(item.key),
              )
            }
            onClick={() => move('left')}
          />
        )}
      </div>
      {panel(1)}
      <FormValue
        name={name}
        form={form}
        value={current.length ? JSON.stringify(current) : ''}
        required={required}
        disabled={disabled}
        triggerRef={trigger}
      />
    </div>
  );
}
