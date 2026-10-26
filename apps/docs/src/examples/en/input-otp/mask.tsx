import { FormField, InputOTP } from '@ifhover/leaf-ui';

export function InputOTPMask() {
  return (
    <FormField layout="vertical" label="Masked code">
      <InputOTP aria-label="Masked code" mask />
    </FormField>
  );
}
