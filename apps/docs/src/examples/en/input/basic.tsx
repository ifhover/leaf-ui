import { Form, FormField, Input } from '@ifhover/leaf-ui';

export function InputBasic() {
  return (
    <Form layout="vertical" onSubmit={(event) => event.preventDefault()}>
      <FormField label="Project name">
        <Input name="project" placeholder="Name your project" />
      </FormField>
    </Form>
  );
}
