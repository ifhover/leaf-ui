import { RadioGroup } from '@ifhover/leaf-ui';

export function RadioVertical() {
  return (
    <RadioGroup
      label="Notification frequency"
      direction="vertical"
      defaultValue="daily"
      options={[
        { label: 'Daily', value: 'daily', description: 'Send a daily unread summary' },
        { label: 'Weekly', value: 'weekly', description: 'Send a weekly digest every Monday' },
        {
          label: 'Important messages only',
          value: 'important',
          description: 'Notify only for mentions and approvals',
        },
      ]}
    />
  );
}
