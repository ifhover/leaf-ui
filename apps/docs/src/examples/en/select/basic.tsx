import { Select } from '@ifhover/leaf-ui';

const options = [
  { value: 'design', label: 'Design studio' },
  { value: 'product', label: 'Product team' },
  { value: 'engineering', label: 'Engineering team' },
  { value: 'archived', label: 'Archived project', disabled: true },
];

export function SelectBasic() {
  return <Select aria-label="Choose a team" options={options} placeholder="Select a team" />;
}
