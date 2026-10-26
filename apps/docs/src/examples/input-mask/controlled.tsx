import { Flex, Form, FormField, InputMask, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function InputMaskControlled() {
  const [value, setValue] = useState('');
  const [formatted, setFormatted] = useState('');

  return (
    <Form layout="vertical">
      <FormField label="联系号码">
        <InputMask
          mask="000 0000 0000"
          placeholder="138 0000 0000"
          unmask
          allowClear
          value={value}
          onChange={(next, display) => {
            setValue(next);
            setFormatted(display);
          }}
        />
      </FormField>
      <Flex direction="column" gap={8} role="status">
        <Text tone="muted">组件值：{value || '空'}</Text>
        <Text tone="muted">显示值：{formatted || '空'}</Text>
      </Flex>
    </Form>
  );
}
