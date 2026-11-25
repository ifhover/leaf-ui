import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import {
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { ButtonControl, toIconButtonSize } from '../button/button';
import { useComponentProps } from '../config-provider/component-defaults';
import { useLeafConfig } from '../config-provider/context';
import { ScrollbarControl } from '../scrollbar/scrollbar';
import { classes } from '../shared/classes';
import { createLazyModule } from '../shared/lazy-module';
import { useMotionEnabled } from '../shared/motion';
import type { ControlSize } from '../shared/types';
import { useFormattedText } from '../shared/use-formatted-text';
import { useText } from '../shared/use-text';
import { useMovingIndicator } from './use-moving-indicator';

const useSortableModule = createLazyModule(() => import('./sortable'));

export interface TabItem {
  key: string;
  label: ReactNode;
  children?: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
  closable?: boolean;
}
export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items: readonly TabItem[];
  activeKey?: string;
  defaultActiveKey?: string;
  onChange?: (key: string) => void;
  type?: 'line' | 'card' | 'segmented';
  placement?: 'top' | 'bottom';
  size?: ControlSize;
  /** Fill the available width with equally sized tabs. */
  block?: boolean;
  activationMode?: 'automatic' | 'manual';
  destroyInactive?: boolean;
  extra?: ReactNode;
  onClose?: (key: string, event: MouseEvent<HTMLButtonElement>) => void;
  onAdd?: () => void;
  addLabel?: string;
  overflow?: boolean;
  sortable?: boolean;
  onReorder?: (items: TabItem[]) => void;
}
export interface TabsParts {
  rootProps: HTMLAttributes<HTMLDivElement>;
  header: ReactNode;
  panels: ReactNode;
  selected: string | undefined;
  hasPanels: boolean;
  hasVisiblePanel: boolean;
}

/** 内部复用原语：拆分标签栏与面板，供 Card / Modal / Drawer 在各自滚动与分区结构中组装。 */
export function useTabsParts({
  items,
  activeKey,
  defaultActiveKey,
  onChange,
  type = 'line',
  placement = 'top',
  size = 'md',
  block = false,
  activationMode = 'automatic',
  destroyInactive = false,
  extra,
  onClose,
  onAdd,
  addLabel,
  overflow = true,
  sortable = false,
  onReorder,
  className,
  panelsClassName,
  'aria-label': label,
  'aria-labelledby': labelledBy,
  visibilityKey,
  ...props
}: TabsProps & { visibilityKey?: unknown; panelsClassName?: string }): TabsParts | null {
  const { direction } = useLeafConfig();
  const t = useText();
  const format = useFormattedText();
  const motion = useMotionEnabled();
  const enabled = items.filter((item) => !item.disabled);
  const [internal, setInternal] = useState(defaultActiveKey ?? enabled[0]?.key);
  const requested = activeKey ?? internal;
  const selected = enabled.find((item) => item.key === requested)?.key ?? enabled[0]?.key;
  const [focused, setFocused] = useState<string>();
  const focusKey = enabled.some((item) => item.key === focused) ? focused : selected;
  const [visited, setVisited] = useState<readonly string[]>(selected ? [selected] : []);
  if (selected && !visited.includes(selected)) setVisited([...visited, selected]);
  const id = useId();
  const list = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const indicator = useRef<HTMLSpanElement>(null);
  useMovingIndicator(
    track,
    indicator,
    '[data-leaf-indicator-item][data-active="true"]',
    `${selected}-${placement}-${type}-${direction}-${visibilityKey ?? ''}`,
    items.length > 0,
  );
  const [scrollSides, setScrollSides] = useState({ start: false, end: false });
  const sorting = sortable && Boolean(onReorder);
  const sortableModule = useSortableModule(sorting);
  const draggingActive = sorting && sortableModule !== null;
  // biome-ignore lint/correctness/useExhaustiveDependencies: Observe the new tab elements after the item list changes.
  useEffect(() => {
    const node = list.current;
    if (!overflow || !node) {
      setScrollSides((previous) =>
        !previous.start && !previous.end ? previous : { start: false, end: false },
      );
      return;
    }
    const measure = () => {
      const maxScroll = Math.max(0, node.scrollWidth - node.clientWidth);
      if (maxScroll <= 1) {
        setScrollSides((previous) =>
          !previous.start && !previous.end ? previous : { start: false, end: false },
        );
        return;
      }
      const offset = direction === 'rtl' ? Math.abs(node.scrollLeft) : node.scrollLeft;
      const start = offset > 1;
      const end = maxScroll - offset > 1;
      setScrollSides((previous) =>
        previous.start === start && previous.end === end ? previous : { start, end },
      );
    };
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(node);
    if (track.current) observer?.observe(track.current);
    node.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect();
      node.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [direction, overflow, items]);
  const choose = (key: string) => {
    if (!enabled.some((item) => item.key === key)) return;
    if (activeKey === undefined) setInternal(key);
    if (key !== selected) onChange?.(key);
  };
  const scrollTabs = (side: 'start' | 'end') => {
    const node = list.current;
    if (!node) return;
    const distance = Math.max(120, node.clientWidth * 0.8);
    const left = direction === 'rtl' ? side === 'end' : side === 'start';
    node.scrollBy?.({
      left: left ? -distance : distance,
      behavior: motion ? 'smooth' : 'auto',
    });
  };
  if (items.length === 0) return null;
  const hasPanels = items.some((item) => item.children != null);
  const hasVisiblePanel = items.some((item) => item.key === selected && item.children != null);
  const renderEntry = (item: TabItem, index: number) => {
    const content = (
      <>
        <button
          id={`${id}-tab-${index}`}
          type="button"
          role="tab"
          aria-selected={item.key === selected}
          aria-controls={item.children != null ? `${id}-panel-${index}` : undefined}
          disabled={item.disabled}
          tabIndex={item.key === focusKey ? 0 : -1}
          className="leaf-tabs__tab"
          onFocus={() => setFocused(item.key)}
          onClick={() => choose(item.key)}
          onKeyDown={(event) => {
            let next: string | undefined;
            const position = enabled.findIndex((entry) => entry.key === item.key);
            const forward = direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
            const backward = direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
            if (event.key === forward) next = enabled[(position + 1) % enabled.length]?.key;
            else if (event.key === backward)
              next = enabled[(position - 1 + enabled.length) % enabled.length]?.key;
            else if (event.key === 'Home') next = enabled[0]?.key;
            else if (event.key === 'End') next = enabled.at(-1)?.key;
            if (next !== undefined) {
              event.preventDefault();
              setFocused(next);
              const nextIndex = items.findIndex((entry) => entry.key === next);
              list.current
                ?.querySelector<HTMLButtonElement>(`[id='${id}-tab-${nextIndex}']`)
                ?.focus();
              if (activationMode === 'automatic') choose(next);
            }
          }}
        >
          {item.icon && <span aria-hidden="true">{item.icon}</span>}
          {item.label}
        </button>
        {item.closable && (
          <button
            type="button"
            className="leaf-tabs__close"
            disabled={item.disabled || !onClose}
            aria-label={format('tabs.closeLabel', {
              label: typeof item.label === 'string' ? item.label : item.key,
            })}
            onClick={(event) => {
              onClose?.(item.key, event);
              if (event.defaultPrevented) return;
              const position = enabled.findIndex((entry) => entry.key === item.key);
              const next =
                item.key === selected
                  ? (enabled[position + 1] ?? enabled[position - 1])
                  : enabled.find((entry) => entry.key === selected);
              if (next) {
                if (item.key === selected) choose(next.key);
                const nextIndex = items.findIndex((entry) => entry.key === next.key);
                list.current
                  ?.querySelector<HTMLButtonElement>(`[id='${id}-tab-${nextIndex}']`)
                  ?.focus();
              }
            }}
          >
            <X size={13} aria-hidden="true" />
          </button>
        )}
      </>
    );
    return draggingActive ? (
      <sortableModule.SortableTab
        item={item}
        className="leaf-tabs__entry"
        key={item.key}
        data-active={item.key === selected || undefined}
        data-leaf-indicator-item=""
      >
        {content}
      </sortableModule.SortableTab>
    ) : (
      <div
        className="leaf-tabs__entry"
        key={item.key}
        data-tab-key={item.key}
        data-active={item.key === selected || undefined}
        data-leaf-indicator-item=""
      >
        {content}
      </div>
    );
  };
  const headerBar = (
    <div className="leaf-tabs__header">
      <div className="leaf-tabs__viewport">
        <ScrollbarControl
          ref={list}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setFocused(undefined);
          }}
          role="tablist"
          aria-label={label}
          aria-labelledby={labelledBy}
          scrollbar="hidden"
          viewportProps={{ 'aria-orientation': 'horizontal' }}
          className="leaf-tabs__scroll"
          viewportClassName="leaf-tabs__list"
          tabIndex={-1}
          scrollbarTabIndex={-1}
        >
          <div ref={track} className="leaf-tabs__track">
            <span ref={indicator} className="leaf-tabs__indicator" aria-hidden="true" />
            {draggingActive ? (
              <sortableModule.TabSortableList items={items}>
                {items.map(renderEntry)}
              </sortableModule.TabSortableList>
            ) : (
              items.map(renderEntry)
            )}
          </div>
        </ScrollbarControl>
        {scrollSides.start && (
          <ButtonControl
            className="leaf-tabs__scroll-action leaf-tabs__scroll-action--start"
            variant="outline"
            size={toIconButtonSize(size)}
            aria-label={t(direction === 'rtl' ? 'tabs.scrollRight' : 'tabs.scrollLeft')}
            onClick={() => scrollTabs('start')}
          >
            {direction === 'rtl' ? (
              <ChevronRight aria-hidden="true" />
            ) : (
              <ChevronLeft aria-hidden="true" />
            )}
          </ButtonControl>
        )}
        {scrollSides.end && (
          <ButtonControl
            className="leaf-tabs__scroll-action leaf-tabs__scroll-action--end"
            variant="outline"
            size={toIconButtonSize(size)}
            aria-label={t(direction === 'rtl' ? 'tabs.scrollLeft' : 'tabs.scrollRight')}
            onClick={() => scrollTabs('end')}
          >
            {direction === 'rtl' ? (
              <ChevronLeft aria-hidden="true" />
            ) : (
              <ChevronRight aria-hidden="true" />
            )}
          </ButtonControl>
        )}
      </div>
      {onAdd && (
        <ButtonControl
          className="leaf-tabs__action"
          variant="text"
          size={toIconButtonSize(size)}
          aria-label={addLabel ?? t('tabs.addTab')}
          onClick={onAdd}
        >
          <Plus aria-hidden="true" />
        </ButtonControl>
      )}
      {extra && <div className="leaf-tabs__extra">{extra}</div>}
    </div>
  );
  return {
    selected,
    hasPanels,
    hasVisiblePanel,
    rootProps: {
      ...props,
      className: classes(
        'leaf-tabs',
        `leaf-tabs--${type}`,
        `leaf-tabs--${placement}`,
        `leaf-tabs--${size}`,
        block && 'leaf-tabs--block',
        className,
      ),
    },
    header: draggingActive ? (
      <sortableModule.TabSortScope items={items} onReorder={onReorder}>
        {headerBar}
      </sortableModule.TabSortScope>
    ) : (
      headerBar
    ),
    panels: hasPanels ? (
      <div className={classes('leaf-tabs__panels', panelsClassName)}>
        {items.map(
          (item, index) =>
            item.children != null && (
              <div
                key={item.key}
                id={`${id}-panel-${index}`}
                role="tabpanel"
                aria-labelledby={`${id}-tab-${index}`}
                hidden={item.key !== selected}
                // biome-ignore lint/a11y/noNoninteractiveTabindex: Tabpanels are keyboard focus destinations in the ARIA tabs pattern.
                tabIndex={0}
                className="leaf-tabs__panel"
              >
                {(item.key === selected || (!destroyInactive && visited.includes(item.key))) &&
                  item.children}
              </div>
            ),
        )}
      </div>
    ) : null,
  };
}

export function TabsControl(props: TabsProps) {
  const parts = useTabsParts(props);
  if (!parts) return null;
  return (
    <div {...parts.rootProps}>
      {parts.header}
      {parts.panels}
    </div>
  );
}

export function Tabs(rawProps: TabsProps) {
  const props = useComponentProps('Tabs', rawProps);
  return <TabsControl {...props} />;
}
