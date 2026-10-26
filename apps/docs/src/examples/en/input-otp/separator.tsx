import { FormField, InputOTP, Text } from '@ifhover/leaf-ui';

export function InputOTPSeparator() {
  return (
    <FormField layout="vertical" label="Grouped code">
      <InputOTP
        aria-label="Grouped code"
        separator={(index) => (index === 2 ? <Text>-</Text> : null)}
      />
    </FormField>
  );
}
