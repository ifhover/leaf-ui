import { Form, FormField, TreeSelect, type TreeSelectOption } from '@ifhover/leaf-ui';

const treeOptions: readonly TreeSelectOption[] = [
  {
    value: 'design',
    label: '设计团队',
    selectable: false,
    children: [
      { value: 'visual', label: '视觉设计' },
      { value: 'product', label: '产品设计' },
      { value: 'archive', label: '归档团队', disabled: true },
    ],
  },
  {
    value: 'engineering',
    label: '研发团队',
    selectable: false,
    children: [
      { value: 'web', label: '前端开发' },
      { value: 'server', label: '服务端开发' },
    ],
  },
];

export function SingleLine() {
  return (
    <Form layout="vertical">
      <FormField label="单行多选">
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
