import { FormField, InputOTP, Text } from '@ifhover/leaf-ui';

export function InputOTPSeparator() {
  return (
    <FormField layout="vertical" label="分组验证码">
      <InputOTP
        aria-label="分组验证码"
        separator={(index) => (index === 2 ? <Text>-</Text> : null)}
      />
    </FormField>
  );
}
