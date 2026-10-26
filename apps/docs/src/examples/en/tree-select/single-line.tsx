import { TreeSelect, type TreeSelectOption } from '@ifhover/leaf-ui';

const treeOptions: readonly TreeSelectOption[] = [
  {
    value: 'design',
    label: 'Design team',
    selectable: false,
    children: [
      { value: 'visual', label: 'Visual design team with a longer name' },
      { value: 'product', label: 'Product design' },
      { value: 'archive', label: 'Archived team', disabled: true },
    ],
  },
  {
    value: 'engineering',
    label: 'Engineering team',
    selectable: false,
    children: [
      { value: 'web', label: 'Frontend development' },
      { value: 'server', label: 'Backend development' },
    ],
  },
];

export function SingleLine() {
  return (
    <TreeSelect
      aria-label="Single-line team tags"
      treeCheckable
      tagWrap={false}
      options={treeOptions}
      defaultValue={['visual', 'product', 'web', 'server']}
      treeDefaultExpandedKeys={['design']}
    />
  );
}
