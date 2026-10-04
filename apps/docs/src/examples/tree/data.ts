import type { TreeNode } from '@sudden3/leaf-ui';
export const treeData: readonly TreeNode[] = [
  {
    key: 'design',
    title: '设计资源',
    children: [
      { key: 'components', title: '组件规范' },
      { key: 'colors', title: '品牌颜色' },
      { key: 'archive', title: '归档资源（不可选）', disabled: true },
    ],
  },
  {
    key: 'engineering',
    title: '研发项目',
    children: [
      { key: 'web', title: '网站' },
      { key: 'mobile', title: '移动应用' },
    ],
  },
];
