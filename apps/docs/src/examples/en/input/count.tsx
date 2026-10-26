import { Form, FormField, Input } from '@ifhover/leaf-ui';

export function InputCount() {
  return (
    <Form layout="vertical">
      <FormField label="Default count">
        <Input defaultValue="Leaf Garden" showCount maxLength={30} />
      </FormField>
      <FormField label="Custom count">
        <Input defaultValue="Leaf" showCount={(value) => `${value.length} characters`} />
      </FormField>
    </Form>
  );
}
