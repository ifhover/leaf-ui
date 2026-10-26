import { Form, FormField, Slider } from '@ifhover/leaf-ui';

export function SliderRange() {
  return (
    <Form layout="vertical">
      <FormField label="Budget range">
        <Slider aria-label="Budget range" name="budget" range defaultValue={[20, 70]} />
      </FormField>
    </Form>
  );
}
