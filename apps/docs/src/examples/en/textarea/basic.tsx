import { Form, FormField, Textarea } from '@ifhover/leaf-ui';

export function TextareaBasic() {
  return (
    <Form layout="vertical">
      <FormField label="Project description">
        <Textarea name="description" placeholder="Describe your new idea" />
      </FormField>
    </Form>
  );
}
