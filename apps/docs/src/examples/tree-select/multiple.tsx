import { Form, FormField, TreeSelect } from '@ifhover/leaf-ui';
import { treeOptions } from './options';
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
