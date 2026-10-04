import type { TreeSelectOption } from '@sudden3/leaf-ui';
export const treeOptions: readonly TreeSelectOption[] = [
  {
    value: 'design',
    label: 'Design',
    selectable: false,
    children: [
      { value: 'visual', label: 'Visual design' },
      { value: 'product', label: 'Product design' },
      { value: 'archive', label: 'Archived team', disabled: true },
    ],
  },
  {
    value: 'engineering',
    label: 'Engineering',
    selectable: false,
    children: [
      { value: 'web', label: 'Frontend' },
      { value: 'server', label: 'Backend' },
    ],
  },
];
