import { Form, FormField, Slider } from '@ifhover/leaf-ui';

export function SliderTooltip() {
  return (
    <Form layout="vertical">
      <FormField label="Volume">
        <Slider defaultValue={35} tooltip={{ formatter: (value) => `${value}%` }} />
      </FormField>
    </Form>
  );
}
