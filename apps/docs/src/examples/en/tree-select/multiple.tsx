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

export function TreeSelectMultiple() {
  return (
    <Form layout="vertical">
      <FormField label="Multiple · Select individual items">
        <TreeSelect options={treeOptions} multiple defaultValue={['visual']} defaultExpandAll />
      </FormField>
      <FormField label="Linked checks · Child values">
        <TreeSelect
          options={treeOptions}
          treeCheckable
          defaultValue={['visual']}
          defaultExpandAll
        />
      </FormField>
      <FormField label="Linked checks · Parent values">
        <TreeSelect
          options={treeOptions}
          treeCheckable
          showCheckedStrategy="parent"
          defaultValue={['design']}
          defaultExpandAll
        />
      </FormField>
    </Form>
  );
}
