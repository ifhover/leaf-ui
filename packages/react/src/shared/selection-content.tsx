import { X } from 'lucide-react';
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useLeafConfig } from '../config-provider/context';
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
  const { theme, density } = useLeafConfig();
  const count = items?.length ?? 0;
  const limit = typeof maxTagCount === 'number' ? Math.max(0, Math.floor(maxTagCount)) : count;
  const singleLine = items !== undefined && (!tagWrap || maxTagCount === 'responsive');
  const [layout, setLayout] = useState({ count, firstWidth: 0, inputWidth: 0 });
  const visibleCount = Math.min(count, limit, singleLine ? layout.count : count);
  const hiddenItems = items?.slice(visibleCount) ?? [];
  const widths = useRef(new Map<HTMLElement, number>());
  const tags = useRef<HTMLElement[]>([]);
  const resizeObserver = useRef<ResizeObserver | null>(null);
  const mutationObserver = useRef<MutationObserver | null>(null);
  const frame = useRef<number | null>(null);
  const invalidateContent = useRef((records: MutationRecord[]) => {
    let changed = false;
    for (const record of records) {
      const target = record.target instanceof Element ? record.target : record.target.parentElement;
      const tag = target?.closest<HTMLElement>('[data-selection-item]');
      if (tag && root.current?.contains(tag)) {
        // Showing tags to measure them, and folding them afterwards, do not change their content.
        if (
          record.type === 'attributes' &&
          record.target === tag &&
          (record.attributeName === 'hidden' || record.attributeName === 'inert')
        )
          continue;
        widths.current.delete(tag);
      } else if (record.type === 'attributes' && record.target === root.current) {
        if (record.attributeName !== 'class') continue;
        widths.current.clear();
      }
      changed = true;
    }
    return changed;
  });
  const measure = useRef(() => {});
  measure.current = () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    invalidateContent.current(mutationObserver.current?.takeRecords() ?? []);
    const element = root.current;
    if (!singleLine || !element?.clientWidth) return;
    const width = element.clientWidth;
    const gap = Number.parseFloat(getComputedStyle(element).columnGap) || 0;
    const nextTags = Array.from(element.querySelectorAll<HTMLElement>('[data-selection-item]'));
    const retained = new Set(nextTags);
    for (const tag of tags.current) {
      if (retained.has(tag)) continue;
      resizeObserver.current?.unobserve(tag);
      widths.current.delete(tag);
    }
    const previous = new Set(tags.current);
    for (const tag of nextTags) if (!previous.has(tag)) resizeObserver.current?.observe(tag);
    tags.current = nextTags;
    const missing = nextTags.filter((tag) => !widths.current.has(tag));
    if (missing.length) {
      // Measure only new/invalidated content, on the real nodes, before paint.
      const hiddenTags = missing.filter((tag) => tag.hidden);
      element.dataset.measuring = '';
      for (const tag of hiddenTags) tag.hidden = false;
      for (const tag of missing) widths.current.set(tag, tag.getBoundingClientRect().width);
      for (const tag of hiddenTags) tag.hidden = true;
      delete element.dataset.measuring;
    }
    const tagWidths = nextTags.map((tag) => widths.current.get(tag) ?? 0);
    const overflowWidth =
      element.querySelector<HTMLElement>('[data-selection-counter]')?.getBoundingClientRect()
        .width ?? 0;
    const queryWidth =
      element.querySelector<HTMLElement>('[data-selection-query]')?.getBoundingClientRect().width ??
      0;
    const inputWidth = children
      ? Math.min(
          Math.max(0, width - (count ? overflowWidth + gap : 0)),
          searchable ? (query ? Math.max(48, queryWidth + 12) : 24) : 1,
        )
      : 0;
    const budget = Math.max(0, width - inputWidth - (children && count ? gap : 0));
    const totalWidth =
      tagWidths.reduce((sum, value) => sum + value, 0) + Math.max(0, count - 1) * gap;
    let nextCount = 0;
    let firstWidth = 0;
    if (count <= limit && totalWidth <= budget) nextCount = count;
    else if (count === 1 && limit > 0 && budget >= Math.min(tagWidths[0] ?? 0, 48)) {
      nextCount = 1;
      firstWidth = budget;
    } else {
      const tagBudget = Math.max(0, budget - overflowWidth - gap);
      let used = 0;
      for (const tagWidth of tagWidths.slice(0, Math.min(limit, count - 1))) {
        const next = used + (nextCount ? gap : 0) + tagWidth;
        if (next > tagBudget) break;
        used = next;
        nextCount++;
      }
      // Keep the first long label useful, while preserving the remove button and +N.
      if (!nextCount && limit > 0 && count > 1 && tagBudget >= Math.min(tagWidths[0] ?? 0, 48)) {
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
  useBrowserLayoutEffect(() => {
    widths.current.clear();
  }, [theme, density, className, tagClassName, singleLine]);
  useBrowserLayoutEffect(() => measure.current());
  useBrowserLayoutEffect(() => {
    if (!singleLine || !root.current) return;
    const schedule = () => {
      if (frame.current === null) frame.current = requestAnimationFrame(() => measure.current());
    };
    const update = () => {
      widths.current.clear();
      schedule();
    };
    // Initial delivery only checks layout; later size changes also invalidate widths.
    const delivered = new WeakSet<Element>();
    const observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver((entries) => {
            for (const entry of entries) {
              if (delivered.has(entry.target)) {
                if (
                  entry.target instanceof HTMLElement &&
                  entry.target.hasAttribute('data-selection-item')
                ) {
                  // Folding a tag does not invalidate its natural width. A resized
                  // visible tag only invalidates itself, not every hidden selection.
                  if (!entry.target.hidden) widths.current.delete(entry.target);
                } else widths.current.clear();
              }
              delivered.add(entry.target);
            }
            schedule();
          });
    resizeObserver.current = observer;
    observer?.observe(root.current);
    for (const tag of tags.current) observer?.observe(tag);
    const counter = root.current.querySelector('[data-selection-counter]');
    if (counter) observer?.observe(counter);
    const mutations =
      typeof MutationObserver === 'undefined'
        ? null
        : new MutationObserver((records) => {
            if (invalidateContent.current(records)) schedule();
          });
    mutationObserver.current = mutations;
    mutations?.observe(root.current, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
    });
    window.addEventListener('resize', update);
    document.fonts?.addEventListener('loadingdone', update);
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
      observer?.disconnect();
      mutations?.disconnect();
      resizeObserver.current = null;
      mutationObserver.current = null;
      window.removeEventListener('resize', update);
      document.fonts?.removeEventListener('loadingdone', update);
    };
  }, [singleLine]);
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
