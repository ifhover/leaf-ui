import { Form, FormField, Slider } from '@ifhover/leaf-ui';

export function SliderDisabled() {
  return (
    <Form layout="vertical">
      <FormField label="只读">
        <Slider defaultValue={45} readOnly />
      </FormField>
      <FormField label="禁用">
        <Slider defaultValue={45} disabled />
      </FormField>
    </Form>
  );
}
