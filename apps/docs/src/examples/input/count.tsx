import { Form, FormField, Input } from '@ifhover/leaf-ui';

export function InputCount() {
  return (
    <Form layout="vertical">
      <FormField label="默认统计">
        <Input defaultValue="Leaf Garden" showCount maxLength={30} />
      </FormField>
      <FormField label="自定义统计">
        <Input defaultValue="Leaf" showCount={(value) => `${value.length} 字`} />
      </FormField>
    </Form>
  );
}
