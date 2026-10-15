import { type ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLeafConfig } from '../config-provider/context';
import type { LeafThemeStyle } from '../theme';
import { composedParent } from './dom';

/** Transfer inherited variables into a portal without moving the React context. */
export function ScopedPortal({
  children,
  container,
}: {
  children: ReactNode;
  container?: Element | DocumentFragment | (() => Element | DocumentFragment);
}) {
  const config = useLeafConfig();
  const anchor = useRef<HTMLSpanElement>(null);
  const [style, setStyle] = useState<LeafThemeStyle>();
  useEffect(() => {
    const node = anchor.current;
    if (!node) return;
    const sync = () => {
      // Read the owning element; hidden markers can omit inherited custom
      // properties from computed-style enumeration in Firefox.
      const computed = getComputedStyle(composedParent(node) ?? node);
      const next: LeafThemeStyle = {
        colorScheme: computed.colorScheme,
        direction: computed.direction as LeafThemeStyle['direction'],
      };
      const keys = new Set<string>();
      for (let i = 0; i < computed.length; i++) {
        const key = computed.item(i);
        if (key.startsWith('--leaf-')) keys.add(key);
      }
      // Some engines do not enumerate every inherited custom property. Include
      // inline scope keys, then read their effective values at the source.
      let owner = composedParent(node);
      while (owner) {
        for (let i = 0; i < owner.style.length; i++) {
          const key = owner.style.item(i);
          if (key.startsWith('--leaf-')) keys.add(key);
        }
        owner = composedParent(owner);
      }
      for (const key of keys) {
        const value = computed.getPropertyValue(key);
        if (value.trim()) next[key as `--leaf-${string}`] = value;
      }
      setStyle(next);
    };
    sync();
    const observer = new MutationObserver(sync);
    let parent: HTMLElement | null = node;
    while (parent) {
      observer.observe(parent, {
        attributes: true,
        attributeFilter: [
          'style',
          'class',
          'data-leaf-theme',
          'data-leaf-density',
          'data-leaf-motion',
          'dir',
        ],
      });
      parent = composedParent(parent);
    }
    return () => observer.disconnect();
  }, []);
  return (
    <>
      <span ref={anchor} hidden />
      {style &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="leaf-portal-scope"
            lang={config.locale}
            dir={config.direction}
            data-leaf-density={config.density}
            data-leaf-motion={
              config.theme.motion === undefined ? undefined : config.theme.motion ? 'on' : 'off'
            }
            style={style}
          >
            {children}
          </div>,
          (typeof container === 'function' ? container() : container) ??
            config.getPopupContainer?.() ??
            document.body,
        )}
    </>
  );
}
