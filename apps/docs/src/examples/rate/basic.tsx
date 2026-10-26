import { FormField, Rate } from '@ifhover/leaf-ui';

export function RateBasic() {
  return (
    <FormField label="项目评分" layout="vertical">
      <Rate defaultValue={3} />
    </FormField>
  );
}
