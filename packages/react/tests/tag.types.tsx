import { CheckableTag, type LeafComponentDefaults, Tag, TagGroup } from '../src';
import { Tag as SubpathTag } from '../src/tag';

export function tagTypeContracts() {
  const tag = <Tag>Default theme</Tag>;
  const subpathTag = <SubpathTag color="primary">Primary</SubpathTag>;
  const checkable = <CheckableTag defaultChecked>Selected</CheckableTag>;
  const group = <TagGroup options={[{ value: 'leaf', label: 'Leaf' }]} />;
  const defaults: LeafComponentDefaults = {
    Tag: { color: 'primary' },
    CheckableTag: { defaultChecked: true },
    TagGroup: { size: 'sm' },
  };
  // @ts-expect-error Font weight is fixed and no longer exposed.
  const invalidTag = <Tag bold={false} />;
  // @ts-expect-error Regional defaults use the same public contract.
  const invalidDefaults: LeafComponentDefaults = { TagGroup: { bold: false } };
  return { tag, subpathTag, checkable, group, defaults, invalidTag, invalidDefaults };
}
