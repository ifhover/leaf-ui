import { Form, FormField, Input } from '@ifhover/leaf-ui';

export function InputSizes() {
  return (
    <Form layout="vertical">
      <FormField label="小">
        <Input size="sm" placeholder="项目名称" />
      </FormField>
      <FormField label="中">
        <Input size="md" placeholder="项目名称" />
      </FormField>
      <FormField label="大">
        <Input size="lg" placeholder="项目名称" />
      </FormField>
    </Form>
  );
}
