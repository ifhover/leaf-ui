import { Form, FormField, InputNumber } from '@ifhover/leaf-ui';

export function InputNumberFormatting() {
  return (
    <Form layout="vertical">
      <FormField label="Digit grouping">
        <InputNumber defaultValue={12345.67} precision={2} grouping />
      </FormField>
      <FormField label="Custom percentage">
        <InputNumber
          defaultValue={15}
          min={0}
          max={100}
          formatter={(value) => (value == null ? '' : `${value}%`)}
          parser={(text) => text.replace('%', '')}
        />
      </FormField>
    </Form>
  );
}
