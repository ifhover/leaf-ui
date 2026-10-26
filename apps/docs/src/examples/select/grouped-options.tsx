import { Select, type SelectOptionGroup } from '@ifhover/leaf-ui';

const options: SelectOptionGroup[] = [
  {
    label: '设计',
    options: [
      { value: 'ui', label: '界面设计' },
      { value: 'ux', label: '体验设计' },
    ],
  },
  {
    label: '工程',
    options: [{ value: 'web', label: '前端开发' }],
  },
];

export function GroupedOptions() {
  return <Select aria-label="专业方向" options={options} placeholder="选择专业方向" />;
}
