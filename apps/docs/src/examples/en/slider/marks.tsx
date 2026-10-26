import { Form, FormField, Slider } from '@ifhover/leaf-ui';

export function SliderMarks() {
  return (
    <Form layout="vertical">
      <FormField label="Discount">
        <Slider
          defaultValue={25}
          step={null}
          marks={[
            { value: 0, label: '0' },
            { value: 25, label: '25' },
            { value: 60, label: '60' },
            { value: 100, label: '100' },
          ]}
        />
      </FormField>
    </Form>
  );
}
