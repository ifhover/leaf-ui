import { Flex, FormField, InputOTP, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function InputOTPBasic() {
  const [value, setValue] = useState('');
  const [complete, setComplete] = useState(false);

  return (
    <Flex direction="column" align="start" gap={16}>
      <FormField layout="vertical" label="验证码">
        <InputOTP
          aria-label="验证码"
          value={value}
          onChange={(next) => {
            setValue(next);
            setComplete(false);
          }}
          onComplete={() => setComplete(true)}
        />
      </FormField>
      <Text tone="muted" role="status">
        {complete ? '输入已完成' : '尚未填满'}
      </Text>
    </Flex>
  );
}
