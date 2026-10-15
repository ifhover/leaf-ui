import { X } from 'lucide-react';
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { classes } from './classes';
import { inertProps } from './inert';
import { useListMotion } from './motion';

const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

interface SelectionItem {
  key: string;
  label: ReactNode;
  text: string;
  remove?: () => void;
  render?: ReactNode;
}

/** Shared selected-value layout. Measure the real tags, without mounting custom renderers twice. */
export function SelectionContent({
  items,
  children,
  className,
  tagClassName,
  tagWrap = true,
  maxTagCount,
  searchable = false,
  query = '',
  removeLabel,
}: {
  items?: readonly SelectionItem[];
  children?: ReactNode;
  className?: string;
  tagClassName?: string;
  tagWrap?: boolean;
  maxTagCount?: number | 'responsive';
  searchable?: boolean;
  query?: string;
  removeLabel?: string;
}) {
  const root = useRef<HTMLSpanElement>(null);
  const count = items?.length ?? 0;
  const limit = typeof maxTagCount === 'number' ? Math.max(0, Math.floor(maxTagCount)) : count;
  const singleLine = items !== undefined && (!tagWrap || maxTagCount === 'responsive');
  const [layout, setLayout] = useState({ count, firstWidth: 0, inputWidth: 0 });
  const visibleCount = Math.min(count, limit, singleLine ? layout.count : count);
  const hiddenItems = items?.slice(visibleCount) ?? [];
  const measure = useRef(() => {});
  measure.current = () => {
    const element = root.current;
    if (!singleLine || !element?.clientWidth) return;
    const width = element.clientWidth;
    const gap = Number.parseFloat(getComputedStyle(element).columnGap) || 0;
    // All writes precede the reads. The temporary measurement is restored before paint.
    const tags = Array.from(element.querySelectorAll<HTMLElement>('[data-selection-item]'));
    const hiddenTags = tags.filter((tag) => tag.hidden);
    element.dataset.measuring = '';
    // Normalize/utility styles often enforce [hidden] with !important. Temporarily
    // remove the attribute itself instead of relying on a CSS override.
    for (const tag of hiddenTags) tag.hidden = false;
    const widths = tags.map((tag) => tag.getBoundingClientRect().width);
    const overflowWidth =
      element.querySelector<HTMLElement>('[data-selection-counter]')?.getBoundingClientRect()
        .width ?? 0;
    const queryWidth =
      element.querySelector<HTMLElement>('[data-selection-query]')?.getBoundingClientRect().width ??
      0;
    for (const tag of hiddenTags) tag.hidden = true;
    delete element.dataset.measuring;
    const inputWidth = children
      ? Math.min(
          Math.max(0, width - (count ? overflowWidth + gap : 0)),
          searchable ? (query ? Math.max(48, queryWidth + 12) : 24) : 1,
        )
      : 0;
    const budget = Math.max(0, width - inputWidth - (children && count ? gap : 0));
    const totalWidth = widths.reduce((sum, value) => sum + value, 0) + Math.max(0, count - 1) * gap;
    let nextCount = 0;
    let firstWidth = 0;
    if (count <= limit && totalWidth <= budget) nextCount = count;
    else if (count === 1 && limit > 0 && budget >= Math.min(widths[0] ?? 0, 48)) {
      nextCount = 1;
      firstWidth = budget;
    } else {
      const tagBudget = Math.max(0, budget - overflowWidth - gap);
      let used = 0;
      for (const tagWidth of widths.slice(0, Math.min(limit, count - 1))) {
        const next = used + (nextCount ? gap : 0) + tagWidth;
        if (next > tagBudget) break;
        used = next;
        nextCount++;
      }
      // Keep the first long label useful, while preserving the remove button and +N.
      if (!nextCount && limit > 0 && count > 1 && tagBudget >= Math.min(widths[0] ?? 0, 48)) {
        nextCount = 1;
        firstWidth = tagBudget;
      }
    }
    setLayout((previous) =>
      previous.count === nextCount &&
      previous.firstWidth === firstWidth &&
      previous.inputWidth === inputWidth
        ? previous
        : { count: nextCount, firstWidth, inputWidth },
    );
  };
  useBrowserLayoutEffect(() => measure.current());
  // biome-ignore lint/correctness/useExhaustiveDependencies: Observe the new tag elements after selection changes.
  useEffect(() => {
    if (!singleLine || !root.current) return;
    const update = () => measure.current();
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(update);
    observer?.observe(root.current);
    for (const tag of root.current.querySelectorAll('[data-selection-item]'))
      observer?.observe(tag);
    window.addEventListener('resize', update);
    document.fonts?.addEventListener('loadingdone', update);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', update);
      document.fonts?.removeEventListener('loadingdone', update);
    };
  }, [singleLine, count]);
  useListMotion(
    root,
    JSON.stringify(items?.slice(0, visibleCount).map((item) => item.key)),
    '.leaf-selection__tag[data-motion-key]:not([hidden])',
    singleLine ? visibleCount : false,
  );
  return (
    <span
      ref={root}
      className={classes('leaf-selection', className)}
      data-multiple={items !== undefined || undefined}
      data-single-line={singleLine || undefined}
      style={
        singleLine
          ? ({
              '--leaf-selection-first-width': layout.firstWidth
                ? `${layout.firstWidth}px`
                : undefined,
              '--leaf-selection-input-width': `${layout.inputWidth}px`,
            } as CSSProperties)
          : undefined
      }
    >
      {items?.slice(0, singleLine ? count : visibleCount).map((item, index) => (
        <span
          className={classes('leaf-selection__tag', tagClassName)}
          key={item.key}
          data-selection-item=""
          data-motion-key={item.key}
          data-custom={item.render != null || undefined}
          hidden={index >= visibleCount}
          {...inertProps(index >= visibleCount)}
          title={item.text}
        >
          {item.render ?? (
            <>
              <span>{item.label}</span>
              {item.remove && (
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={`${removeLabel} ${item.text}`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={(event) => {
                    event.stopPropagation();
                    item.remove?.();
                  }}
                >
                  <X size={12} aria-hidden="true" />
                </button>
              )}
            </>
          )}
        </span>
      ))}
      {hiddenItems.length > 0 && (
        <span
          className={classes('leaf-selection__tag', tagClassName)}
          title={hiddenItems.map((item) => item.text).join(', ')}
          data-selection-overflow=""
        >
          +{hiddenItems.length}
          <span className="leaf-selection__sr">
            {hiddenItems.map((item) => item.text).join(', ')}
          </span>
        </span>
      )}
      {children && <span className="leaf-selection__input">{children}</span>}
      {singleLine && (
        <span className="leaf-selection__measure" aria-hidden="true">
          <span className={classes('leaf-selection__tag', tagClassName)} data-selection-counter="">
            +{count}
          </span>
          <span data-selection-query="">{query}</span>
        </span>
      )}
    </span>
  );
}
