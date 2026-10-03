import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type HTMLAttributes, type ReactNode, useId, useState } from 'react';
import { useLeafConfig } from '../config-provider/config-provider';
import { InputNumber } from '../inputnumber';
import { Select } from '../select';
import { classes } from '../shared/classes';
import type { ControlSize } from '../shared/types';

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  total: number;
  current?: number;
  defaultCurrent?: number;
  pageSize?: number;
  defaultPageSize?: number;
  onChange?: (page: number, pageSize: number) => void;
  showSizeChanger?: boolean;
  pageSizeOptions?: readonly number[];
  showQuickJumper?: boolean;
  showTotal?: (total: number, range: readonly [number, number]) => ReactNode;
  simple?: boolean;
  disabled?: boolean;
  hideOnSinglePage?: boolean;
  size?: ControlSize;
}
const positiveInteger = (value: number) =>
  Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1;
export function Pagination({
  total,
  current,
  defaultCurrent = 1,
  pageSize,
  defaultPageSize = 10,
  onChange,
  showSizeChanger = false,
  pageSizeOptions = [10, 20, 50, 100],
  showQuickJumper = false,
  showTotal,
  simple = false,
  disabled = false,
  hideOnSinglePage = false,
  size = 'md',
  className,
  'aria-label': label,
  ...props
}: PaginationProps) {
  const { messages } = useLeafConfig();
  const jumpId = `${useId()}-jump`;
  const [internalPage, setPage] = useState(defaultCurrent);
  const [internalSize, setSize] = useState(defaultPageSize);
  const [jump, setJump] = useState<number | null>(null);
  const count = Math.max(0, Number.isFinite(total) ? Math.floor(total) : 0);
  const perPage = positiveInteger(pageSize ?? internalSize);
  const pages = Math.max(1, Math.ceil(count / perPage));
  const page = Math.min(pages, positiveInteger(current ?? internalPage));
  const choose = (next: number, nextSize = perPage) => {
    if (disabled) return;
    const normalizedSize = positiveInteger(nextSize);
    const normalizedPage = Math.min(
      Math.max(1, Math.ceil(count / normalizedSize)),
      positiveInteger(next),
    );
    if (current === undefined) setPage(normalizedPage);
    if (pageSize === undefined) setSize(normalizedSize);
    if (normalizedPage !== page || normalizedSize !== perPage)
      onChange?.(normalizedPage, normalizedSize);
  };
  const candidates =
    pages <= 7
      ? Array.from({ length: pages }, (_, i) => i + 1)
      : [
          ...new Set([
            1,
            pages,
            ...Array.from({ length: 3 }, (_, i) => Math.min(pages - 1, Math.max(2, page - 1 + i))),
            ...(page <= 3 ? [2, 3, 4] : []),
            ...(page >= pages - 2 ? [pages - 3, pages - 2, pages - 1] : []),
          ]),
        ].sort((a, b) => a - b);
  const options = [...new Set([...pageSizeOptions.map(positiveInteger), perPage])].sort(
    (a, b) => a - b,
  );
  if (hideOnSinglePage && pages === 1) return null;
  return (
    <nav
      {...props}
      aria-label={label ?? messages.pagination}
      className={classes('leaf-pagination', `leaf-pagination--${size}`, className)}
    >
      {showTotal && (
        <span className="leaf-pagination__total">
          {showTotal(count, [
            count === 0 ? 0 : (page - 1) * perPage + 1,
            Math.min(count, page * perPage),
          ])}
        </span>
      )}
      <button
        type="button"
        disabled={disabled || page === 1}
        aria-label={messages.previousPage}
        onClick={() => choose(page - 1)}
      >
        <ChevronLeft size={16} aria-hidden="true" />
      </button>
      {simple ? (
        <span className="leaf-pagination__simple">
          {page} / {pages}
        </span>
      ) : (
        candidates.map((number, index) => (
          <span className="leaf-pagination__entry" key={number}>
            {index > 0 &&
              number - (candidates[index - 1] ?? 0) > 1 &&
              (number - (candidates[index - 1] ?? 0) === 2 ? (
                <button
                  type="button"
                  disabled={disabled}
                  aria-label={`${messages.page} ${number - 1}`}
                  onClick={() => choose(number - 1)}
                >
                  {number - 1}
                </button>
              ) : (
                <span className="leaf-pagination__ellipsis" aria-hidden="true">
                  …
                </span>
              ))}
            <button
              type="button"
              aria-label={`${messages.page} ${number}`}
              aria-current={number === page ? 'page' : undefined}
              disabled={disabled}
              onClick={() => choose(number)}
            >
              {number}
            </button>
          </span>
        ))
      )}
      <button
        type="button"
        disabled={disabled || page === pages}
        aria-label={messages.nextPage}
        onClick={() => choose(page + 1)}
      >
        <ChevronRight size={16} aria-hidden="true" />
      </button>
      {showSizeChanger && (
        <Select
          size={size}
          className="leaf-pagination__size"
          aria-label={messages.pageSize}
          disabled={disabled}
          value={String(perPage)}
          options={options.map((number) => ({
            value: String(number),
            label: `${number} ${messages.itemsPerPage}`,
          }))}
          onChange={(next) =>
            choose(Math.floor(((page - 1) * perPage) / Number(next)) + 1, Number(next))
          }
        />
      )}
      {showQuickJumper && (
        <label className="leaf-pagination__jumper" htmlFor={jumpId}>
          {messages.jumpTo}
          <InputNumber
            id={jumpId}
            aria-label={messages.jumpTo}
            size={size}
            min={1}
            max={pages}
            precision={0}
            controls={false}
            disabled={disabled}
            value={jump}
            onChange={setJump}
            onKeyDown={(event) => {
              if (
                event.key === 'Enter' &&
                !event.nativeEvent.isComposing &&
                event.currentTarget.value.trim() &&
                Number.isFinite(Number(event.currentTarget.value))
              ) {
                event.preventDefault();
                choose(Number(event.currentTarget.value));
                setJump(Math.min(pages, positiveInteger(Number(event.currentTarget.value))));
              }
            }}
          />
        </label>
      )}
    </nav>
  );
}
