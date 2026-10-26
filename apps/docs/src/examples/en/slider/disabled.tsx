import { Form, FormField, Slider } from '@ifhover/leaf-ui';

export function SliderDisabled() {
  return (
    <Form layout="vertical">
      <FormField label="Read only">
        <Slider defaultValue={45} readOnly />
      </FormField>
      <FormField label="Disabled">
        <Slider defaultValue={45} disabled />
      </FormField>
    </Form>
  );
}
