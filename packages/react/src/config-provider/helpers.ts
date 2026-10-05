import { TinyColor } from '@ctrl/tinycolor';
import { useEffect, useState } from 'react';
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
  const fg = new TinyColor(foreground),
    bg = new TinyColor(background);
  if (!fg.isValid || !bg.isValid) return null;
  const base = new TinyColor(canvas);
  if (!base.isValid || base.getAlpha() !== 1) return null;
  const composite = (front: TinyColor, back: TinyColor) => {
    const a = front.toRgb(),
      b = back.toRgb();
    return new TinyColor({
      r: a.r * a.a + b.r * (1 - a.a),
      g: a.g * a.a + b.g * (1 - a.a),
      b: a.b * a.a + b.b * (1 - a.a),
    });
  };
  const backgroundColor = composite(bg, base);
  const luminance = (color: TinyColor) => {
    const { r, g, b } = color.toRgb();
    const values = [r, g, b].map((channel) => {
      const value = channel / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return (values[0] ?? 0) * 0.2126 + (values[1] ?? 0) * 0.7152 + (values[2] ?? 0) * 0.0722;
  };
  const a = luminance(composite(fg, backgroundColor)),
    b = luminance(backgroundColor);
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
