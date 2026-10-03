import { Select } from '@sudden3/leaf-ui';

const options = [
  { label: 'Design studio', value: 'design' },
  { label: 'Product team', value: 'product' },
  { label: 'Engineering team', value: 'engineering' },
  { label: 'Archived project', value: 'archived', disabled: true },
];

export function SelectBasic() {
  return (
    <div className="leaf-demo-stack">
      <Select aria-label="Choose a team" options={options} placeholder="Select a team" />
      <Select aria-label="Default team" options={options} defaultValue="design" />
      <Select aria-label="Disabled team" options={options} disabled defaultValue="product" />
    </div>
  );
}
