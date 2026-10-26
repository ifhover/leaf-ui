import { Form, FormField, Textarea } from '@ifhover/leaf-ui';

export function TextareaAutoHeight() {
  return (
    <Form layout="vertical">
      <FormField label="项目简介">
        <Textarea autoSize={{ minRows: 2, maxRows: 6 }} placeholder="输入更多内容试试" />
      </FormField>
    </Form>
  );
}
