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
    if (
      !node ||
      !entries.some(([, value]) =>
        /(?:var|color-mix|light-dark|oklch|oklab|lab|lch|color)\(/i.test(value),
      )
    ) {
      setResolved((previous) => (Object.keys(previous).length ? {} : previous));
      return;
    }
    const sync = () => {
      const probe = document.createElement('span');
      probe.hidden = true;
      node.append(probe);
      const overrides: Record<string, string> = {};
      let canvas: CanvasRenderingContext2D | null | undefined;
      for (const [key, value] of entries) {
        probe.style.color = '';
        probe.style.color = String(value);
        if (probe.style.color) {
          const color = getComputedStyle(probe).color;
          overrides[key] = color;
          // CSS Color 4 computed values are not understood by TinyColor. Resolve
          // them to sRGB for contrast and interaction calculations in the browser.
          if (
            /^(?:color|oklch|oklab|lab|lch)\(/i.test(color) &&
            globalThis.CSS?.supports?.('color', color)
          ) {
            canvas ??= document
              .createElement('canvas')
              .getContext('2d', { willReadFrequently: true });
            if (canvas) {
              canvas.clearRect(0, 0, 1, 1);
              canvas.fillStyle = color;
              canvas.fillRect(0, 0, 1, 1);
              const [r, g, b, a = 255] = canvas.getImageData(0, 0, 1, 1).data;
              overrides[key] = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
            }
          }
        }
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
