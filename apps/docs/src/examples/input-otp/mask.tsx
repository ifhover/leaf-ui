import { FormField, InputOTP } from '@ifhover/leaf-ui';

export function InputOTPMask() {
  return (
    <FormField layout="vertical" label="隐藏验证码">
      <InputOTP aria-label="隐藏验证码" mask />
    </FormField>
  );
}
