import { FormField, Rate } from '@ifhover/leaf-ui';

export function RateHalf() {
  return (
    <FormField label="Project rating" layout="vertical">
      <Rate defaultValue={3.5} allowHalf />
    </FormField>
  );
}
