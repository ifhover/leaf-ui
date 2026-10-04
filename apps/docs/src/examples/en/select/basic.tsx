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
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Choose a team</span>
        <Select aria-label="Choose a team" options={options} placeholder="Select a team" />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Default team</span>
        <Select aria-label="Default team" options={options} defaultValue="design" />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Disabled team</span>
        <Select aria-label="Disabled team" options={options} disabled defaultValue="product" />
      </div>
    </div>
  );
}
