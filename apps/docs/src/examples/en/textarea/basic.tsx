import { Form, FormField, Textarea } from '@ifhover/leaf-ui';

export function TextareaBasic() {
  return (
    <Form layout="vertical">
      <FormField label="Project description">
        <Textarea
          aria-label="Project description"
          placeholder="Describe your new idea…"
          rows={3}
          maxLength={200}
        />
      </FormField>
      <FormField label="Read-only introduction">
        <Textarea
          aria-label="Read-only introduction"
          defaultValue="Plant your ideas in the interface."
          readOnly
          rows={2}
        />
      </FormField>
      <FormField label="Disabled introduction">
        <Textarea
          aria-label="Disabled introduction"
          placeholder="Cannot edit right now"
          disabled
          rows={2}
        />
      </FormField>
    </Form>
  );
}
