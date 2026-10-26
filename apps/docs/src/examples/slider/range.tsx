import { Form, FormField, Slider } from '@ifhover/leaf-ui';

export function SliderRange() {
  return (
    <Form layout="vertical">
      <FormField label="预算范围">
        <Slider aria-label="预算范围" name="budget" range defaultValue={[20, 70]} />
      </FormField>
    </Form>
  );
}
