import type { LeafTheme, LeafThemeStyle } from './theme';

export type LeafDensity = 'comfortable' | 'compact';

/** Keep text readable; density reduces geometry and spacing, not font size. */
export const densityTokens = {
  comfortable: {
    'control-height': 34,
    spacing: 8,
    'density-form-gap': 16,
    'density-label-gap': 6,
    'density-row-padding': 12,
    'density-option-height': 30,
    'density-option-padding': 6,
    'density-field-padding': 10,
    'density-dialog-block': 20,
    'density-dialog-inline': 24,
    'density-dialog-gap': 16,
  },
  compact: {
    'control-height': 30,
    spacing: 6,
    'density-form-gap': 12,
    'density-label-gap': 4,
    'density-row-padding': 8,
    'density-option-height': 26,
    'density-option-padding': 4,
    'density-field-padding': 8,
    'density-dialog-block': 16,
    'density-dialog-inline': 20,
    'density-dialog-gap': 12,
  },
};

/** Seed virtual rows from the regional height; CSS lengths are measured after rendering. */
export function estimateControlHeight(theme: LeafTheme, density: LeafDensity): number {
  const height = theme.controlHeight;
  if (typeof height === 'number' && Number.isFinite(height)) return height;
  if (typeof height === 'string' && /^\d+(?:\.\d+)?(?:px)?$/.test(height.trim()))
    return Number.parseFloat(height);
  return densityTokens[density]['control-height'];
}

export function leafDensityVariables(density: LeafDensity): LeafThemeStyle {
  return Object.fromEntries(
    Object.entries(densityTokens[density]).map(([key, value]) => [
      `--leaf-${key}`,
      key === 'density-option-height'
        ? 'max(24px, calc(var(--leaf-control-height) - 4px))'
        : `${value}px`,
    ]),
  );
}
