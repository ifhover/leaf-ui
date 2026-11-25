import type { LeafThemeStyle } from '../theme';
import { composedParent } from './dom';

/** 比较两份内联主题变量对象是否键值完全一致，用于避免 Portal 无意义重渲染。 */
export function shallowEqualThemeStyle(
  left: LeafThemeStyle | undefined,
  right: LeafThemeStyle | undefined,
): boolean {
  if (left === right) return true;
  if (!left || !right) return false;
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) return false;
  for (const key of leftKeys) {
    if (
      left[key as keyof LeafThemeStyle] !== right[key as keyof LeafThemeStyle] ||
      !Object.hasOwn(right, key)
    ) {
      return false;
    }
  }
  return true;
}

/** Snapshot effective theme values, including explicit resets, across a portal boundary. */
export function readThemeVariables(source: HTMLElement): LeafThemeStyle {
  const computed = getComputedStyle(source);
  const variables: LeafThemeStyle = {
    colorScheme: computed.colorScheme,
    direction: computed.direction as LeafThemeStyle['direction'],
  };
  const keys = new Set<string>();
  for (let index = 0; index < computed.length; index++) {
    const key = computed.item(index);
    if (key.startsWith('--leaf-')) keys.add(key);
  }
  // Engines can omit inherited or guaranteed-invalid custom properties from
  // enumeration. Provider resets are inline, so include the composed ancestry.
  let owner: HTMLElement | null = source;
  while (owner) {
    for (let index = 0; index < owner.style.length; index++) {
      const key = owner.style.item(index);
      if (key.startsWith('--leaf-')) keys.add(key);
    }
    owner = composedParent(owner);
  }
  for (const key of keys) {
    // Empty computed values include the guaranteed-invalid value produced by
    // `initial`. Writing '' would remove the inline declaration in React and
    // inherit the destination container's theme instead of retaining the reset.
    variables[key as `--leaf-${string}`] = computed.getPropertyValue(key) || 'initial';
  }
  return variables;
}
