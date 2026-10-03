import type { CascaderOption } from '@sudden3/leaf-ui';

export const regions: CascaderOption[] = [
  {
    value: 'zhejiang',
    label: '浙江',
    children: [
      {
        value: 'hangzhou',
        label: '杭州',
        children: [
          { value: 'xihu', label: '西湖区' },
          { value: 'yuhang', label: '余杭区' },
        ],
      },
      { value: 'ningbo', label: '宁波', children: [{ value: 'haishu', label: '海曙区' }] },
    ],
  },
  {
    value: 'jiangsu',
    label: '江苏',
    children: [
      { value: 'nanjing', label: '南京', children: [{ value: 'gulou', label: '鼓楼区' }] },
      { value: 'suzhou', label: '苏州', children: [{ value: 'gusu', label: '姑苏区' }] },
    ],
  },
  { value: 'archived', label: '归档地区', disabled: true },
];
