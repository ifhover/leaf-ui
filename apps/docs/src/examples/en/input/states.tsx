import { Form, FormField, Input } from '@ifhover/leaf-ui';

export function InputStates() {
  return (
    <Form layout="vertical" onSubmit={(event) => event.preventDefault()}>
      <FormField label="Read only">
        <Input defaultValue="Leaf Garden" readOnly />
      </FormField>
      <FormField label="Disabled">
        <Input disabled placeholder="Currently unavailable" />
      </FormField>
      <FormField label="Error" error="Project name is required.">
        <Input placeholder="Enter a project name" />
      </FormField>
      <FormField label="Warning">
        <Input status="warning" defaultValue="A similar name already exists" />
      </FormField>
    </Form>
  );
}
