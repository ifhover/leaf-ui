import { Select } from '@ifhover/leaf-ui';

const options = [
  { value: 'design', label: '设计工作室' },
  { value: 'product', label: '产品团队' },
  { value: 'engineering', label: '工程团队' },
  { value: 'archived', label: '归档项目', disabled: true },
];

export function SelectBasic() {
  return <Select aria-label="选择团队" options={options} placeholder="请选择团队" />;
}
