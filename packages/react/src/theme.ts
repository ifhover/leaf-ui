import type { CSSProperties } from 'react';

/** Shared CSS variables; configure component themes through ConfigProvider. */
export type LeafThemeStyle = CSSProperties & {
  [key: `--leaf-${string}`]: string | number | undefined;
};

/** Common settings. Other sizes and interaction colors are derived automatically. */
export interface LeafTheme {
  primaryColor?: string;
  borderRadius?: number | string;
  controlHeight?: number | string;
  fontSize?: number | string;
  fontFamily?: string;
  appearance?: 'light' | 'dark';
  motion?: boolean;
  tokens?: LeafThemeTokens;
}

/** Optional overrides for applications with more specific design requirements. */
export interface LeafThemeTokens {
  onPrimaryColor?: string;
  dangerColor?: string;
  onDangerColor?: string;
  successColor?: string;
  warningColor?: string;
  infoColor?: string;
  textColor?: string;
  mutedTextColor?: string;
  surfaceColor?: string;
  mutedSurfaceColor?: string;
  borderColor?: string;
  borderRadiusSm?: number | string;
  borderRadiusLg?: number | string;
  controlHeightSm?: number | string;
  controlHeightLg?: number | string;
  fontSizeSm?: number | string;
  fontSizeLg?: number | string;
  fontWeight?: number;
  motionDuration?: number | string;
  motionEasing?: string;
  popupZIndex?: number;
  modalZIndex?: number;
  messageZIndex?: number;
  buttonBorderRadius?: number | string;
  buttonHeight?: number | string;
  choiceBorderRadius?: number | string;
  focusColor?: string;
  primaryHoverColor?: string;
  primaryActiveColor?: string;
  primarySoftColor?: string;
  primarySoftHoverColor?: string;
  primarySoftActiveColor?: string;
  primaryBorderColor?: string;
  dangerHoverColor?: string;
  dangerActiveColor?: string;
}

const defined = <T extends object>(value?: T) =>
  Object.fromEntries(Object.entries(value ?? {}).filter(([, item]) => item !== undefined)) as T;

export function mergeLeafTheme(parent: LeafTheme, theme?: LeafTheme): LeafTheme {
  return {
    ...parent,
    ...defined(theme),
    ...(parent.tokens || theme?.tokens
      ? { tokens: { ...parent.tokens, ...defined(theme?.tokens) } }
      : {}),
  };
}

const tokenVariables = {
  onPrimaryColor: 'color-on-primary',
  dangerColor: 'color-danger',
  onDangerColor: 'color-on-danger',
  successColor: 'color-success',
  warningColor: 'color-warning',
  infoColor: 'color-info',
  textColor: 'color-text',
  mutedTextColor: 'color-text-muted',
  surfaceColor: 'color-surface',
  mutedSurfaceColor: 'color-surface-muted',
  borderColor: 'color-border',
  borderRadiusSm: 'radius-sm',
  borderRadiusLg: 'radius-lg',
  controlHeightSm: 'control-height-sm',
  controlHeightLg: 'control-height-lg',
  fontSizeSm: 'font-size-sm',
  fontSizeLg: 'font-size-lg',
  fontWeight: 'font-weight',
  motionDuration: 'motion-duration',
  motionEasing: 'motion-easing',
  popupZIndex: 'z-index-popup',
  modalZIndex: 'z-index-modal',
  messageZIndex: 'z-index-message',
  buttonBorderRadius: 'button-radius',
  buttonHeight: 'button-height',
  choiceBorderRadius: 'choice-radius',
  focusColor: 'color-focus',
  primaryHoverColor: 'color-primary-hover',
  primaryActiveColor: 'color-primary-active',
  primarySoftColor: 'color-primary-soft',
  primarySoftHoverColor: 'color-primary-soft-hover',
  primarySoftActiveColor: 'color-primary-soft-active',
  primaryBorderColor: 'color-primary-border',
  dangerHoverColor: 'color-danger-hover',
  dangerActiveColor: 'color-danger-active',
} satisfies Record<keyof LeafThemeTokens, string>;

const length = (value: number | string) => (typeof value === 'number' ? `${value}px` : value);

/** Pure, deterministic output can be rendered in the server's initial HTML. */
export function leafThemeVariables(theme: LeafTheme): LeafThemeStyle {
  const variables: LeafThemeStyle = {};
  if (theme.primaryColor !== undefined) {
    variables['--leaf-color-primary'] = theme.primaryColor;
    variables['--leaf-color-on-primary'] = '#ffffff';
  }
  if (theme.borderRadius !== undefined) {
    variables['--leaf-radius'] = length(theme.borderRadius);
    variables['--leaf-radius-sm'] = 'calc(var(--leaf-radius) * 0.6)';
    variables['--leaf-radius-lg'] = 'calc(var(--leaf-radius) * 1.6)';
    variables['--leaf-choice-radius'] = 'calc(var(--leaf-radius) * 0.5)';
  }
  if (theme.controlHeight !== undefined) {
    variables['--leaf-control-height'] = length(theme.controlHeight);
    variables['--leaf-control-height-sm'] = 'max(1px, calc(var(--leaf-control-height) - 6px))';
    variables['--leaf-control-height-lg'] = 'calc(var(--leaf-control-height) + 6px)';
  }
  if (theme.fontSize !== undefined) {
    variables['--leaf-font-size'] = length(theme.fontSize);
    variables['--leaf-font-size-sm'] = 'max(1px, calc(var(--leaf-font-size) - 2px))';
    variables['--leaf-font-size-lg'] = 'calc(var(--leaf-font-size) + 2px)';
  }
  if (theme.fontFamily !== undefined) variables['--leaf-font-family'] = theme.fontFamily;
  for (const key of Object.keys(tokenVariables) as (keyof LeafThemeTokens)[]) {
    const value = theme.tokens?.[key];
    if (value === undefined) continue;
    const variable = tokenVariables[key];
    variables[`--leaf-${variable}`] =
      typeof value !== 'number'
        ? value
        : key === 'motionDuration'
          ? `${value}ms`
          : variable.includes('radius') ||
              variable.includes('height') ||
              variable.includes('font-size')
            ? length(value)
            : value;
  }
  if (theme.motion !== undefined) {
    variables['--leaf-motion-play-state'] = theme.motion ? 'running' : 'paused';
    if (!theme.motion) variables['--leaf-motion-duration'] = '0ms';
    else if (theme.tokens?.motionDuration === undefined)
      variables['--leaf-motion-duration'] = '160ms';
  }
  return variables;
}
