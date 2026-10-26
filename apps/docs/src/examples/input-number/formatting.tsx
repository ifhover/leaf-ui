import { Form, FormField, InputNumber } from '@ifhover/leaf-ui';

export function InputNumberFormatting() {
  return (
    <Form layout="vertical">
      <FormField label="千分位分组">
        <InputNumber defaultValue={12345.67} precision={2} grouping />
      </FormField>
      <FormField label="自定义百分比">
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
