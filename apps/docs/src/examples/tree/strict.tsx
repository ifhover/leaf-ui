import { Tree, type TreeNode } from '@ifhover/leaf-ui';

const treeData: readonly TreeNode[] = [
  {
    key: 'design',
    title: '设计资源',
    children: [
      { key: 'components', title: '组件规范' },
      { key: 'colors', title: '品牌颜色' },
    ],
  },
  {
    key: 'engineering',
    title: '研发项目',
    children: [{ key: 'web', title: '网站' }],
  },
];

export function TreeStrict() {
  return <Tree data={treeData} checkable checkStrictly selectable={false} defaultExpandAll />;
}
