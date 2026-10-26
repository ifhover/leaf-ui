import { RadioGroup } from '@ifhover/leaf-ui';

export function RadioBasic() {
  return (
    <RadioGroup
      label="Choose appearance"
      name="appearance"
      defaultValue="light"
      options={[
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' },
        { label: 'System', value: 'system' },
      ]}
    />
  );
}
