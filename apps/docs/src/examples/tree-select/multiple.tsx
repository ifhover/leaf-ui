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

export function TreeSelectMultiple() {
  return (
    <Form layout="vertical">
      <FormField label="多选 · 逐项选择">
        <TreeSelect options={treeOptions} multiple defaultValue={['visual']} defaultExpandAll />
      </FormField>
      <FormField label="勾选联动 · 提交子节点">
        <TreeSelect
          options={treeOptions}
          treeCheckable
          defaultValue={['visual']}
          defaultExpandAll
        />
      </FormField>
      <FormField label="勾选联动 · 合并显示父节点">
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
