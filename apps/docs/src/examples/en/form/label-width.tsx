import { Form, FormField, Input } from '@ifhover/leaf-ui';

export function FormLabelWidth() {
  return (
    <Form labelWidth={140}>
      <FormField label="Name">
        <Input name="name" />
      </FormField>
      <FormField label="Work email">
        <Input name="email" />
      </FormField>
      <FormField label="Notes" labelWidth={80}>
        <Input name="notes" />
      </FormField>
    </Form>
  );
}
