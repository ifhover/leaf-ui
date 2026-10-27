import { Form, FormField, Input } from '@ifhover/leaf-ui';

export function FormLabelWidth() {
  return (
    <Form labelWidth={140}>
      <FormField label="姓名">
        <Input name="name" />
      </FormField>
      <FormField label="工作邮箱">
        <Input name="email" />
      </FormField>
      <FormField label="备注" labelWidth={80}>
        <Input name="notes" />
      </FormField>
    </Form>
  );
}
