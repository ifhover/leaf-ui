import { Form, FormField, Input } from '@ifhover/leaf-ui';
export function InputStates() {
  return (
    <Form layout="vertical" onSubmit={(event) => event.preventDefault()}>
      <FormField label="Disabled input">
        <Input disabled placeholder="Currently unavailable" />
      </FormField>
      <FormField label="Project name error" error="Project name is required.">
        <Input placeholder="Enter a project name" />
      </FormField>
      <FormField label="Name warning">
        <Input status="warning" defaultValue="A similar name already exists" />
      </FormField>
    </Form>
  );
}
