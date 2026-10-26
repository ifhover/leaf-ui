import { Form, FormField, Slider } from '@ifhover/leaf-ui';

export function SliderVertical() {
  return (
    <Form layout="vertical">
      <FormField label="Volume">
        <Slider vertical defaultValue={60} />
      </FormField>
    </Form>
  );
}
