import { Form, FormField, InputMask } from '@ifhover/leaf-ui';

export function InputMaskBasic() {
  return (
    <Form layout="vertical">
      <FormField label="Phone number">
        <InputMask mask="000 0000 0000" placeholder="138 0000 0000" />
      </FormField>
    </Form>
  );
}
