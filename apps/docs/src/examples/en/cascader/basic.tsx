import { Cascader } from '@sudden3/leaf-ui';

const options = [
  {
    value: 'design',
    label: 'Design',
    children: [
      { value: 'interface', label: 'Interface design' },
      { value: 'brand', label: 'Brand design' },
    ],
  },
  {
    value: 'engineering',
    label: 'Engineering',
    children: [
      { value: 'frontend', label: 'Frontend development' },
      { value: 'backend', label: 'Backend development' },
    ],
  },
  { value: 'archived', label: 'Archived category', disabled: true },
];

export function CascaderBasic() {
  return (
    <div className="leaf-demo-stack">
      <Cascader aria-label="Project category" options={options} placeholder="Choose a category" />
      <Cascader
        aria-label="Default category"
        options={options}
        defaultValue={['design', 'interface']}
      />
      <Cascader aria-label="Disabled category" options={options} disabled />
    </div>
  );
}
