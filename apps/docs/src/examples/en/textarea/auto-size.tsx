import { Form, FormField, Textarea } from '@ifhover/leaf-ui';

export function TextareaAutoHeight() {
  return (
    <Form layout="vertical">
      <FormField label="Project description">
        <Textarea autoSize={{ minRows: 2, maxRows: 6 }} placeholder="Type more content" />
      </FormField>
    </Form>
  );
}
