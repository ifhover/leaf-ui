import { Form, FormField, InputMask } from '@ifhover/leaf-ui';

export function InputMaskFormats() {
  return (
    <Form layout="vertical">
      <FormField label="Identifier">
        <InputMask mask="AA-0000" definitions={{ A: /[A-Z]/ }} placeholder="AB-1234" />
      </FormField>
    </Form>
  );
}
