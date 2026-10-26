import { RadioGroup } from '@ifhover/leaf-ui';

export function RadioVertical() {
  return (
    <RadioGroup
      label="Notification frequency"
      direction="vertical"
      defaultValue="daily"
      options={[
        { label: 'Daily', value: 'daily' },
        { label: 'Weekly', value: 'weekly' },
        { label: 'Important messages only', value: 'important' },
      ]}
    />
  );
}
