import { Form, FormField, Slider } from '@ifhover/leaf-ui';

export function SliderBasic() {
  return (
    <Form layout="vertical">
      <FormField label="Volume">
        <Slider name="volume" defaultValue={35} />
      </FormField>
    </Form>
  );
}
