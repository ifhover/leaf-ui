import { Form, FormField, Slider } from '@ifhover/leaf-ui';

export function SliderVertical() {
  return (
    <Form layout="vertical">
      <FormField label="音量">
        <Slider vertical defaultValue={60} />
      </FormField>
    </Form>
  );
}
