import { Form, FormField, InputNumber } from '@ifhover/leaf-ui';

export function InputNumberUnits() {
  return (
    <Form layout="vertical">
      <FormField label="Amount">
        <InputNumber min={0} step={0.1} precision={2} defaultValue={19.9} prefix="$" />
      </FormField>
      <FormField label="Percentage">
        <InputNumber defaultValue={50} min={0} max={100} suffix="%" controls={false} />
      </FormField>
    </Form>
  );
}
