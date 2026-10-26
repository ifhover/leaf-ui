import { Form, FormField, Textarea } from '@ifhover/leaf-ui';

export function TextareaStates() {
  return (
    <Form layout="vertical">
      <FormField label="只读">
        <Textarea defaultValue="项目的公开介绍。" readOnly />
      </FormField>
      <FormField label="禁用">
        <Textarea placeholder="暂时不可编辑" disabled />
      </FormField>
      <FormField label="错误" error="请补充描述。">
        <Textarea placeholder="请补充描述" />
      </FormField>
    </Form>
  );
}
