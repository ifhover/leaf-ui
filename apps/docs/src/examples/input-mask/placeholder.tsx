import { Form, FormField, InputMask } from '@ifhover/leaf-ui';

export function InputMaskPlaceholder() {
  return (
    <Form layout="vertical">
      <FormField label="卡号">
        <InputMask mask="0000 0000 0000 0000" lazy={false} />
      </FormField>
    </Form>
  );
}
