import { Select } from '@ifhover/leaf-ui';

const options = Array.from({ length: 5000 }, (_, index) => ({
  value: String(index),
  label: `项目 ${index + 1}`,
}));

export function VirtualList() {
  return (
    <Select aria-label="搜索项目" options={options} placeholder="搜索 5000 个选项" showSearch />
  );
}
