import type { CascaderOption } from '@sudden3/leaf-ui';

export const regions: CascaderOption[] = [
  {
    value: 'zhejiang',
    label: 'Zhejiang',
    children: [
      {
        value: 'hangzhou',
        label: 'Hangzhou',
        children: [
          { value: 'xihu', label: 'Xihu' },
          { value: 'yuhang', label: 'Yuhang' },
        ],
      },
      { value: 'ningbo', label: 'Ningbo', children: [{ value: 'haishu', label: 'Haishu' }] },
    ],
  },
  {
    value: 'jiangsu',
    label: 'Jiangsu',
    children: [
      { value: 'nanjing', label: 'Nanjing', children: [{ value: 'gulou', label: 'Gulou' }] },
      { value: 'suzhou', label: 'Suzhou', children: [{ value: 'gusu', label: 'Gusu' }] },
    ],
  },
  { value: 'archived', label: 'Archived region', disabled: true },
];
