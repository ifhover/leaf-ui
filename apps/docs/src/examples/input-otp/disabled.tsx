import { FormField, InputOTP } from '@ifhover/leaf-ui';

export function InputOTPDisabled() {
  return (
    <FormField layout="vertical" label="禁用验证码">
      <InputOTP aria-label="禁用验证码" defaultValue="123456" disabled />
    </FormField>
  );
}
