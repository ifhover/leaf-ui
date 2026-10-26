import { FormField, Rate } from '@ifhover/leaf-ui';

export function RateBasic() {
  return (
    <FormField label="Project rating" layout="vertical">
      <Rate defaultValue={3} />
    </FormField>
  );
}
