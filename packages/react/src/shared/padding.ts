import type { ContainerPadding, PaddingValue, SectionPadding } from './types';

/** 按 CSS padding 规则拆出上、右、下、左单边长度，忽略 calc()/var() 内部空格。 */
export function paddingSides(value: string) {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index <= value.length; index++) {
    const character = value[index];
    if (character === '(') depth++;
    else if (character === ')') depth--;
    if (index === value.length || (depth === 0 && /\s/.test(character ?? ''))) {
      const part = value.slice(start, index).trim();
      if (part) parts.push(part);
      start = index + 1;
    }
  }
  if (!parts.length || parts.length > 4) return [];
  const [top, right = top, bottom = top, left = right] = parts;
  return [top, right, bottom, left];
}

function resolvePaddingLength(value: PaddingValue): string {
  if (value === 'none') return '0px';
  if (typeof value === 'number') return `${Math.max(0, value)}px`;
  return value;
}

function isSectionPadding(value?: ContainerPadding): value is SectionPadding {
  return typeof value === 'object' && value !== null;
}

/** 将容器或分区内边距输入转换为 CSS 自定义属性，供 Card / Modal / Drawer 独立生效。 */
export function resolvePaddingVars(
  component: 'card' | 'modal' | 'drawer',
  padding?: ContainerPadding,
): Record<string, string> | undefined {
  if (padding === undefined) return undefined;
  const vars: Record<string, string> = {};
  let headerInsetSource: PaddingValue | undefined;
  if (isSectionPadding(padding)) {
    if (padding.header !== undefined) {
      vars[`--leaf-${component}-header-padding`] = resolvePaddingLength(padding.header);
      headerInsetSource = padding.header;
    }
    if (padding.body !== undefined)
      vars[`--leaf-${component}-body-padding`] = resolvePaddingLength(padding.body);
    if (padding.footer !== undefined)
      vars[`--leaf-${component}-footer-padding`] = resolvePaddingLength(padding.footer);
  } else {
    const resolved = resolvePaddingLength(padding);
    vars[`--leaf-${component}-header-padding`] = resolved;
    vars[`--leaf-${component}-body-padding`] = resolved;
    vars[`--leaf-${component}-footer-padding`] = resolved;
    headerInsetSource = padding;
  }
  if ((component === 'modal' || component === 'drawer') && headerInsetSource !== undefined) {
    const [top, right, bottom, left] = paddingSides(resolvePaddingLength(headerInsetSource));
    if (top && right && bottom && left) {
      if (!isSectionPadding(padding)) {
        vars[`--leaf-${component}-shell-padding-top`] = top;
        vars[`--leaf-${component}-shell-padding-right`] = right;
        vars[`--leaf-${component}-shell-padding-bottom`] = bottom;
        vars[`--leaf-${component}-shell-padding-left`] = left;
      }
      vars[`--leaf-${component}-close-inset-top`] = top;
      vars[`--leaf-${component}-close-inset-right`] = right;
      vars[`--leaf-${component}-close-inset-left`] = left;
    }
  }
  return Object.keys(vars).length > 0 ? vars : undefined;
}

/** 区分浮层整体内边距与仅针对单个分区的覆盖标记，避免头部与内容区重复叠加内边距。 */
export function resolveDialogPaddingFlags(padding?: ContainerPadding) {
  if (!isSectionPadding(padding)) return undefined;
  return {
    'data-header-padding': padding.header !== undefined ? '' : undefined,
    'data-body-padding': padding.body !== undefined ? '' : undefined,
    'data-footer-padding': padding.footer !== undefined ? '' : undefined,
  };
}
