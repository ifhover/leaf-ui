import { Form, FormField, InputNumber } from '@ifhover/leaf-ui';

export function InputNumberStates() {
  return (
    <Form layout="vertical">
      <FormField label="只读">
        <InputNumber defaultValue={12} readOnly />
      </FormField>
      <FormField label="禁用">
        <InputNumber defaultValue={8} disabled />
      </FormField>
    </Form>
  );
}
