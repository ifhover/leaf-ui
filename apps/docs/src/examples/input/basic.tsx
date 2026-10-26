import { Form, FormField, Input } from '@ifhover/leaf-ui';

export function InputBasic() {
  return (
    <Form layout="vertical" onSubmit={(event) => event.preventDefault()}>
      <FormField label="项目名称">
        <Input name="project" placeholder="为你的项目起个名字" />
      </FormField>
    </Form>
  );
}
