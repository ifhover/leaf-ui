import { FormField, InputOTP } from '@ifhover/leaf-ui';

export function InputOTPDisabled() {
  return (
    <FormField layout="vertical" label="Disabled code">
      <InputOTP aria-label="Disabled code" defaultValue="123456" disabled />
    </FormField>
  );
}
