import type { TreeSelectOption } from '@sudden3/leaf-ui';
export const treeOptions: readonly TreeSelectOption[] = [
  {
    value: 'design',
    label: '设计团队',
    selectable: false,
    children: [
      { value: 'visual', label: '视觉设计' },
      { value: 'product', label: '产品设计' },
      { value: 'archive', label: '归档团队', disabled: true },
    ],
  },
  {
    value: 'engineering',
    label: '研发团队',
    selectable: false,
    children: [
      { value: 'web', label: '前端开发' },
      { value: 'server', label: '服务端开发' },
    ],
  },
];
