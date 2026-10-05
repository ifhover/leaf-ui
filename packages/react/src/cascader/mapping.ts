import type { CascaderOption } from './cascader';

export interface CascaderFieldNames {
  value?: string;
  label?: string;
  children?: string;
  disabled?: string;
  isLeaf?: string;
}
/** Adapt business records once, before passing them to Cascader. */
export function mapCascaderOptions(
  records: readonly object[],
  fields: CascaderFieldNames = {},
): CascaderOption[] {
  const names = {
    value: 'value',
    label: 'label',
    children: 'children',
    disabled: 'disabled',
    isLeaf: 'isLeaf',
    ...fields,
  };
  return records.map((record) => {
    const value = Reflect.get(record, names.value);
    const label = Reflect.get(record, names.label);
    const children = Reflect.get(record, names.children);
    return {
      value: String(value ?? ''),
      label: label == null ? String(value ?? '') : label,
      disabled: !!Reflect.get(record, names.disabled),
      isLeaf: Reflect.get(record, names.isLeaf),
      children: Array.isArray(children)
        ? mapCascaderOptions(
            children.filter((child) => child && typeof child === 'object'),
            fields,
          )
        : undefined,
    };
  });
}
