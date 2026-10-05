import { type HTMLAttributes, type ReactNode, useEffect, useRef } from 'react';
import { useLeafConfig } from '../config-provider/context';
import { classes } from '../shared/classes';
import { inertProps } from '../shared/inert';
import { useControllable } from '../shared/use-controllable';
import { useText } from '../shared/use-text';
export interface SplitterPanel {
  key: string;
  children: ReactNode;
  min?: number;
  max?: number;
  collapsible?: boolean;
  resizable?: boolean;
}
export interface SplitterProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onResize'> {
  panels: readonly SplitterPanel[];
  sizes?: readonly number[];
  defaultSizes?: readonly number[];
  onResize?: (sizes: number[]) => void;
  onResizeEnd?: (sizes: number[]) => void;
  direction?: 'horizontal' | 'vertical';
}
export function Splitter({
  panels,
  sizes,
  defaultSizes,
  onResize,
  onResizeEnd,
  direction = 'horizontal',
  className,
  style,
  ...props
}: SplitterProps) {
  const t = useText();
  const config = useLeafConfig();
  const root = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useControllable<readonly number[]>(
    sizes,
    defaultSizes ?? panels.map(() => 100 / Math.max(1, panels.length)),
    (next) => onResize?.([...next]),
  );
  const sum = current.reduce(
    (total, value) => total + (Number.isFinite(value) ? Math.max(0, value) : 0),
    0,
  );
  const normalized =
    panels.length === current.length && sum > 0
      ? current.map((value) => (Math.max(0, value) * 100) / sum)
      : panels.map(() => 100 / Math.max(1, panels.length));
  const latest = useRef<readonly number[]>(normalized);
  latest.current = normalized;
  const stopDragging = useRef<(() => void) | undefined>(undefined);
  useEffect(() => () => stopDragging.current?.(), []);
  const collapsed = useRef(new Map<number, number>());
  const horizontal = direction === 'horizontal';
  const pair = (index: number, amount: number, source: readonly number[] = latest.current) => {
    const next = [...source];
    const total = (source[index] ?? 0) + (source[index + 1] ?? 0);
    const first = panels[index],
      second = panels[index + 1];
    if (!first || !second) return;
    const low = Math.max(first.min ?? 5, total - (second.max ?? 100));
    const high = Math.min(first.max ?? 100, total - (second.min ?? 5));
    if (low > high) return;
    next[index] = Math.min(high, Math.max(low, (source[index] ?? 0) + amount));
    next[index + 1] = total - (next[index] ?? 0);
    latest.current = next;
    setCurrent(next);
  };
  const toggle = (index: number) => {
    const next = [...latest.current],
      size = next[index] ?? 0;
    if (size) {
      collapsed.current.set(index, size);
      next[index + 1] = (next[index + 1] ?? 0) + size;
      next[index] = 0;
    } else {
      const restore = Math.min(
        collapsed.current.get(index) ?? 25,
        Math.max(0, (next[index + 1] ?? 0) - (panels[index + 1]?.min ?? 5)),
      );
      next[index] = restore;
      next[index + 1] = (next[index + 1] ?? 0) - restore;
    }
    latest.current = next;
    setCurrent(next);
    onResizeEnd?.(next);
  };
  return (
    <div
      {...props}
      ref={root}
      className={classes('leaf-splitter', `leaf-splitter--${direction}`, className)}
      style={style}
    >
      {panels.map((panel, index) => (
        <div key={panel.key} className="leaf-splitter__unit" style={{ display: 'contents' }}>
          <div
            className="leaf-splitter__panel"
            data-collapsed={normalized[index] === 0 || undefined}
            {...inertProps(normalized[index] === 0)}
            style={{ flexBasis: `${normalized[index] ?? 0}%`, flexGrow: 0, flexShrink: 1 }}
          >
            {panel.children}
          </div>
          {index < panels.length - 1 && (
            // biome-ignore lint/a11y/useSemanticElements: An adjustable, focusable splitter follows the ARIA window-splitter pattern; a static hr cannot contain its collapse button.
            <div
              role="separator"
              tabIndex={panel.resizable === false ? -1 : 0}
              aria-label={`${t('调整面板', 'Resize panel')} ${index + 1}`}
              aria-orientation={horizontal ? 'vertical' : 'horizontal'}
              aria-valuenow={Math.round(current[index] ?? 0)}
              aria-valuemin={panel.min ?? 0}
              aria-valuemax={panel.max ?? 100}
              className="leaf-splitter__handle"
              onPointerDown={(event) => {
                if (panel.resizable === false || !root.current) return;
                stopDragging.current?.();
                event.preventDefault();
                event.currentTarget.setPointerCapture(event.pointerId);
                const start = horizontal ? event.clientX : event.clientY;
                const source = [...latest.current];
                const rect = root.current.getBoundingClientRect();
                const length = horizontal ? rect.width : rect.height;
                const move = (event: PointerEvent) =>
                  pair(
                    index,
                    (((horizontal ? event.clientX : event.clientY) - start) / Math.max(1, length)) *
                      100 *
                      (horizontal && config.direction === 'rtl' ? -1 : 1),
                    source,
                  );
                const cleanup = () => {
                  window.removeEventListener('pointermove', move);
                  window.removeEventListener('pointerup', end);
                  window.removeEventListener('pointercancel', end);
                };
                const end = () => {
                  cleanup();
                  onResizeEnd?.([...latest.current]);
                };
                stopDragging.current = cleanup;
                window.addEventListener('pointermove', move);
                window.addEventListener('pointerup', end, { once: true });
                window.addEventListener('pointercancel', end, { once: true });
              }}
              onDoubleClick={() => {
                if (panel.collapsible) toggle(index);
              }}
              onKeyDown={(event) => {
                const plus = horizontal
                  ? config.direction === 'rtl'
                    ? 'ArrowLeft'
                    : 'ArrowRight'
                  : 'ArrowDown';
                const minus = horizontal
                  ? config.direction === 'rtl'
                    ? 'ArrowRight'
                    : 'ArrowLeft'
                  : 'ArrowUp';
                if (event.key === plus || event.key === minus) {
                  event.preventDefault();
                  pair(index, (event.key === plus ? 1 : -1) * (event.shiftKey ? 10 : 2));
                  onResizeEnd?.([...latest.current]);
                }
                if (event.key === 'Enter' && panel.collapsible) {
                  event.preventDefault();
                  toggle(index);
                }
              }}
            >
              {panel.collapsible && (
                <button
                  type="button"
                  aria-label={t('折叠或展开面板', 'Toggle panel')}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => toggle(index)}
                >
                  {current[index] === 0 ? '+' : '−'}
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
export const ResizablePanels = Splitter;
