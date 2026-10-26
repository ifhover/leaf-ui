import { Select } from '@ifhover/leaf-ui';

const options = [
  { value: 'design', label: 'Design studio' },
  { value: 'product', label: 'Product team' },
  { value: 'engineering', label: 'Engineering team' },
  { value: 'archived', label: 'Archived project', disabled: true },
];

export function SelectLimits() {
  return (
    <Select
      aria-label="Choose up to two teams"
      multiple
      options={options}
      defaultValue={['design', 'product']}
      maxCount={2}
      allowClear
      placeholder="Choose up to two teams"
    />
  );
}
