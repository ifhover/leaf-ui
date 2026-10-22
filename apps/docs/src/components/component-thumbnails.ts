import { componentCatalog } from './component-catalog';

const colors: Record<string, string> = {
  '#1e964f': 'var(--leaf-color-primary)',
  '#eaf4ed': 'var(--leaf-color-primary-surface-9)',
  '#e8f4ec': 'var(--leaf-color-primary-surface-9)',
  '#edf6ee': 'var(--leaf-color-primary-surface-9)',
  '#eff7f1': 'var(--leaf-color-primary-surface-9)',
  '#eff5f0': 'var(--leaf-color-primary-surface-9)',
  '#e9f3ed': 'var(--leaf-color-primary-surface-9)',
  '#e4f1e8': 'var(--leaf-color-primary-surface-9)',
  '#bddcc7': 'var(--leaf-color-primary-border-30)',
  '#202024': 'var(--leaf-color-text)',
  '#24372c': 'var(--leaf-color-text)',
  '#68686f': 'var(--leaf-color-text-muted)',
  '#64796c': 'var(--leaf-color-text-muted)',
  '#718078': 'var(--leaf-color-text-muted)',
  '#708275': 'var(--leaf-color-text-muted)',
  '#7c8e81': 'var(--leaf-color-text-muted)',
  '#e5e5e8': 'var(--leaf-color-border)',
  '#e2ebe5': 'var(--leaf-color-border)',
  '#eeeeef': 'var(--leaf-color-divider)',
  '#eeeef0': 'var(--leaf-color-divider)',
  '#f6f6f7': 'var(--leaf-color-surface-muted)',
  '#fafafb': 'var(--leaf-color-surface-muted)',
  '#e7ece8': 'var(--leaf-color-border-surface-35)',
  '#e9efeb': 'var(--leaf-color-border-surface-35)',
  '#edf1ee': 'var(--leaf-color-border-surface-35)',
  '#f4f7f5': 'var(--leaf-color-surface-muted)',
  '#f5f7f6': 'var(--leaf-color-surface-muted)',
  '#f0f4f1': 'var(--leaf-color-surface-muted)',
  '#dd3f2e': 'var(--leaf-color-danger)',
  '#e0b1ab': 'var(--leaf-color-danger-border-30)',
  '#fceeec': 'var(--leaf-color-danger-surface-9)',
  '#1677ff': 'var(--leaf-color-info)',
  '#edf5ff': 'var(--leaf-color-info-surface-9)',
  '#eff5ff': 'var(--leaf-color-info-surface-9)',
  '#e8effb': 'var(--leaf-color-info-surface-9)',
  '#d38b11': 'var(--leaf-color-warning)',
  '#ffc53d': 'var(--leaf-color-warning)',
  '#8d671c': 'var(--leaf-color-warning-text-80)',
  '#fff6e9': 'var(--leaf-color-warning-surface-9)',
  '#f6eedb': 'var(--leaf-color-warning-surface-9)',
  '#f4effb': 'color-mix(in srgb, #7654c6 8%, var(--leaf-color-surface))',
  '#f1edf9': 'color-mix(in srgb, #7654c6 8%, var(--leaf-color-surface))',
  '#d9cdee': 'color-mix(in srgb, #7654c6 25%, var(--leaf-color-surface))',
  '#eaf5f5': 'color-mix(in srgb, #087f8c 8%, var(--leaf-color-surface))',
  '#bfdfe1': 'color-mix(in srgb, #087f8c 25%, var(--leaf-color-surface))',
};

// Decorative green illustration shades follow the primary color, too.
const shades: Record<string, number> = {
  '#387b56': 85,
  '#79b68c': 60,
  '#81b58f': 60,
  '#8ebfa3': 50,
  '#8aa693': 50,
  '#91ae99': 45,
  '#9cab9f': 40,
  '#a3c7ae': 35,
  '#bdcdbf': 25,
  '#becac2': 25,
  '#c1d2c5': 25,
  '#c5dfce': 20,
  '#d7ebe0': 15,
  '#d9eddf': 15,
  '#dae3dc': 15,
  '#e1e9e3': 10,
};

function prepareThumbnail(source: string, slug: string) {
  return source
    .replace(/\bid="([^"]+)"/g, (_, id: string) => `id="leaf-preview-${slug}-${id}"`)
    .replace(/url\(#([^)]+)\)/g, (_, id: string) => `url(#leaf-preview-${slug}-${id})`)
    .replace(/<[^>]+>/g, (element) =>
      element.replace(/\b(fill|stroke|stop-color)="(#[\da-f]+|white)"/gi, (paint, attr, value) => {
        const color = value.toLowerCase();
        // White labels/checkmarks stay distinct from theme-aware panel surfaces.
        if (color === '#fff' || color === '#ffffff' || color === 'white') {
          if (element.startsWith('<rect ')) return `${attr}="var(--leaf-color-surface)"`;
          if (element.startsWith('<text ')) return `${attr}="var(--leaf-color-on-primary)"`;
          return paint;
        }
        // Success glyphs carry meaning independently of the selected site color.
        if (color === '#1e964f' && attr === 'stroke' && (slug === 'alert' || slug === 'result')) {
          return `${attr}="var(--leaf-color-success)"`;
        }
        const shade = shades[color];
        const replacement =
          colors[color] ??
          (shade === undefined
            ? undefined
            : `color-mix(in srgb, var(--leaf-color-primary) ${shade}%, var(--leaf-color-surface))`);
        return replacement ? `${attr}="${replacement}"` : paint;
      }),
    );
}

// Rsbuild bundles these trusted local SVGs as text; no client fetch or component instances.
export const componentThumbnails: Readonly<Record<string, string>> = Object.fromEntries(
  componentCatalog.map(([, , slug]) => [
    slug,
    prepareThumbnail(require(`../../docs/public/components/${slug}.svg?raw`), slug),
  ]),
);
