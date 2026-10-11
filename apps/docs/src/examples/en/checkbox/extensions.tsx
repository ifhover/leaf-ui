import { CheckboxGroup } from '@ifhover/leaf-ui';
export function ExtensionDemo() {
  return (
    <CheckboxGroup
      legend="Choose 1–2 interests"
      options={['Design', 'Development', 'Photography']}
      defaultValue={['Design']}
      minCount={1}
      maxCount={2}
    />
  );
}
