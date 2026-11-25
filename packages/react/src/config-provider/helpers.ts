import { useEffect, useState } from 'react';
import { parseColor, type RgbaColor, relativeLuminance } from '../shared/color';
import { useLeafConfig } from './context';
export function useSystemAppearance(initial: 'light' | 'dark' = 'light') {
  const [appearance, setAppearance] = useState(initial);
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)');
    const update = () => setAppearance(media.matches ? 'dark' : 'light');
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return appearance;
}
export function colorContrast(foreground: string, background: string, canvas = '#ffffff') {
  const fg = parseColor(foreground),
    bg = parseColor(background);
  if (!fg || !bg) return null;
  const base = parseColor(canvas);
  if (base?.a !== 1) return null;
  const composite = (front: RgbaColor, back: RgbaColor): RgbaColor => ({
    r: front.r * front.a + back.r * (1 - front.a),
    g: front.g * front.a + back.g * (1 - front.a),
    b: front.b * front.a + back.b * (1 - front.a),
    a: 1,
  });
  const backgroundColor = composite(bg, base);
  const a = relativeLuminance(composite(fg, backgroundColor)),
    b = relativeLuminance(backgroundColor);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
export function useBreakpoint(
  initial: Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', boolean>> = {},
) {
  const { theme } = useLeafConfig();
  const [matches, setMatches] = useState(initial);
  useEffect(() => {
    const sizes = { xs: 0, sm: 576, md: 768, lg: 992, xl: 1200, ...theme.breakpoints };
    const queries = Object.entries(sizes).map(
      ([key, width]) => [key, matchMedia(`(min-width: ${width}px)`)] as const,
    );
    const update = () =>
      setMatches(Object.fromEntries(queries.map(([key, query]) => [key, query.matches])));
    for (const [, query] of queries) query.addEventListener('change', update);
    update();
    return () => {
      for (const [, query] of queries) query.removeEventListener('change', update);
    };
  }, [theme.breakpoints]);
  return matches;
}
