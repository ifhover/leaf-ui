import type { CascaderOption } from '@ifhover/leaf-ui';
import { Cascader } from '@ifhover/leaf-ui';

const regions = (english: boolean): CascaderOption[] => [
  {
    value: 'zhejiang',
    label: english ? 'Zhejiang' : '浙江',
    children: [
      { value: 'hangzhou', label: english ? 'Hangzhou' : '杭州' },
      { value: 'ningbo', label: english ? 'Ningbo' : '宁波' },
    ],
  },
  {
    value: 'jiangsu',
    label: english ? 'Jiangsu' : '江苏',
    children: [
      { value: 'nanjing', label: english ? 'Nanjing' : '南京' },
      { value: 'suzhou', label: english ? 'Suzhou' : '苏州' },
    ],
  },
];

export function Search({ english = false }) {
  return (
    <Cascader
      aria-label={english ? 'Region' : '地区'}
      options={regions(english)}
      placeholder={english ? 'Search a region' : '搜索地区'}
      showSearch
    />
  );
}
