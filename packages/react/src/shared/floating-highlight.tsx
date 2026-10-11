import { type CSSProperties, type RefObject, useEffect, useLayoutEffect, useState } from 'react';

const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
type Geometry = { x: number; y: number; width: number; height: number };

/** Measure on discrete selection/layout changes; CSS interpolates without a JS frame loop. */
export function useFloatingHighlight(
  open: boolean,
  panel: RefObject<HTMLElement | null>,
  activeId: string | undefined,
  revision: string,
) {
  const [geometry, setGeometry] = useState<Geometry>();
  useBrowserLayoutEffect(() => {
    const node = panel.current;
    if (!open || !node) return;
    const row = Array.from(node.querySelectorAll<HTMLElement>('[role="option"]')).find(
      (option) => option.id === activeId,
    );
    if (!row) {
      setGeometry(undefined);
      return;
    }
    const update = () => {
      const container = node.getBoundingClientRect();
      const target = row.getBoundingClientRect();
      // Account for both virtual-row translation and the popup's entrance scale.
      const scale = container.width / node.offsetWidth || 1;
      const next = {
        x: (target.left - container.left) / scale - node.clientLeft + node.scrollLeft,
        y: (target.top - container.top) / scale - node.clientTop + node.scrollTop,
        width: row.offsetWidth,
        height: row.offsetHeight,
      };
      setGeometry((previous) =>
        previous &&
        Object.keys(next).every(
          (key) => Math.abs(previous[key as keyof Geometry] - next[key as keyof Geometry]) < 0.5,
        )
          ? previous
          : next,
      );
    };
    update();
    node.addEventListener('scroll', update, { passive: true });
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : undefined;
    observer?.observe(node);
    observer?.observe(row);
    return () => {
      node.removeEventListener('scroll', update);
      observer?.disconnect();
    };
  }, [open, panel, activeId, revision]);
  return geometry
    ? ({
        '--leaf-option-highlight-x': `${geometry.x}px`,
        '--leaf-option-highlight-y': `${geometry.y}px`,
        '--leaf-option-highlight-width': `${geometry.width}px`,
        '--leaf-option-highlight-height': `${geometry.height}px`,
      } as CSSProperties)
    : undefined;
}

export function FloatingHighlight({
  style,
  hidden,
  selected,
}: {
  style?: CSSProperties;
  hidden?: boolean;
  selected?: boolean;
}) {
  return (
    <div
      className="leaf-floating__highlight"
      aria-hidden="true"
      data-ready={Boolean(style)}
      data-hidden={hidden || undefined}
      data-selected={selected || undefined}
      style={style}
    />
  );
}
