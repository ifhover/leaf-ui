import { CheckableTag, type LeafComponentDefaults, Tag, TagGroup } from '../src';
import { Tag as SubpathTag } from '../src/tag';

export function tagTypeContracts() {
  const tag = <Tag bold={false}>Regular</Tag>;
  const subpathTag = <SubpathTag bold>Bold</SubpathTag>;
  const checkable = <CheckableTag bold={false}>Regular</CheckableTag>;
  const group = <TagGroup bold={false} options={[{ value: 'leaf', label: 'Leaf' }]} />;
  const defaults: LeafComponentDefaults = {
    Tag: { bold: false },
    CheckableTag: { bold: true },
    TagGroup: { bold: false },
  };
  // @ts-expect-error Font weight is controlled by a boolean.
  const invalidTag = <Tag bold="regular" />;
  // @ts-expect-error Regional defaults use the same boolean contract.
  const invalidDefaults: LeafComponentDefaults = { TagGroup: { bold: 400 } };
  return { tag, subpathTag, checkable, group, defaults, invalidTag, invalidDefaults };
}
