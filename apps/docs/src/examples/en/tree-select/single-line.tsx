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

export function SingleLine() {
  return (
    <Form layout="vertical">
      <FormField label="Multiple values on one line">
        <TreeSelect
          treeCheckable
          tagWrap={false}
          options={treeOptions}
          defaultValue={['visual', 'product', 'web', 'server']}
          treeDefaultExpandedKeys={['design']}
        />
      </FormField>
    </Form>
  );
}
