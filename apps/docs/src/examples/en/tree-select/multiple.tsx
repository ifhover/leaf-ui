import { TreeSelect, type TreeSelectOption } from '@ifhover/leaf-ui';

const treeOptions: readonly TreeSelectOption[] = [
  {
    value: 'design',
    label: 'Design team',
    selectable: false,
    children: [
      { value: 'visual', label: 'Visual design' },
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

export function TreeSelectMultiple() {
  return (
    <TreeSelect
      aria-label="Choose teams"
      options={treeOptions}
      multiple
      defaultValue={['visual']}
      defaultExpandAll
      placeholder="Select teams"
    />
  );
}
