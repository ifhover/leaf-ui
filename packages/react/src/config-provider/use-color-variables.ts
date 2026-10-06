import { type RefObject, useEffect, useState } from 'react';
import { deriveColors } from '../colors';
import { composedParent } from '../shared/dom';
import { type LeafTheme, type LeafThemeStyle, leafThemeColors } from '../theme';

/** Resolve CSS variable colors after hydration; concrete theme colors are already SSR safe. */
export function useColorVariables(root: RefObject<HTMLDivElement | null>, theme: LeafTheme) {
  const [resolved, setResolved] = useState<LeafThemeStyle>({});
  useEffect(() => {
    const node = root.current;
    const entries = Object.entries(leafThemeColors(theme));
    if (!node || !entries.some(([, value]) => String(value).includes('var('))) {
      setResolved((previous) => (Object.keys(previous).length ? {} : previous));
      return;
    }
    const sync = () => {
      const probe = document.createElement('span');
      probe.hidden = true;
      node.append(probe);
      const overrides: Record<string, string> = {};
      for (const [key, value] of entries) {
        probe.style.color = '';
        probe.style.color = String(value);
        if (probe.style.color) overrides[key] = getComputedStyle(probe).color;
      }
      probe.remove();
      const mode =
        theme.appearance ??
        (getComputedStyle(node).colorScheme.includes('dark') ? 'dark' : 'light');
      const next = deriveColors(mode, overrides);
      setResolved((previous) =>
        JSON.stringify(previous) === JSON.stringify(next) ? previous : next,
      );
    };
    sync();
    const observer = new MutationObserver(sync);
    let ancestor: HTMLElement | null = node;
    while (ancestor) {
      observer.observe(ancestor, {
        attributes: true,
        attributeFilter: ['style', 'class', 'data-leaf-theme'],
      });
      ancestor = composedParent(ancestor);
    }
    return () => observer.disconnect();
  }, [root, theme]);
  return resolved;
}
