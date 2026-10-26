import { Form, FormField, Slider } from '@ifhover/leaf-ui';

export function SliderBasic() {
  return (
    <Form layout="vertical">
      <FormField label="音量">
        <Slider name="volume" defaultValue={35} />
      </FormField>
    </Form>
  );
}
