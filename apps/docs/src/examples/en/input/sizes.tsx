import { Form, FormField, Input } from '@ifhover/leaf-ui';

export function InputSizes() {
  return (
    <Form layout="vertical">
      <FormField label="Small">
        <Input size="sm" placeholder="Project name" />
      </FormField>
      <FormField label="Medium">
        <Input size="md" placeholder="Project name" />
      </FormField>
      <FormField label="Large">
        <Input size="lg" placeholder="Project name" />
      </FormField>
    </Form>
  );
}
