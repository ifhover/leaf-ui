import { Form, FormField, Textarea } from '@ifhover/leaf-ui';

export function TextareaCount() {
  return (
    <Form layout="vertical">
      <FormField label="备注">
        <Textarea showCount maxLength={120} defaultValue="计划从这里开始。" />
      </FormField>
    </Form>
  );
}
