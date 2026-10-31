import { componentCatalog } from './component-catalog';

const colors: Record<string, string> = {
  '#1e964f': 'var(--leaf-color-primary)',
  '#eaf4ed': 'var(--leaf-color-primary-soft)',
  '#e8f4ec': 'var(--leaf-color-primary-soft)',
  '#edf6ee': 'var(--leaf-color-primary-soft)',
  '#eff7f1': 'var(--leaf-color-primary-soft)',
  '#eff5f0': 'var(--leaf-color-primary-soft)',
  '#e9f3ed': 'var(--leaf-color-primary-soft)',
  '#e4f1e8': 'var(--leaf-color-primary-soft)',
  '#bddcc7': 'var(--leaf-color-primary-border)',
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
  '#e7ece8': 'var(--leaf-color-surface-muted)',
  '#e9efeb': 'var(--leaf-color-surface-muted)',
  '#edf1ee': 'var(--leaf-color-surface-muted)',
  '#f4f7f5': 'var(--leaf-color-surface-muted)',
  '#f5f7f6': 'var(--leaf-color-surface-muted)',
  '#f0f4f1': 'var(--leaf-color-surface-muted)',
  '#dd3f2e': 'var(--leaf-color-danger)',
  '#ff4d4f': 'var(--leaf-color-danger)',
  '#b33637': 'var(--leaf-color-danger-ink)',
  '#e0b1ab': 'var(--leaf-color-danger-border)',
  '#fceeec': 'var(--leaf-color-danger-soft)',
  '#1677ff': 'var(--leaf-color-info)',
  '#edf5ff': 'var(--leaf-color-info-soft)',
  '#eff5ff': 'var(--leaf-color-info-soft)',
  '#e8effb': 'var(--leaf-color-info-soft)',
  '#d38b11': 'var(--leaf-color-warning)',
  '#faad14': 'var(--leaf-color-warning)',
  '#ffc53d': 'var(--leaf-color-warning)',
  '#8d671c': 'var(--leaf-color-warning-ink)',
  '#fff6e9': 'var(--leaf-color-warning-soft)',
  '#f6eedb': 'var(--leaf-color-warning-soft)',
  '#f4effb': 'color-mix(in srgb, #7654c6 8%, var(--leaf-color-surface))',
  '#f1edf9': 'color-mix(in srgb, #7654c6 8%, var(--leaf-color-surface))',
  '#d9cdee': 'color-mix(in srgb, #7654c6 25%, var(--leaf-color-surface))',
  '#eaf5f5': 'color-mix(in srgb, #087f8c 8%, var(--leaf-color-surface))',
  '#bfdfe1': 'color-mix(in srgb, #087f8c 25%, var(--leaf-color-surface))',
};

// Decorative green illustration shades follow the primary color, too.
const shades: Record<string, string> = {
  '#387b56': 'var(--leaf-color-primary-dark-1)',
  '#79b68c': 'var(--leaf-color-primary-light-3)',
  '#81b58f': 'var(--leaf-color-primary-light-3)',
  '#8ebfa3': 'var(--leaf-color-primary-light-3)',
  '#8aa693': 'var(--leaf-color-primary-light-3)',
  '#91ae99': 'var(--leaf-color-primary-light-3)',
  '#9cab9f': 'var(--leaf-color-primary-light-7)',
  '#a3c7ae': 'var(--leaf-color-primary-light-7)',
  '#bdcdbf': 'var(--leaf-color-primary-light-7)',
  '#becac2': 'var(--leaf-color-primary-light-7)',
  '#c1d2c5': 'var(--leaf-color-primary-light-7)',
  '#c5dfce': 'var(--leaf-color-primary-light-7)',
  '#d7ebe0': 'var(--leaf-color-primary-light-9)',
  '#d9eddf': 'var(--leaf-color-primary-light-9)',
  '#dae3dc': 'var(--leaf-color-primary-light-9)',
  '#e1e9e3': 'var(--leaf-color-primary-light-9)',
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
          if (element.startsWith('<text ')) {
            // Tooltip uses the inverse text/surface pair, not the solid-action foreground.
            const foreground =
              slug === 'tooltip' ? 'var(--leaf-color-surface)' : 'var(--leaf-color-on-primary)';
            return `${attr}="${foreground}"`;
          }
          return paint;
        }
        // Success glyphs carry meaning independently of the selected site color.
        if (color === '#1e964f' && attr === 'stroke' && (slug === 'alert' || slug === 'result')) {
          return `${attr}="var(--leaf-color-success)"`;
        }
        const replacement = colors[color] ?? shades[color];
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
