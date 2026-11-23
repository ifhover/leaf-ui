import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { type HTMLAttributes, type ReactNode, useEffect, useId, useRef, useState } from 'react';
import { ButtonControl } from '../button/button';
import { useComponentProps } from '../config-provider/component-defaults';
import { useLeafConfig } from '../config-provider/context';
import { InputNumberControl as InputNumber } from '../inputnumber/inputnumber';
import { SelectControl } from '../select/select';
import { classes } from '../shared/classes';
import type { ControlSize } from '../shared/types';
import { useFormattedText } from '../shared/use-formatted-text';

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
  showTotal?: boolean | ((total: number, range: readonly [number, number]) => ReactNode);
  simple?: boolean;
  disabled?: boolean;
  hideOnSinglePage?: boolean;
  size?: ControlSize;
  variant?: 'outline' | 'ghost';
}
const positiveInteger = (value: number) =>
  Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1;
export function PaginationControl({
  total,
  current,
  defaultCurrent = 1,
  pageSize,
  defaultPageSize = 10,
  onChange,
  showSizeChanger = false,
  pageSizeOptions = [10, 20, 50, 100],
  showQuickJumper = false,
  showTotal = false,
  simple = false,
  disabled = false,
  hideOnSinglePage = false,
  size = 'md',
  variant = 'ghost',
  className,
  dir,
  'aria-label': label,
  ...props
}: PaginationProps) {
  const { messages, direction } = useLeafConfig();
  const format = useFormattedText();
  const root = useRef<HTMLElement>(null);
  const jumpId = `${useId()}-jump`;
  const [internalPage, setPage] = useState(defaultCurrent);
  const [internalSize, setSize] = useState(defaultPageSize);
  const [jump, setJump] = useState<number | null>(null);
  const committedJump = useRef<number | null>(null);
  const pointerAction = useRef(false);
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
  const commitJump = (text: string) => {
    if (disabled || !text.trim() || !Number.isFinite(Number(text))) return;
    const next = Math.min(pages, positiveInteger(Number(text)));
    if (committedJump.current === next) return;
    committedJump.current = next;
    choose(next);
    setJump(next);
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
  const baseOptions = pageSizeOptions
    .filter((value) => Number.isFinite(value) && value >= 1)
    .map(Math.floor);
  const hasPerPageInBase = baseOptions.includes(perPage);
  // 记住不在 pageSizeOptions 中但已传入过的每页条数，避免切换后原选项消失
  const [retainedSizes, setRetainedSizes] = useState<number[]>(() =>
    hasPerPageInBase ? [] : [perPage],
  );
  useEffect(() => {
    if (hasPerPageInBase || retainedSizes.includes(perPage)) return;
    setRetainedSizes((previous) =>
      previous.includes(perPage) ? previous : [...previous, perPage],
    );
  }, [hasPerPageInBase, perPage, retainedSizes]);
  const options = [...new Set([...baseOptions, ...retainedSizes, perPage])].sort((a, b) => a - b);
  if (hideOnSinglePage && pages === 1) return null;
  return (
    <nav
      {...props}
      ref={root}
      dir={dir ?? direction}
      aria-label={label ?? messages.pagination.label}
      data-disabled={disabled ? '' : undefined}
      className={classes(
        'leaf-pagination',
        `leaf-pagination--${size}`,
        `leaf-pagination--${variant}`,
        className,
      )}
      onPointerDownCapture={(event) => {
        // Safari may blur an input without focusing the button clicked next.
        pointerAction.current =
          event.target instanceof Element &&
          event.target.closest('button, [role="combobox"]') !== null;
        props.onPointerDownCapture?.(event);
      }}
    >
      {showTotal && (
        <span className="leaf-pagination__total">
          {typeof showTotal === 'function'
            ? showTotal(count, [
                count === 0 ? 0 : (page - 1) * perPage + 1,
                Math.min(count, page * perPage),
              ])
            : format('pagination.total', { total: count })}
        </span>
      )}
      <ButtonControl
        size={size}
        variant={variant === 'outline' ? 'outline' : 'text'}
        type="button"
        className="leaf-pagination__nav"
        disabled={disabled || page === 1}
        onClick={() => choose(page - 1)}
      >
        <ChevronLeft aria-hidden="true" />
        {messages.pagination.previousPage}
      </ButtonControl>
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
                <ButtonControl
                  size={size}
                  variant={variant === 'outline' ? 'outline' : 'text'}
                  type="button"
                  disabled={disabled}
                  aria-label={format('pagination.pageLabel', { page: number - 1 })}
                  onClick={() => choose(number - 1)}
                >
                  {number - 1}
                </ButtonControl>
              ) : (
                <ButtonControl
                  size={size}
                  variant={variant === 'outline' ? 'outline' : 'text'}
                  type="button"
                  className="leaf-pagination__jump"
                  disabled={disabled}
                  aria-label={
                    number > page ? messages.pagination.pageForward : messages.pagination.pageBack
                  }
                  onClick={() => choose(page + (number > page ? 5 : -5))}
                >
                  <span aria-hidden="true">…</span>
                  {number > page ? (
                    <ChevronsRight aria-hidden="true" />
                  ) : (
                    <ChevronsLeft aria-hidden="true" />
                  )}
                </ButtonControl>
              ))}
            <ButtonControl
              size={size}
              variant={variant === 'outline' ? 'outline' : number === page ? 'outline' : 'text'}
              type="button"
              aria-label={format('pagination.pageLabel', { page: number })}
              aria-current={number === page ? 'page' : undefined}
              disabled={disabled || (variant === 'outline' && number === page)}
              onClick={() => choose(number)}
            >
              {number}
            </ButtonControl>
          </span>
        ))
      )}
      <ButtonControl
        size={size}
        variant={variant === 'outline' ? 'outline' : 'text'}
        type="button"
        className="leaf-pagination__nav"
        disabled={disabled || page === pages}
        onClick={() => choose(page + 1)}
      >
        {messages.pagination.nextPage}
        <ChevronRight aria-hidden="true" />
      </ButtonControl>
      {showSizeChanger && (
        <span className="leaf-pagination__size">
          <SelectControl
            size={size}
            className="leaf-pagination__size-select"
            aria-label={messages.pagination.pageSize}
            showSearch={false}
            inputReadOnly
            disabled={disabled}
            value={String(perPage)}
            popupWidth="auto"
            popupMaxWidth={240}
            options={options.map((number) => ({
              value: String(number),
              label: format('pagination.pageSizeOption', { count: number }),
            }))}
            onChange={(next) =>
              choose(Math.floor(((page - 1) * perPage) / Number(next)) + 1, Number(next))
            }
          />
        </span>
      )}
      {showQuickJumper && (
        <label className="leaf-pagination__jumper" htmlFor={jumpId}>
          {messages.pagination.jumpTo}
          <InputNumber
            id={jumpId}
            aria-label={messages.pagination.jumpTo}
            size={size}
            min={1}
            max={pages}
            precision={0}
            controls={false}
            disabled={disabled}
            value={jump}
            onChange={setJump}
            onFocus={() => {
              committedJump.current = null;
              pointerAction.current = false;
            }}
            onInput={(event) => {
              if (event.currentTarget.value !== String(committedJump.current))
                committedJump.current = null;
            }}
            onBlur={(event) => {
              // A clicked page or size control takes precedence over an uncommitted draft.
              const action = pointerAction.current;
              pointerAction.current = false;
              if (action || (event.relatedTarget && root.current?.contains(event.relatedTarget)))
                return;
              commitJump(event.currentTarget.value);
            }}
            onKeyDown={(event) => {
              if (
                event.key === 'Enter' &&
                !event.nativeEvent.isComposing &&
                event.currentTarget.value.trim()
              ) {
                event.preventDefault();
                commitJump(event.currentTarget.value);
              }
            }}
          />
          {messages.pagination.page}
        </label>
      )}
    </nav>
  );
}

export function Pagination(rawProps: PaginationProps) {
  const props = useComponentProps('Pagination', rawProps);
  return <PaginationControl {...props} />;
}
