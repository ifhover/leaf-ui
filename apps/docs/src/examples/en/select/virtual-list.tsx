import { Select } from '@ifhover/leaf-ui';

const options = Array.from({ length: 5000 }, (_, index) => ({
  value: String(index),
  label: `Item ${index + 1}`,
}));

export function VirtualList() {
  return (
    <Select
      aria-label="Search items"
      options={options}
      placeholder="Search 5000 items"
      showSearch
    />
  );
}
