import { Select } from '@ifhover/leaf-ui';

const options = [
  { value: 'design', label: 'Design studio' },
  { value: 'product', label: 'Product team' },
  { value: 'engineering', label: 'Engineering team' },
  { value: 'archived', label: 'Archived project', disabled: true },
];

export function SelectSearch() {
  return (
    <Select
      aria-label="Search teams"
      showSearch
      allowClear
      options={options}
      placeholder="Type a team name"
    />
  );
}
