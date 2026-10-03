import { type ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { LeafThemeStyle } from '../theme';

/** Transfer inherited variables into a portal without moving the React context. */
export function ScopedPortal({ children }: { children: ReactNode }) {
  const anchor = useRef<HTMLSpanElement>(null);
  const [style, setStyle] = useState<LeafThemeStyle>();
  useEffect(() => {
    const node = anchor.current;
    if (!node) return;
    const sync = () => {
      const computed = getComputedStyle(node);
      const next: LeafThemeStyle = { colorScheme: computed.colorScheme };
      for (let i = 0; i < computed.length; i++) {
        const key = computed.item(i);
        if (key.startsWith('--leaf-'))
          next[key as `--leaf-${string}`] = computed.getPropertyValue(key);
      }
      setStyle(next);
    };
    sync();
    const observer = new MutationObserver(sync);
    let parent: HTMLElement | null = node;
    while (parent) {
      observer.observe(parent, {
        attributes: true,
        attributeFilter: ['style', 'class', 'data-leaf-theme'],
      });
      parent = parent.parentElement;
    }
    return () => observer.disconnect();
  }, []);
  return (
    <>
      <span ref={anchor} hidden />
      {style &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="leaf-portal-scope" style={style}>
            {children}
          </div>,
          document.body,
        )}
    </>
  );
}
