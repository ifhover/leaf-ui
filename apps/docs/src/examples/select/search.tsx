import { Select } from '@ifhover/leaf-ui';

const options = [
  { value: 'design', label: '设计工作室' },
  { value: 'product', label: '产品团队' },
  { value: 'engineering', label: '工程团队' },
  { value: 'archived', label: '归档项目', disabled: true },
];

export function SelectSearch() {
  return (
    <Select
      aria-label="搜索团队"
      showSearch
      allowClear
      options={options}
      placeholder="输入团队名称搜索"
    />
  );
}
