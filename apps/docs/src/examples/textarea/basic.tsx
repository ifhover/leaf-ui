import { Form, FormField, Textarea } from '@ifhover/leaf-ui';

export function TextareaBasic() {
  return (
    <Form layout="vertical">
      <FormField label="项目简介">
        <Textarea name="description" placeholder="描述一下你的新想法" />
      </FormField>
    </Form>
  );
}
