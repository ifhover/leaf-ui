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

export function TreeSelectStates() {
  return (
    <Form layout="vertical">
      <FormField label="禁用">
        <TreeSelect options={treeOptions} disabled defaultValue="web" />
      </FormField>
      <FormField label="校验反馈">
        <TreeSelect options={treeOptions} status="error" placeholder="请选择一个团队" />
      </FormField>
      <FormField label="自定义浮层宽度">
        <TreeSelect options={treeOptions} popupWidth={320} popupMaxWidth={360} defaultExpandAll />
      </FormField>
    </Form>
  );
}
