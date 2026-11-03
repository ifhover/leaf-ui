import { ArrowLeft, ArrowRight, Search } from 'lucide-react';
import { type HTMLAttributes, type ReactNode, useId, useMemo, useRef, useState } from 'react';
import { ButtonControl } from '../button/button';
import { CheckboxControl as Checkbox } from '../checkbox/checkbox';
import { useComponentProps } from '../config-provider/component-defaults';
import { useLeafConfig } from '../config-provider/context';
import { estimateControlHeight } from '../density';
import { FieldScope, useFormField } from '../form/form';
import { InputControl } from '../input/input';
import { ResultControl as Result } from '../result/result';
import { ScrollbarControl } from '../scrollbar/scrollbar';
import { classes } from '../shared/classes';
import { FormValue, useFieldValue } from '../shared/field';
import { useListMotion } from '../shared/motion';
import { useText } from '../shared/use-text';
import { VirtualListControl as VirtualList } from '../virtuallist/virtuallist';
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
const empty: readonly string[] = [];
export function Transfer(rawProps: TransferProps) {
  const {
    items,
    value,
    defaultValue = empty,
    onChange,
    selectedKeys,
    onSelectionChange,
    titles,
    searchable = true,
    filterOption,
    renderItem,
    disabled: disabledProp,
    height = 180,
    virtual = false,
    name,
    form,
    required,
    oneWay = false,
    className,
    ...props
  } = useComponentProps('Transfer', rawProps);
  const { theme, density } = useLeafConfig();
  const field = useFormField();
  const disabled = disabledProp || field?.disabled;
  const t = useText();
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useFieldValue(value, defaultValue, trigger, form);
  const [internal, setInternal] = useState<readonly string[]>([]);
  const selected = selectedKeys ?? internal;
  const [queries, setQueries] = useState(['', '']);
  const currentKeys = useMemo(() => new Set(current), [current]);
  const checkedKeys = useMemo(() => new Set(selected), [selected]);
  const searchableItems = useMemo(
    () =>
      items.map((item) => ({
        item,
        text: `${item.searchLabel ?? (typeof item.label === 'string' ? item.label : item.key)} ${item.description ?? ''}`.toLocaleLowerCase(),
      })),
    [items],
  );
  const panels = useMemo(() => {
    const lists: [TransferItem[], TransferItem[]] = [[], []];
    const normalizedQueries = queries.map((query) => query.toLocaleLowerCase());
    for (const { item, text } of searchableItems) {
      const side = currentKeys.has(item.key) ? 1 : 0;
      if (
        filterOption
          ? filterOption(queries[side] ?? '', item)
          : text.includes(normalizedQueries[side] ?? '')
      )
        lists[side].push(item);
    }
    return [
      { list: lists[0], enabled: lists[0].filter((item) => !item.disabled) },
      { list: lists[1], enabled: lists[1].filter((item) => !item.disabled) },
    ] as const;
  }, [searchableItems, currentKeys, queries, filterOption]);
  const motionKey = useMemo(
    () => (virtual ? undefined : JSON.stringify([current, queries, items.map((item) => item.key)])),
    [virtual, current, queries, items],
  );
  useListMotion(root, motionKey, virtual ? '' : '.leaf-transfer__item[data-motion-key]');
  const select = (keys: string[]) => {
    if (selectedKeys === undefined) setInternal(keys);
    onSelectionChange?.(keys);
  };
  const move = (direction: 'left' | 'right') => {
    const moved = items
      .filter(
        (item) =>
          !item.disabled &&
          checkedKeys.has(item.key) &&
          currentKeys.has(item.key) === (direction === 'left'),
      )
      .map((item) => item.key);
    if (!moved.length || disabled) return;
    const movedKeys = new Set(moved);
    const next =
      direction === 'right' ? [...current, ...moved] : current.filter((key) => !movedKeys.has(key));
    setCurrent(next);
    select(selected.filter((key) => !movedKeys.has(key)));
    onChange?.([...next], { direction, movedKeys: moved });
  };
  const panel = (side: 0 | 1) => {
    const query = queries[side] ?? '';
    const { list, enabled } = panels[side];
    const checkedCount = enabled.reduce(
      (count, item) => count + Number(checkedKeys.has(item.key)),
      0,
    );
    const row = (item: TransferItem) => (
      <div
        className="leaf-transfer__item"
        data-motion-key={item.key}
        data-selected={checkedKeys.has(item.key) ? '' : undefined}
      >
        <Checkbox
          disabled={disabled || item.disabled}
          checked={checkedKeys.has(item.key)}
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
            aria-label={t('transfer.selectAllVisibleItems')}
            disabled={disabled || !enabled.length}
            checked={enabled.length > 0 && checkedCount === enabled.length}
            indeterminate={checkedCount > 0 && checkedCount < enabled.length}
            onChange={(event) => {
              const enabledKeys = new Set(enabled.map((item) => item.key));
              select(
                event.target.checked
                  ? [...new Set([...selected, ...enabledKeys])]
                  : selected.filter((key) => !enabledKeys.has(key)),
              );
            }}
          />
          <span id={`${id}-${side}`}>
            {titles?.[side] ?? (side === 0 ? t('transfer.available') : t('transfer.selected'))}
          </span>
          <small>
            {checkedCount ? `${checkedCount} / ` : ''}
            {list.length}
          </small>
        </header>
        <div className="leaf-transfer__body">
          {searchable && (
            <div className="leaf-transfer__search">
              <InputControl
                size="sm"
                allowClear
                prefix={<Search size={14} />}
                aria-label={
                  side === 0
                    ? t('transfer.searchAvailableItems')
                    : t('transfer.searchSelectedItems')
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
              estimateSize={(item) =>
                Math.max(estimateControlHeight(theme, density), item.description ? 42 : 0) + 6
              }
              emptyContent={<Result size="sm" icon={null} title={t('transfer.noItems')} />}
            />
          ) : (
            <ScrollbarControl
              viewportClassName="leaf-transfer__list"
              height={height}
              role="presentation"
            >
              {list.length ? (
                list.map((item) => <div key={item.key}>{row(item)}</div>)
              ) : (
                <Result size="sm" icon={null} title={t('transfer.noItems')} />
              )}
            </ScrollbarControl>
          )}
        </div>
      </section>
    );
  };
  return (
    <div
      {...props}
      ref={root}
      className={classes('leaf-transfer', className)}
      data-disabled={disabled ? '' : undefined}
    >
      <FieldScope>{panel(0)}</FieldScope>
      <div className="leaf-transfer__actions">
        <ButtonControl
          ref={trigger}
          id={props.id ?? field?.id}
          size="sm"
          variant="solid"
          startIcon={<ArrowRight size={16} />}
          aria-label={t('transfer.moveToSelected')}
          disabled={
            disabled ||
            !items.some(
              (item) => !item.disabled && checkedKeys.has(item.key) && !currentKeys.has(item.key),
            )
          }
          onClick={() => move('right')}
        />
        {!oneWay && (
          <ButtonControl
            size="sm"
            variant="outline"
            startIcon={<ArrowLeft size={16} />}
            aria-label={t('transfer.moveToAvailable')}
            disabled={
              disabled ||
              !items.some(
                (item) => !item.disabled && checkedKeys.has(item.key) && currentKeys.has(item.key),
              )
            }
            onClick={() => move('left')}
          />
        )}
      </div>
      <FieldScope>{panel(1)}</FieldScope>
      <FormValue
        name={name}
        form={form}
        value={current.length ? JSON.stringify(current) : ''}
        required={required ?? field?.required}
        disabled={disabled}
        triggerRef={trigger}
      />
    </div>
  );
}
