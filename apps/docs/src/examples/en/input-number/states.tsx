import { Form, FormField, InputNumber } from '@ifhover/leaf-ui';

export function InputNumberStates() {
  return (
    <Form layout="vertical">
      <FormField label="Read only">
        <InputNumber defaultValue={12} readOnly />
      </FormField>
      <FormField label="Disabled">
        <InputNumber defaultValue={8} disabled />
      </FormField>
    </Form>
  );
}
