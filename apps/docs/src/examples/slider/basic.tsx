import type { SliderMark } from '@ifhover/leaf-ui';
import { Form, FormField, Slider, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

const marks: SliderMark[] = [
  { value: 0, label: '低' },
  { value: 50, label: '中' },
  { value: 100, label: '高' },
];
export function SliderBasic() {
  const [value, setValue] = useState(35);
  return (
    <Form layout="vertical">
      <FormField label="音量">
        <Slider aria-label="音量" value={value} onChange={setValue} marks={marks} />
      </FormField>
      <Text tone="muted">当前数值：{value}</Text>
      <FormField label="预算">
        <Slider aria-label="预算" range defaultValue={[20, 70]} marks={marks} />
      </FormField>
      <FormField label="禁用数值">
        <Slider aria-label="禁用数值" defaultValue={45} disabled />
      </FormField>
      <FormField label="垂直数值">
        <Slider aria-label="垂直数值" vertical defaultValue={60} />
      </FormField>
    </Form>
  );
}
