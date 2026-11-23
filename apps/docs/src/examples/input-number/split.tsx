import { Form, FormField, InputNumber } from '@ifhover/leaf-ui';

export function InputNumberSplit() {
  return (
    <Form layout="vertical">
      <FormField label="人数">
        <InputNumber variant="split" min={1} max={10} defaultValue={2} />
      </FormField>
      <FormField label="金额">
        <InputNumber
          variant="split"
          min={0}
          step={0.5}
          precision={2}
          defaultValue={12}
          prefix="¥"
        />
      </FormField>
    </Form>
  );
}
