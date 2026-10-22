import { Tree, type TreeNode } from '@ifhover/leaf-ui';

const treeData: readonly TreeNode[] = [
  {
    key: 'design',
    title: 'Design resources',
    children: [
      { key: 'components', title: 'Component guidelines' },
      { key: 'colors', title: 'Brand colors' },
    ],
  },
  {
    key: 'engineering',
    title: 'Engineering',
    children: [{ key: 'web', title: 'Website' }],
  },
];

export function TreeStrict() {
  return <Tree data={treeData} checkable checkStrictly selectable={false} defaultExpandAll />;
}
