import { Form, FormField, InputMask } from '@ifhover/leaf-ui';

export function InputMaskBasic() {
  return (
    <Form layout="vertical">
      <FormField label="电话号码">
        <InputMask mask="000 0000 0000" placeholder="138 0000 0000" />
      </FormField>
    </Form>
  );
}
