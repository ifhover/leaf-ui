import { FormField, InputOTP } from '@ifhover/leaf-ui';

export function InputOTPOptions() {
  return (
    <FormField layout="vertical" label="字母数字验证码">
      <InputOTP aria-label="字母数字验证码" mode="alphanumeric" />
    </FormField>
  );
}
