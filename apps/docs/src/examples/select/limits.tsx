import { Select } from '@ifhover/leaf-ui';

const options = [
  { value: 'design', label: '设计工作室' },
  { value: 'product', label: '产品团队' },
  { value: 'engineering', label: '工程团队' },
  { value: 'archived', label: '归档项目', disabled: true },
];

export function SelectLimits() {
  return (
    <Select
      aria-label="最多选择两个团队"
      multiple
      options={options}
      defaultValue={['design', 'product']}
      maxCount={2}
      allowClear
      placeholder="最多选择两个团队"
    />
  );
}
