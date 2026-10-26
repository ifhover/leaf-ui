import { Flex, FormField, InputOTP, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function InputOTPBasic() {
  const [value, setValue] = useState('');
  const [complete, setComplete] = useState(false);

  return (
    <Flex direction="column" align="start" gap={16}>
      <FormField layout="vertical" label="Verification code">
        <InputOTP
          aria-label="Verification code"
          value={value}
          onChange={(next) => {
            setValue(next);
            setComplete(false);
          }}
          onComplete={() => setComplete(true)}
        />
      </FormField>
      <Text tone="muted" role="status">
        {complete ? 'Code complete' : 'Incomplete'}
      </Text>
    </Flex>
  );
}
