import type { SliderMark } from '@ifhover/leaf-ui';
import { Form, FormField, Slider, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

const marks: SliderMark[] = [
  { value: 0, label: 'Low' },
  { value: 50, label: 'Mid' },
  { value: 100, label: 'High' },
];
export function SliderBasic() {
  const [value, setValue] = useState(35);
  return (
    <Form layout="vertical">
      <FormField label="Volume">
        <Slider aria-label="Volume" value={value} onChange={setValue} marks={marks} />
      </FormField>
      <Text tone="muted">Current value: {value}</Text>
      <FormField label="Budget">
        <Slider aria-label="Budget" range defaultValue={[20, 70]} marks={marks} />
      </FormField>
      <FormField label="Disabled value">
        <Slider aria-label="Disabled value" defaultValue={45} disabled />
      </FormField>
      <FormField label="Vertical value">
        <Slider aria-label="Vertical value" vertical defaultValue={60} />
      </FormField>
    </Form>
  );
}
