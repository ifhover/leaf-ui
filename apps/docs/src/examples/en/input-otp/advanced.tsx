import { FormField, InputOTP } from '@ifhover/leaf-ui';

export function InputOTPOptions() {
  return (
    <FormField layout="vertical" label="Alphanumeric code">
      <InputOTP aria-label="Alphanumeric code" mode="alphanumeric" />
    </FormField>
  );
}
