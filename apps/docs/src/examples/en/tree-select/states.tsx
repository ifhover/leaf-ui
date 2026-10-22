import { Form, FormField, TreeSelect, type TreeSelectOption } from '@ifhover/leaf-ui';

const treeOptions: readonly TreeSelectOption[] = [
  {
    value: 'design',
    label: 'Design',
    selectable: false,
    children: [
      { value: 'visual', label: 'Visual design' },
      { value: 'product', label: 'Product design' },
      { value: 'archive', label: 'Archived team', disabled: true },
    ],
  },
  {
    value: 'engineering',
    label: 'Engineering',
    selectable: false,
    children: [
      { value: 'web', label: 'Frontend' },
      { value: 'server', label: 'Backend' },
    ],
  },
];

export function TreeSelectStates() {
  return (
    <Form layout="vertical">
      <FormField label="Disabled">
        <TreeSelect options={treeOptions} disabled defaultValue="web" />
      </FormField>
      <FormField label="Validation feedback">
        <TreeSelect options={treeOptions} status="error" placeholder="Select a team" />
      </FormField>
      <FormField label="Custom popup width">
        <TreeSelect options={treeOptions} popupWidth={320} popupMaxWidth={360} defaultExpandAll />
      </FormField>
    </Form>
  );
}
