import type { TreeNode } from '@sudden3/leaf-ui';
export const treeData: readonly TreeNode[] = [
  {
    key: 'design',
    title: 'Design resources',
    children: [
      { key: 'components', title: 'Component guidelines' },
      { key: 'colors', title: 'Brand colors' },
      { key: 'archive', title: 'Archived resources (disabled)', disabled: true },
    ],
  },
  {
    key: 'engineering',
    title: 'Engineering',
    children: [
      { key: 'web', title: 'Website' },
      { key: 'mobile', title: 'Mobile app' },
    ],
  },
];
