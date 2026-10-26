import { Select, Tag } from '@ifhover/leaf-ui';

const options = [
  { value: 'design', label: 'Design studio' },
  { value: 'product', label: 'Product team' },
  { value: 'engineering', label: 'Engineering team' },
  { value: 'archived', label: 'Archived project', disabled: true },
];

export function CustomTags() {
  return (
    <Select
      aria-label="Custom team tags"
      multiple
      defaultValue={['design', 'product']}
      options={options}
      placeholder="Select teams"
      tagRender={(option, remove) => (
        <Tag closable onClose={remove}>
          {option.label}
        </Tag>
      )}
    />
  );
}
