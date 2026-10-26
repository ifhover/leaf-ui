import { Form, FormField, Textarea } from '@ifhover/leaf-ui';

export function TextareaCount() {
  return (
    <Form layout="vertical">
      <FormField label="Notes">
        <Textarea showCount maxLength={120} defaultValue="Start your plan here." />
      </FormField>
    </Form>
  );
}
