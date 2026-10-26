import { Form, FormField, Textarea } from '@ifhover/leaf-ui';

export function TextareaStates() {
  return (
    <Form layout="vertical">
      <FormField label="Read only">
        <Textarea defaultValue="The public project description." readOnly />
      </FormField>
      <FormField label="Disabled">
        <Textarea placeholder="Currently unavailable" disabled />
      </FormField>
      <FormField label="Error" error="Add a description.">
        <Textarea placeholder="Add a description" />
      </FormField>
    </Form>
  );
}
