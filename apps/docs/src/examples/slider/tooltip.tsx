import { Form, FormField, Slider } from '@ifhover/leaf-ui';

export function SliderTooltip() {
  return (
    <Form layout="vertical">
      <FormField label="音量">
        <Slider defaultValue={35} tooltip={{ formatter: (value) => `${value}%` }} />
      </FormField>
    </Form>
  );
}
