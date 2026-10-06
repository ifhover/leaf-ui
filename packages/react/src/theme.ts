import type { CSSProperties } from 'react';
import { deriveColors } from './colors';

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
  spacing?: number;
  lineHeight?: number;
  headingWeight?: number;
  elevation?: 'none' | 'soft' | 'medium';
  breakpoints?: Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', number>>;
  components?: Record<string, LeafComponentTokens>;
}
export interface LeafComponentTokens {
  borderRadius?: string | number;
  controlHeight?: string | number;
  padding?: string | number;
  gap?: string | number;
  fontSize?: string | number;
  color?: string;
  background?: string;
  shadow?: string;
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
  subtleTextColor?: string;
  surfaceColor?: string;
  mutedSurfaceColor?: string;
  raisedSurfaceColor?: string;
  borderColor?: string;
  borderHoverColor?: string;
  borderRadiusSm?: number | string;
  borderRadiusLg?: number | string;
  controlHeightSm?: number | string;
  controlHeightLg?: number | string;
  fontSizeSm?: number | string;
  fontSizeLg?: number | string;
  fontWeight?: number;
  motionDuration?: number | string;
  motionEasing?: string;
  motionSpring?: string;
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
  spacingSm?: number | string;
  spacingLg?: number | string;
  shadowSm?: string;
  shadowXs?: string;
  shadowMd?: string;
  shadowLg?: string;
  lineHeight?: number;
}

const defined = <T extends object>(value?: T) =>
  Object.fromEntries(Object.entries(value ?? {}).filter(([, item]) => item !== undefined)) as T;

export function mergeLeafTheme(parent: LeafTheme, theme?: LeafTheme): LeafTheme {
  return {
    ...parent,
    ...defined(theme),
    breakpoints: { ...parent.breakpoints, ...defined(theme?.breakpoints) },
    components: Object.fromEntries(
      [
        ...new Set([
          ...Object.keys(parent.components ?? {}),
          ...Object.keys(theme?.components ?? {}),
        ]),
      ].map((key) => [key, { ...parent.components?.[key], ...defined(theme?.components?.[key]) }]),
    ),
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
  subtleTextColor: 'color-text-subtle',
  surfaceColor: 'color-surface',
  mutedSurfaceColor: 'color-surface-muted',
  raisedSurfaceColor: 'color-surface-raised',
  borderColor: 'color-border',
  borderHoverColor: 'color-border-hover',
  borderRadiusSm: 'radius-sm',
  borderRadiusLg: 'radius-lg',
  controlHeightSm: 'control-height-sm',
  controlHeightLg: 'control-height-lg',
  fontSizeSm: 'font-size-sm',
  fontSizeLg: 'font-size-lg',
  fontWeight: 'font-weight',
  motionDuration: 'motion-duration',
  motionEasing: 'motion-easing',
  motionSpring: 'motion-spring',
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
  spacingSm: 'spacing-sm',
  spacingLg: 'spacing-lg',
  shadowSm: 'shadow-sm',
  shadowXs: 'shadow-xs',
  shadowMd: 'shadow-md',
  shadowLg: 'shadow-lg',
  lineHeight: 'line-height',
} satisfies Record<keyof LeafThemeTokens, string>;

const length = (value: number | string) => (typeof value === 'number' ? `${value}px` : value);

/** Explicit inputs, excluding the generated palette, for browser CSS-variable resolution. */
export function leafThemeColors(theme: LeafTheme): Record<string, string> {
  const colors: Record<string, string> = {};
  if (theme.primaryColor) colors.primary = theme.primaryColor;
  for (const key of Object.keys(tokenVariables) as (keyof LeafThemeTokens)[]) {
    const variable = tokenVariables[key];
    const value = theme.tokens?.[key];
    if (variable.startsWith('color-') && typeof value === 'string')
      colors[variable.slice(6)] = value;
  }
  return colors;
}

/** Pure, deterministic output can be rendered in the server's initial HTML. */
export function leafThemeVariables(theme: LeafTheme): LeafThemeStyle {
  const variables: LeafThemeStyle = {};
  if (theme.spacing !== undefined) {
    variables['--leaf-spacing'] = `${Math.max(0, theme.spacing)}px`;
    for (const [name, scale] of [
      ['xs', 0.5],
      ['sm', 1],
      ['md', 2],
      ['lg', 3],
      ['xl', 4],
    ] as const)
      variables[`--leaf-spacing-${name}`] = `calc(var(--leaf-spacing) * ${scale})`;
  }
  if (theme.lineHeight !== undefined) variables['--leaf-line-height'] = theme.lineHeight;
  if (theme.headingWeight !== undefined) variables['--leaf-heading-weight'] = theme.headingWeight;
  if (theme.elevation)
    for (const [name, blur, y] of [
      ['sm', 8, 2],
      ['md', 20, 6],
      ['lg', 48, 12],
    ] as const)
      variables[`--leaf-shadow-${name}`] =
        theme.elevation === 'none'
          ? 'none'
          : `0 ${y}px ${blur}px rgb(0 0 0 / ${theme.elevation === 'soft' ? '.08' : '.16'})`;
  for (const [name, value] of Object.entries(theme.breakpoints ?? {}))
    if (value !== undefined) variables[`--leaf-breakpoint-${name}`] = `${value}px`;
  const componentKeys = {
    borderRadius: 'radius',
    controlHeight: 'height',
    padding: 'padding',
    gap: 'gap',
    fontSize: 'font-size',
    color: 'color',
    background: 'background',
    shadow: 'shadow',
  } as const;
  for (const [component, tokens] of Object.entries(theme.components ?? {}))
    for (const [key, value] of Object.entries(tokens))
      if (value !== undefined && /^[a-z][a-z\d-]*$/i.test(component)) {
        const token = componentKeys[key as keyof typeof componentKeys];
        if (token)
          variables[
            `--leaf-component-${component.replace(/([a-z\d])([A-Z])/g, '$1-$2').toLowerCase()}-${token}`
          ] = typeof value === 'number' ? length(value) : value;
        if (key === 'controlHeight') {
          const name = component.replace(/([a-z\d])([A-Z])/g, '$1-$2').toLowerCase();
          variables[`--leaf-component-${name}-height-sm`] =
            `max(1px, calc(var(--leaf-component-${name}-height) - 6px))`;
          variables[`--leaf-component-${name}-height-lg`] =
            `calc(var(--leaf-component-${name}-height) + 6px)`;
        }
      }
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
              variable.includes('font-size') ||
              variable.includes('spacing')
            ? length(value)
            : value;
  }
  if (theme.motion !== undefined) {
    variables['--leaf-motion-play-state'] = theme.motion ? 'running' : 'paused';
    variables['--leaf-motion-animation'] = theme.motion ? 'initial' : 'none';
    if (!theme.motion) variables['--leaf-motion-duration'] = '0ms';
    else if (theme.tokens?.motionDuration === undefined)
      variables['--leaf-motion-duration'] = '200ms';
  }
  if (
    theme.appearance ||
    theme.primaryColor ||
    Object.keys(theme.tokens ?? {}).some((key) => key.endsWith('Color'))
  ) {
    return { ...deriveColors(theme.appearance ?? 'light', leafThemeColors(theme)), ...variables };
  }
  return variables;
}
