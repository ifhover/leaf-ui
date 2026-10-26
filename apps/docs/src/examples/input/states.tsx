import { Form, FormField, Input } from '@ifhover/leaf-ui';

export function InputStates() {
  return (
    <Form layout="vertical" onSubmit={(event) => event.preventDefault()}>
      <FormField label="只读">
        <Input defaultValue="Leaf Garden" readOnly />
      </FormField>
      <FormField label="禁用">
        <Input disabled placeholder="暂时不可编辑" />
      </FormField>
      <FormField label="错误" error="项目名称不能为空。">
        <Input placeholder="请输入项目名称" />
      </FormField>
      <FormField label="警告">
        <Input status="warning" defaultValue="已经存在相似名称" />
      </FormField>
    </Form>
  );
}
