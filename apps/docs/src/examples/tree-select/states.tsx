import { Form, FormField, TreeSelect } from '@ifhover/leaf-ui';
import { treeOptions } from './options';
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
