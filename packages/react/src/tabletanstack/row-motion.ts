import { type RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { animateMotion, useMotionEnabled } from '../shared/motion';

const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** Retained tree rows collapse in their original cells, preserving native input instances. */
export function useRowMotion(
  ref: RefObject<HTMLTableRowElement | null>,
  collapsed: boolean,
  enabled: boolean,
) {
  const motion = useMotionEnabled();
  const [closed, setClosed] = useState(collapsed);
  const previous = useRef(collapsed);
  const animations = useRef<Animation[]>([]);
  useBrowserLayoutEffect(() => {
    const row = ref.current;
    const changed = previous.current !== collapsed;
    previous.current = collapsed;
    if (!row) return;
    if (!enabled || !motion || !changed) {
      for (const animation of animations.current) animation.cancel();
      animations.current = [];
      row.hidden = collapsed;
      setClosed(collapsed);
      return;
    }
    const cells = Array.from(row.cells);
    const contents = cells.map((cell) => cell.firstElementChild as HTMLElement | null);
    if (contents.some((content) => !content?.classList.contains('leaf-data-table__row-content'))) {
      for (const animation of animations.current) animation.cancel();
      animations.current = [];
      row.hidden = collapsed;
      setClosed(collapsed);
      return;
    }
    // Read the visible state before cancelling a previous, possibly reversed transition.
    const live = animations.current.length
      ? cells.map((cell, index) => {
          const content = contents[index] as HTMLElement;
          const style = getComputedStyle(cell);
          return {
            height: Number.parseFloat(getComputedStyle(content).height) || 0,
            opacity: getComputedStyle(content).opacity,
            paddingTop: style.paddingTop,
            paddingBottom: style.paddingBottom,
            borderBottomWidth: style.borderBottomWidth,
          };
        })
      : undefined;
    for (const animation of animations.current) animation.cancel();
    animations.current = [];
    row.hidden = false;
    setClosed(false);
    const measurements = cells.map((cell, index) => {
      const content = contents[index] as HTMLElement;
      const style = getComputedStyle(cell);
      return {
        cell,
        content,
        height: Number.parseFloat(getComputedStyle(content).height) || 0,
        paddingTop: style.paddingTop,
        paddingBottom: style.paddingBottom,
        borderBottomWidth: style.borderBottomWidth,
        start: live?.[index],
      };
    });
    for (const item of measurements) {
      const start = item.start;
      const contentAnimation = animateMotion(item.content, [
        {
          height: `${start?.height ?? (collapsed ? item.height : 0)}px`,
          opacity: start?.opacity ?? (collapsed ? 1 : 0),
          overflow: 'clip',
        },
        {
          height: `${collapsed ? 0 : item.height}px`,
          opacity: collapsed ? 0 : 1,
          overflow: 'clip',
        },
      ]);
      const cellAnimation = animateMotion(item.cell, [
        {
          paddingTop: start?.paddingTop ?? (collapsed ? item.paddingTop : '0px'),
          paddingBottom: start?.paddingBottom ?? (collapsed ? item.paddingBottom : '0px'),
          borderBottomWidth:
            start?.borderBottomWidth ?? (collapsed ? item.borderBottomWidth : '0px'),
        },
        {
          paddingTop: collapsed ? '0px' : item.paddingTop,
          paddingBottom: collapsed ? '0px' : item.paddingBottom,
          borderBottomWidth: collapsed ? '0px' : item.borderBottomWidth,
        },
      ]);
      if (contentAnimation) animations.current.push(contentAnimation);
      if (cellAnimation) animations.current.push(cellAnimation);
    }
    const current = animations.current;
    if (!current.length) {
      row.hidden = collapsed;
      setClosed(collapsed);
      return;
    }
    // Hide before removing the final animated geometry; no forwards keyframes remain.
    void Promise.all(current.map((animation) => animation.finished)).then(
      () => {
        if (animations.current !== current) return;
        row.hidden = collapsed;
        setClosed(collapsed);
        for (const animation of current) animation.cancel();
        animations.current = [];
      },
      () => {},
    );
  }, [ref, collapsed, enabled, motion]);
  useBrowserLayoutEffect(
    () => () => {
      for (const animation of animations.current) animation.cancel();
      animations.current = [];
    },
    [],
  );
  return collapsed && closed;
}
